-- Transfer receipts show customers' names and bank details, so only admins may read them.
-- Both buckets were public with a read-for-everyone policy, which let anyone holding the app's public key
-- list and download every receipt. The app still stores the same receipt_url; admins open it through a
-- signed link (src/receipts.js). Uploading is unchanged.

update storage.buckets set public = false where id in ('photo-diagnosis-receipts', 'garage-receipts');

drop policy if exists "anyone can view receipts" on storage.objects;
drop policy if exists "pd_receipts_view" on storage.objects;

drop policy if exists "admins read receipts" on storage.objects;
create policy "admins read receipts" on storage.objects for select to authenticated
  using (bucket_id in ('photo-diagnosis-receipts', 'garage-receipts') and public.is_car_admin());
