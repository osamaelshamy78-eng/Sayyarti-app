-- Plays a customer, an attacker, a guest, a signed-out visitor and the admin against the payment
-- functions and receipt storage, and prints what each could do. See payment_replica.sql.
create or replace function pg_temp.as_user(p_sub text, p_anon boolean default false) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', case when p_sub is null then '{"role":"anon"}' else json_build_object('sub', p_sub, 'role', 'authenticated', 'is_anonymous', p_anon)::text end, false);
  execute case when p_sub is null then 'set role anon' else 'set role authenticated' end;
end $$;

do $t$
declare
  u1 text := '11111111-1111-1111-1111-111111111111';
  u2 text := '22222222-2222-2222-2222-222222222222';
  adm text := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  base text := 'https://fgexzguyjgbwvvqoakly.supabase.co/storage/v1/object/public/';
  tag text := to_char(clock_timestamp(), 'HH24MISSUS');
  n int; v text;
begin
  -- every run starts with no requests waiting
  delete from public.credit_purchase_requests; delete from public.rental_listings;
  -- CURRENT APP: uploads to the bucket root, then submits that address
  perform pg_temp.as_user(u1);
  begin insert into storage.objects(bucket_id, name) values ('photo-diagnosis-receipts', 'root_' || tag || '.jpg');
        perform public.submit_credit_purchase(10, base || 'photo-diagnosis-receipts/root_' || tag || '.jpg');
        raise notice 'current app purchase flow (root upload)      : works';
  exception when others then raise notice 'current app purchase flow (root upload)      : FAILS (%)', sqlerrm; end;
  reset role;

  -- NEW APP: uploads into the user's folder, then submits that address
  perform pg_temp.as_user(u1);
  begin insert into storage.objects(bucket_id, name) values ('photo-diagnosis-receipts', u1 || '/new_' || tag || '.jpg');
        perform public.submit_credit_purchase(10, base || 'photo-diagnosis-receipts/' || u1 || '/new_' || tag || '.jpg');
        raise notice 'new app purchase flow (own folder)           : works';
  exception when others then raise notice 'new app purchase flow (own folder)           : FAILS (%)', sqlerrm; end;
  begin insert into storage.objects(bucket_id, name) values ('garage-receipts', u1 || '/r_' || tag || '.jpg');
        perform public.submit_rental_listing('Fast Rent', 'Ali', '050', 'Dubai', null, null, null, 1, 'https://x/p.jpg', base || 'garage-receipts/' || u1 || '/r_' || tag || '.jpg', 'uae', null);
        raise notice 'new app paid rental listing                  : works';
  exception when others then raise notice 'new app paid rental listing                  : FAILS (%)', sqlerrm; end;

  -- ATTACKS by a signed-in user
  begin perform public.submit_credit_purchase(1000000, base || 'photo-diagnosis-receipts/' || u1 || '/new_' || tag || '.jpg');
        raise notice 'ask for 1,000,000 credits                    : ALLOWED';
  exception when others then raise notice 'ask for 1,000,000 credits                    : blocked'; end;
  begin perform public.submit_credit_purchase(10, 'https://anything.example/fake.jpg');
        raise notice 'any outside link as the receipt              : ALLOWED';
  exception when others then raise notice 'any outside link as the receipt              : blocked'; end;
  begin perform public.submit_credit_purchase(10, base || 'photo-diagnosis-receipts/' || u1 || '/new_' || tag || '.jpg');
        raise notice 'reuse the same receipt                       : ALLOWED';
  exception when others then raise notice 'reuse the same receipt                       : blocked'; end;
  begin insert into storage.objects(bucket_id, name) values ('photo-diagnosis-receipts', u2 || '/planted_' || tag || '.jpg');
        raise notice 'upload into another user''s folder            : ALLOWED';
  exception when others then raise notice 'upload into another user''s folder            : blocked'; end;
  select count(*) into n from storage.objects where bucket_id in ('photo-diagnosis-receipts','garage-receipts') and coalesce((storage.foldername(name))[1], '') <> u1;
  raise notice 'other people''s receipts this user can list   : %', n;
  begin update public.user_credits set credits_remaining = 999; get diagnostics n = row_count;
        raise notice 'edit own balance directly                    : % rows changed', n;
  exception when others then raise notice 'edit own balance directly                    : blocked'; end;
  begin perform public.admin_approve_credit_purchase(gen_random_uuid());
        raise notice 'approve a request (not admin)                : ALLOWED';
  exception when others then raise notice 'approve a request (not admin)                : blocked'; end;
  begin v := public.refund_photo_credit('KRJ-TEST')::text;
        raise notice 'signed-in: add credit to a KRJ code          : ALLOWED (balance now %)', v;
  exception when others then raise notice 'signed-in: add credit to a KRJ code          : blocked'; end;
  reset role;

  -- guest (anonymous sign-in) and signed-out callers
  perform pg_temp.as_user(u1, true);
  begin insert into storage.objects(bucket_id, name) values ('photo-diagnosis-receipts', u1 || '/guest_' || tag || '.jpg');
        raise notice 'guest uploads a receipt                      : ALLOWED';
  exception when others then raise notice 'guest uploads a receipt                      : blocked'; end;
  reset role;
  perform pg_temp.as_user(null);
  begin insert into storage.objects(bucket_id, name) values ('photo-diagnosis-receipts', 'anon_' || tag || '.jpg');
        raise notice 'signed out: upload a file                    : ALLOWED';
  exception when others then raise notice 'signed out: upload a file                    : blocked'; end;
  select count(*) into n from storage.objects where bucket_id in ('photo-diagnosis-receipts','garage-receipts');
  raise notice 'signed out: receipts visible                 : %', n;
  begin v := public.refund_photo_credit('KRJ-TEST')::text;
        raise notice 'signed out: add credit to a KRJ code         : ALLOWED (balance now %)', v;
  exception when others then raise notice 'signed out: add credit to a KRJ code         : blocked'; end;
  begin perform public.admin_delete_car(gen_random_uuid());
        raise notice 'signed out: reach an admin function          : reached (stopped inside)';
  exception when insufficient_privilege then raise notice 'signed out: reach an admin function          : blocked at the door';
            when others then raise notice 'signed out: reach an admin function          : reached (stopped inside: %)', sqlerrm; end;
  begin perform 1 from public.garage_directory limit 1; perform 1 from public.rental_listings limit 1;
        raise notice 'signed out: public garage directory          : works';
  exception when others then raise notice 'signed out: public garage directory          : FAILS (%)', sqlerrm; end;
  reset role;

  -- the admin still works
  perform pg_temp.as_user(adm);
  select count(*) into n from storage.objects where bucket_id in ('photo-diagnosis-receipts','garage-receipts');
  raise notice 'admin: receipts visible                      : %', n;
  begin perform public.admin_approve_credit_purchase((select id from public.credit_purchase_requests where status = 'pending' order by created_at desc limit 1));
        raise notice 'admin: approve a request                     : works';
  exception when others then raise notice 'admin: approve a request                     : FAILS (%)', sqlerrm; end;
  reset role;
end $t$;
