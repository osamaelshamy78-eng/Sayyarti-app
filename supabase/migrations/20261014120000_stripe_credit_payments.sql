-- Card payments for diagnosis / valuation credits through Stripe Checkout.
-- The sayyarti-stripe-webhook edge function calls stripe_credit_purchase once Stripe confirms a payment; the Checkout
-- session id is the primary key, so a webhook Stripe delivers twice still adds the credits only once.

create table if not exists public.stripe_credit_payments (
  session_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  credits int not null,
  amount_aed int not null,
  created_at timestamptz not null default now()
);
alter table public.stripe_credit_payments enable row level security;
drop policy if exists "own stripe payments" on public.stripe_credit_payments;
create policy "own stripe payments" on public.stripe_credit_payments for select to authenticated using (user_id = auth.uid());

create or replace function public.stripe_credit_purchase(p_session text, p_uid uuid, p_credits int, p_amount_aed int)
returns json language plpgsql security definer set search_path to 'public' as $$
begin
  if p_credits not in (3, 10, 25) then raise exception 'invalid package'; end if;
  insert into public.stripe_credit_payments(session_id, user_id, credits, amount_aed)
  values (p_session, p_uid, p_credits, p_amount_aed) on conflict (session_id) do nothing;
  if not found then return json_build_object('ok', true, 'duplicate', true); end if;
  insert into public.user_credits(user_id, credits_remaining) values (p_uid, p_credits)
  on conflict (user_id) do update set credits_remaining = public.user_credits.credits_remaining + p_credits, updated_at = now();
  return json_build_object('ok', true, 'credits', p_credits);
end $$;
revoke all on function public.stripe_credit_purchase(text, uuid, int, int) from public, anon, authenticated;
grant execute on function public.stripe_credit_purchase(text, uuid, int, int) to service_role;
