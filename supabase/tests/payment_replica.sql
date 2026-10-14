-- Offline replica of the Sayyarti Supabase project's payment pieces (roles, auth.uid(), storage,
-- receipt policies, credit/listing tables and functions as they were live on 2026-10-14), for
-- testing payment migrations without touching the real database.
--
-- Run against an empty local Postgres 16:
--   psql -f supabase/tests/payment_replica.sql
--   psql -f supabase/tests/payment_attacks.sql                      -- holes before the fix
--   psql -f supabase/migrations/20261014150000_payment_lockdown.sql
--   psql -f supabase/tests/payment_attacks.sql                      -- after part 1
--   psql -f supabase/migrations/20261014160000_own_receipts.sql
--   psql -f supabase/tests/payment_attacks.sql                      -- after part 2
create extension if not exists pgcrypto;
do $$ begin
  -- roles are server-wide: skip any that an earlier run already made
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;
grant usage on schema public to anon, authenticated, service_role;
-- Supabase's defaults: new functions are executable by everyone, tables fully granted (RLS decides)
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;

create schema auth;
grant usage on schema auth to anon, authenticated, service_role;
create table auth.users (id uuid primary key, created_at timestamptz default now());
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
create function auth.uid() returns uuid language sql stable as $$ select nullif(auth.jwt() ->> 'sub', '')::uuid $$;
grant execute on all functions in schema auth to anon, authenticated, service_role;

create schema storage;
grant usage on schema storage to anon, authenticated, service_role;
create table storage.buckets (id text primary key, public boolean default false, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id), name text, owner uuid default auth.uid(), created_at timestamptz default now(), unique (bucket_id, name));
alter table storage.objects enable row level security;
grant all on storage.objects, storage.buckets to anon, authenticated, service_role;
create function storage.foldername(name text) returns text[] language plpgsql immutable as $$
declare _parts text[]; begin select string_to_array(name, '/') into _parts; return _parts[1:array_length(_parts,1)-1]; end $$;
grant execute on function storage.foldername(text) to anon, authenticated, service_role;
insert into storage.buckets(id, public) values ('photo-diagnosis-receipts', true), ('garage-receipts', true), ('garage-photos', true);
-- the receipt policies as they are live today
create policy "anyone can upload receipts" on storage.objects for insert to public with check (bucket_id = 'garage-receipts');
create policy "anyone can view receipts" on storage.objects for select to public using (bucket_id = 'garage-receipts');
create policy "pd_receipts_upload" on storage.objects for insert to public with check (bucket_id = 'photo-diagnosis-receipts');
create policy "pd_receipts_view" on storage.objects for select to public using (bucket_id = 'photo-diagnosis-receipts');

create table public.admin_users (id uuid primary key, is_active boolean default true);
create table public.user_credits (user_id uuid primary key, credits_remaining int not null default 0, free_diagnosis_used boolean default false, free_valuation_used boolean default false, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.credit_purchase_requests (id uuid primary key default gen_random_uuid(), user_id uuid, credits_requested int, receipt_url text, status text default 'pending', created_at timestamptz default now(), reviewed_at timestamptz);
create table public.garage_listings (id uuid primary key default gen_random_uuid(), user_id uuid, garage_name text, owner_name text, phone text, address text, lat float8, lng float8, map_link text, rank int, price int, photo_url text, receipt_url text, status text, country text, specialty text, created_at timestamptz default now());
create table public.rental_listings (id uuid primary key default gen_random_uuid(), user_id uuid, rental_name text, owner_name text, phone text, address text, lat float8, lng float8, map_link text, rank int, price int, photo_url text, photo_urls text[], receipt_url text, status text, country text, created_at timestamptz default now());
create table public.photo_diagnosis_codes (code text primary key, whatsapp_number text, credits_remaining int, is_active boolean default true, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.car_listings (id uuid primary key default gen_random_uuid(), photo_url text, photo_urls text[]);
alter table public.admin_users enable row level security;
alter table public.user_credits enable row level security;
alter table public.credit_purchase_requests enable row level security;
alter table public.garage_listings enable row level security;
alter table public.rental_listings enable row level security;
alter table public.photo_diagnosis_codes enable row level security;
alter table public.car_listings enable row level security;

-- functions, as live
CREATE FUNCTION public.is_car_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ select exists (select 1 from public.admin_users where id = auth.uid() and is_active = true); $$;
create policy "admin_users_self_select" on public.admin_users for select to authenticated using (id = auth.uid());
create policy "users can view their own credits" on public.user_credits for select to authenticated using (user_id = auth.uid());
create policy "admins can view all credits" on public.user_credits for select to authenticated using (is_car_admin());
create policy "admins can view all purchase requests" on public.credit_purchase_requests for select to authenticated using (is_car_admin());
create policy "users can view their own purchase requests" on public.credit_purchase_requests for select to authenticated using (user_id = auth.uid());
create policy "Admins can read all rental listings" on public.rental_listings for select to public using (is_car_admin());
create view public.garage_directory as select id, garage_name, address, country from public.garage_listings where status = 'approved';
grant select on public.garage_directory to anon, authenticated;

CREATE FUNCTION public.consume_photo_credit(p_code text) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
declare new_balance integer; begin
  update public.photo_diagnosis_codes set credits_remaining = credits_remaining - 1, updated_at = now()
  where upper(trim(code)) = upper(trim(p_code)) and is_active = true and credits_remaining > 0 returning credits_remaining into new_balance;
  if new_balance is null then return -1; end if; return new_balance; end; $$;
CREATE FUNCTION public.refund_photo_credit(p_code text) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
declare new_balance integer; begin
  update public.photo_diagnosis_codes set credits_remaining = credits_remaining + 1, updated_at = now()
  where upper(trim(code)) = upper(trim(p_code)) and is_active = true returning credits_remaining into new_balance;
  return coalesce(new_balance, -1); end; $$;
-- live (KRJ codes are anon-only today)
revoke execute on function public.consume_photo_credit(text), public.refund_photo_credit(text) from authenticated;
CREATE FUNCTION public.submit_photo_diagnosis_request(p_whatsapp_number text, p_package_credits integer, p_receipt_url text) RETURNS uuid LANGUAGE sql SECURITY DEFINER AS $$ select gen_random_uuid() $$;
CREATE FUNCTION public.rls_auto_enable() RETURNS void LANGUAGE sql SECURITY DEFINER AS $$ select $$;
CREATE FUNCTION public.submit_garage_listing(p_garage_name text, p_owner_name text, p_phone text, p_address text, p_lat double precision DEFAULT NULL, p_lng double precision DEFAULT NULL, p_map_link text DEFAULT NULL, p_rank integer DEFAULT 0, p_photo_url text DEFAULT NULL, p_receipt_url text DEFAULT NULL, p_country text DEFAULT 'uae') RETURNS uuid LANGUAGE sql SECURITY DEFINER AS $$ select gen_random_uuid() $$;
CREATE FUNCTION public.submit_garage_listing(p_garage_name text, p_owner_name text, p_phone text, p_address text, p_lat double precision DEFAULT NULL, p_lng double precision DEFAULT NULL, p_map_link text DEFAULT NULL, p_rank integer DEFAULT 0, p_photo_url text DEFAULT NULL, p_receipt_url text DEFAULT NULL, p_country text DEFAULT 'uae', p_specialty text DEFAULT 'general') RETURNS uuid LANGUAGE sql SECURITY DEFINER AS $$ select gen_random_uuid() $$;
CREATE FUNCTION public.submit_rental_listing(p_rental_name text, p_owner_name text, p_phone text, p_address text, p_lat double precision DEFAULT NULL, p_lng double precision DEFAULT NULL, p_map_link text DEFAULT NULL, p_rank integer DEFAULT 0, p_photo_url text DEFAULT NULL, p_receipt_url text DEFAULT NULL, p_country text DEFAULT 'uae') RETURNS uuid LANGUAGE sql SECURITY DEFINER AS $$ select gen_random_uuid() $$;
CREATE FUNCTION public.submit_rental_listing(p_rental_name text, p_owner_name text, p_phone text, p_address text, p_lat double precision DEFAULT NULL, p_lng double precision DEFAULT NULL, p_map_link text DEFAULT NULL, p_rank integer DEFAULT 0, p_photo_url text DEFAULT NULL, p_receipt_url text DEFAULT NULL, p_country text DEFAULT 'uae', p_photo_urls text[] DEFAULT NULL) RETURNS uuid LANGUAGE sql SECURITY DEFINER AS $$ select gen_random_uuid() $$;
CREATE FUNCTION public.submit_credit_purchase(p_credits_requested integer, p_receipt_url text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
declare v_uid uuid := auth.uid(); new_id uuid; begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then raise exception 'sign in required'; end if;
  if p_credits_requested is null or p_credits_requested <= 0 then raise exception 'invalid credits amount'; end if;
  if p_receipt_url is null or length(trim(p_receipt_url)) = 0 then raise exception 'receipt is required'; end if;
  insert into public.credit_purchase_requests(user_id, credits_requested, receipt_url) values (v_uid, p_credits_requested, p_receipt_url) returning id into new_id;
  return new_id; end; $$;
revoke execute on function public.submit_credit_purchase(integer, text) from anon;
CREATE FUNCTION public.admin_approve_credit_purchase(p_request_id uuid) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
declare v_row public.credit_purchase_requests%rowtype; v_new_balance integer; begin
  if not public.is_car_admin() then raise exception 'not authorized'; end if;
  select * into v_row from public.credit_purchase_requests where id = p_request_id for update;
  if not found then raise exception 'request not found'; end if;
  if v_row.status <> 'pending' then raise exception 'request already processed'; end if;
  insert into public.user_credits(user_id, credits_remaining) values (v_row.user_id, v_row.credits_requested)
  on conflict (user_id) do update set credits_remaining = public.user_credits.credits_remaining + v_row.credits_requested, updated_at = now();
  update public.credit_purchase_requests set status = 'approved', reviewed_at = now() where id = p_request_id;
  select credits_remaining into v_new_balance from public.user_credits where user_id = v_row.user_id;
  return v_new_balance; end; $$;
revoke execute on function public.admin_approve_credit_purchase(uuid) from anon;
CREATE FUNCTION public.admin_delete_car(p_id uuid) RETURNS TABLE(photo_url text, photo_urls text[]) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
begin if not public.is_car_admin() then raise exception 'not authorized'; end if; return query select null::text, null::text[]; end; $$;

-- people
insert into auth.users(id) values ('11111111-1111-1111-1111-111111111111'), ('22222222-2222-2222-2222-222222222222'), ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
insert into public.admin_users(id) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
insert into public.photo_diagnosis_codes(code, credits_remaining) values ('KRJ-TEST', 2);
insert into storage.objects(bucket_id, name, owner) values ('photo-diagnosis-receipts', '1700000000_old.jpg', null);
