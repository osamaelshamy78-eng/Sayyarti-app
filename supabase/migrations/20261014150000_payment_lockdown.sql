-- Payment security, part 1. Safe to run while the current app is live: nothing it does depends on
-- what this closes. (Replaces 20261014140000_private_receipts.sql, which it includes.)

-- 1) Transfer receipts show customers' names and bank details: only admins, and the customer
--    who uploaded one, may read them. Both buckets were public and readable by anyone.
update storage.buckets
set public = false,
    file_size_limit = 10485760, -- 10 MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
where id in ('photo-diagnosis-receipts', 'garage-receipts');

drop policy if exists "anyone can view receipts" on storage.objects;
drop policy if exists "pd_receipts_view" on storage.objects;
drop policy if exists "admins read receipts" on storage.objects;
create policy "admins read receipts" on storage.objects for select to authenticated
  using (bucket_id in ('photo-diagnosis-receipts', 'garage-receipts') and public.is_car_admin());
drop policy if exists "users read own receipts" on storage.objects;
create policy "users read own receipts" on storage.objects for select to authenticated
  using (bucket_id in ('photo-diagnosis-receipts', 'garage-receipts') and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 2) The old KRJ code credits. refund_photo_credit let anyone, signed in or not, add a credit to
--    any code as often as they liked. Nothing in the app calls these; only server code may.
revoke execute on function public.consume_photo_credit(text) from public, anon, authenticated;
revoke execute on function public.refund_photo_credit(text) from public, anon, authenticated;
grant execute on function public.consume_photo_credit(text) to service_role;
grant execute on function public.refund_photo_credit(text) to service_role;

-- 3) Old flows the app no longer calls, which anyone could still call.
revoke execute on function public.submit_photo_diagnosis_request(text, integer, text) from public, anon, authenticated;
revoke execute on function public.submit_garage_listing(text, text, text, text, double precision, double precision, text, integer, text, text, text) from public, anon, authenticated;
revoke execute on function public.submit_rental_listing(text, text, text, text, double precision, double precision, text, integer, text, text, text) from public, anon, authenticated;
-- an event-trigger helper, never meant to be called through the API
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- 4) Admin actions and sign-in-only requests: no reason for a signed-out caller to reach them.
--    (Each one already checks is_car_admin() or auth.uid() inside; this closes the door earlier.)
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname ~ '^(admin_|get_(garage|rental|photo_diagnosis)_|set_(garage|rental|photo_diagnosis)_|generate_photo_|mark_photo_|delete_photo_|submit_(car|free_garage|garage|rental)_listing$)'
      and has_function_privilege('authenticated', p.oid, 'execute')
  loop
    execute format('revoke execute on function %s from public, anon', f.sig);
    execute format('grant execute on function %s to authenticated, service_role', f.sig);
  end loop;
end $$;
