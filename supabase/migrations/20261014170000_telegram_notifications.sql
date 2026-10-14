-- Admin notifications move from the browser (EmailJS, whose key anyone could read and spend) to
-- the database: a new pending credit request or paid listing sends a Telegram message.
-- It only fires for rows that passed the submit_* checks, so it can't be used to spam.
--
-- The bot token and chat id live in Vault, never in the repo or the app:
--   select vault.create_secret('<bot token>', 'telegram_bot_token');
--   select vault.create_secret('<chat id>',   'telegram_chat_id');
-- Until both exist, nothing is sent.

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_admin_telegram()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  r jsonb := to_jsonb(new);
  v_token text;
  v_chat text;
  v_email text;
  v_text text;
begin
  select decrypted_secret into v_token from vault.decrypted_secrets where name = 'telegram_bot_token';
  select decrypted_secret into v_chat from vault.decrypted_secrets where name = 'telegram_chat_id';
  if coalesce(v_token, '') = '' or coalesce(v_chat, '') = '' then return new; end if;

  select email into v_email from auth.users where id = new.user_id;

  if tg_table_name = 'credit_purchase_requests' then
    v_text := '💳 طلب شراء كريديتس جديد' || chr(10)
      || 'المستخدم: ' || coalesce(v_email, '-') || chr(10)
      || 'الباقة: ' || (r ->> 'credits_requested') || ' كريديت — '
      || case (r ->> 'credits_requested')::int when 3 then '9' when 10 then '25' when 25 then '50' else '?' end || ' درهم';
  elsif tg_table_name = 'garage_listings' then
    v_text := '🔧 طلب إضافة جراج جديد' || chr(10)
      || 'الجراج: ' || coalesce(r ->> 'garage_name', '-') || chr(10)
      || 'المالك: ' || coalesce(r ->> 'owner_name', '-') || chr(10)
      || 'الموبايل: ' || coalesce(r ->> 'phone', '-') || chr(10)
      || 'العنوان: ' || coalesce(r ->> 'address', '-') || chr(10)
      || 'الترتيب: ' || coalesce(r ->> 'rank', '-') || ' — السعر: ' || coalesce(r ->> 'price', '-');
  else
    v_text := '🚗 طلب إضافة مكتب تأجير جديد' || chr(10)
      || 'المكتب: ' || coalesce(r ->> 'rental_name', '-') || chr(10)
      || 'المالك: ' || coalesce(r ->> 'owner_name', '-') || chr(10)
      || 'الموبايل: ' || coalesce(r ->> 'phone', '-') || chr(10)
      || 'العنوان: ' || coalesce(r ->> 'address', '-') || chr(10)
      || 'الترتيب: ' || coalesce(r ->> 'rank', '-') || ' — السعر: ' || coalesce(r ->> 'price', '-');
  end if;
  v_text := v_text || chr(10) || 'راجع الإيصال من لوحة التحكم.';

  -- pg_net queues the request and sends it after the transaction commits
  perform net.http_post(
    url := 'https://api.telegram.org/bot' || v_token || '/sendMessage',
    body := jsonb_build_object('chat_id', v_chat, 'text', v_text, 'disable_web_page_preview', true)
  );
  return new;
exception when others then
  -- a failed notification must never block a purchase or a listing
  return new;
end $$;

revoke all on function public.notify_admin_telegram() from public, anon, authenticated;

drop trigger if exists notify_admin_telegram on public.credit_purchase_requests;
create trigger notify_admin_telegram after insert on public.credit_purchase_requests
  for each row when (new.status = 'pending') execute function public.notify_admin_telegram();

drop trigger if exists notify_admin_telegram on public.garage_listings;
create trigger notify_admin_telegram after insert on public.garage_listings
  for each row when (new.status = 'pending') execute function public.notify_admin_telegram();

drop trigger if exists notify_admin_telegram on public.rental_listings;
create trigger notify_admin_telegram after insert on public.rental_listings
  for each row when (new.status = 'pending') execute function public.notify_admin_telegram();
