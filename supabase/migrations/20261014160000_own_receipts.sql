-- Payment security, part 2. Run AFTER the app version that uploads receipts into the user's own
-- folder (<user id>/...) is live; the app before it uploads to the bucket root, which this rejects.

-- 1) Only signed-in (non-guest) users may upload a receipt, and only into their own folder.
--    Before, anyone, even signed out, could upload any file to either receipts bucket.
drop policy if exists "anyone can upload receipts" on storage.objects;
drop policy if exists "pd_receipts_upload" on storage.objects;
drop policy if exists "users upload own receipts" on storage.objects;
create policy "users upload own receipts" on storage.objects for insert to authenticated
  with check (
    bucket_id in ('photo-diagnosis-receipts', 'garage-receipts')
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false)
  );

-- 2) True when url points at a file the caller uploaded to bucket, in their own folder.
--    The app stores receipts by their public-style address: .../storage/v1/object/public/<bucket>/<path>
create or replace function public.is_own_upload(p_bucket text, p_url text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(p_url, '') <> '' and exists (
    select 1 from storage.objects o
    where o.bucket_id = p_bucket
      and o.name = split_part(substring(p_url from '/storage/v1/object/(?:public|sign)/' || p_bucket || '/(.+)$'), '?', 1)
      and (storage.foldername(o.name))[1] = auth.uid()::text
  );
$$;
revoke all on function public.is_own_upload(text, text) from public, anon, authenticated;

-- 3) Buying credits: only the packages the app sells, the requester's own receipt, a receipt
--    used once, and at most 3 requests waiting at a time. Before, any number of credits could be
--    requested, with any link as the "receipt".
create or replace function public.submit_credit_purchase(p_credits_requested integer, p_receipt_url text)
returns uuid language plpgsql security definer set search_path to 'public' as $$
declare v_uid uuid := auth.uid(); new_id uuid;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then raise exception 'sign in required'; end if;
  -- 3 credits = 9 AED, 10 = 25 AED, 25 = 50 AED (PACKAGES in BuyCreditForm.jsx)
  if p_credits_requested is null or p_credits_requested not in (3, 10, 25) then raise exception 'invalid package'; end if;
  if not public.is_own_upload('photo-diagnosis-receipts', p_receipt_url) then raise exception 'receipt must be your own upload'; end if;
  if exists (select 1 from public.credit_purchase_requests where receipt_url = p_receipt_url) then raise exception 'receipt already used'; end if;
  if (select count(*) from public.credit_purchase_requests where user_id = v_uid and status = 'pending') >= 3 then
    raise exception 'too many pending requests';
  end if;
  insert into public.credit_purchase_requests(user_id, credits_requested, receipt_url)
  values (v_uid, p_credits_requested, p_receipt_url)
  returning id into new_id;
  return new_id;
end $$;

-- 4) Paid listings: the same receipt rules (own upload, used once, max 3 waiting), and no guests.
--    Everything else is unchanged.
create or replace function public.submit_garage_listing(p_garage_name text, p_owner_name text, p_phone text, p_address text, p_lat double precision DEFAULT NULL::double precision, p_lng double precision DEFAULT NULL::double precision, p_map_link text DEFAULT NULL::text, p_rank integer DEFAULT 0, p_photo_url text DEFAULT NULL::text, p_receipt_url text DEFAULT NULL::text, p_country text DEFAULT 'uae'::text, p_specialty text DEFAULT 'general'::text)
returns uuid language plpgsql security definer set search_path to 'public' as $$
declare new_id uuid; expected_price integer; safe_specialty text; v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then raise exception 'sign in required'; end if;
  if coalesce(length(trim(p_garage_name)),0)=0 then raise exception 'garage name is required'; end if;
  if coalesce(length(trim(p_owner_name)),0)=0 then raise exception 'owner name is required'; end if;
  if coalesce(length(trim(p_phone)),0)=0 then raise exception 'phone is required'; end if;
  if coalesce(length(trim(p_address)),0)=0 then raise exception 'address is required'; end if;
  if p_rank not in (0,1,2,3) then raise exception 'invalid rank'; end if;
  if p_country not in ('uae','saudi','egypt') then raise exception 'invalid country'; end if;
  if p_photo_url is null or length(trim(p_photo_url))=0 then raise exception 'garage photo is required'; end if;
  if not public.is_own_upload('garage-receipts', p_receipt_url) then raise exception 'receipt must be your own upload'; end if;
  if exists (select 1 from public.garage_listings where receipt_url = p_receipt_url)
     or exists (select 1 from public.rental_listings where receipt_url = p_receipt_url) then raise exception 'receipt already used'; end if;
  if (select count(*) from public.garage_listings where user_id = v_uid and status = 'pending') >= 3 then raise exception 'too many pending requests'; end if;
  safe_specialty := case when p_specialty in ('engine','electrical','ac','brakes','general') then p_specialty else 'general' end;
  expected_price := case p_rank when 1 then 10000 when 2 then 7000 when 3 then 4000 else 2000 end;
  insert into public.garage_listings(user_id,garage_name,owner_name,phone,address,lat,lng,map_link,rank,price,photo_url,receipt_url,status,country,specialty)
  values(v_uid,trim(p_garage_name),trim(p_owner_name),trim(p_phone),trim(p_address),p_lat,p_lng,nullif(trim(coalesce(p_map_link,'')),''),p_rank,expected_price,p_photo_url,p_receipt_url,'pending',p_country,safe_specialty)
  returning id into new_id;
  return new_id;
end $$;

create or replace function public.submit_rental_listing(p_rental_name text, p_owner_name text, p_phone text, p_address text, p_lat double precision DEFAULT NULL::double precision, p_lng double precision DEFAULT NULL::double precision, p_map_link text DEFAULT NULL::text, p_rank integer DEFAULT 0, p_photo_url text DEFAULT NULL::text, p_receipt_url text DEFAULT NULL::text, p_country text DEFAULT 'uae'::text, p_photo_urls text[] DEFAULT NULL::text[])
returns uuid language plpgsql security definer set search_path to 'public' as $$
declare new_id uuid; expected_price integer; v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then raise exception 'sign in required'; end if;
  if coalesce(length(trim(p_rental_name)),0)=0 then raise exception 'rental name is required'; end if;
  if coalesce(length(trim(p_owner_name)),0)=0 then raise exception 'owner name is required'; end if;
  if coalesce(length(trim(p_phone)),0)=0 then raise exception 'phone is required'; end if;
  if coalesce(length(trim(p_address)),0)=0 then raise exception 'address is required'; end if;
  if p_rank not in (0,1,2,3) then raise exception 'invalid rank'; end if;
  if p_country not in ('uae','ksa','egypt') then raise exception 'invalid country'; end if;
  if p_photo_url is null or length(trim(p_photo_url))=0 then raise exception 'rental photo is required'; end if;
  if not public.is_own_upload('garage-receipts', p_receipt_url) then raise exception 'receipt must be your own upload'; end if;
  if exists (select 1 from public.rental_listings where receipt_url = p_receipt_url)
     or exists (select 1 from public.garage_listings where receipt_url = p_receipt_url) then raise exception 'receipt already used'; end if;
  if (select count(*) from public.rental_listings where user_id = v_uid and status = 'pending') >= 3 then raise exception 'too many pending requests'; end if;
  expected_price := case p_rank when 1 then 10000 when 2 then 7000 when 3 then 4000 else 0 end;
  insert into public.rental_listings(user_id,rental_name,owner_name,phone,address,lat,lng,map_link,rank,price,photo_url,receipt_url,status,country,photo_urls)
  values(v_uid,trim(p_rental_name),trim(p_owner_name),trim(p_phone),trim(p_address),p_lat,p_lng,nullif(trim(coalesce(p_map_link,'')),''),p_rank,expected_price,p_photo_url,p_receipt_url,'pending',p_country,p_photo_urls)
  returning id into new_id;
  return new_id;
end $$;

-- create or replace keeps the existing grants; restate them so this file stands on its own
revoke execute on function public.submit_credit_purchase(integer, text) from public, anon;
grant execute on function public.submit_credit_purchase(integer, text) to authenticated, service_role;
revoke execute on function public.submit_garage_listing(text, text, text, text, double precision, double precision, text, integer, text, text, text, text) from public, anon;
grant execute on function public.submit_garage_listing(text, text, text, text, double precision, double precision, text, integer, text, text, text, text) to authenticated, service_role;
revoke execute on function public.submit_rental_listing(text, text, text, text, double precision, double precision, text, integer, text, text, text, text[]) from public, anon;
grant execute on function public.submit_rental_listing(text, text, text, text, double precision, double precision, text, integer, text, text, text, text[]) to authenticated, service_role;
