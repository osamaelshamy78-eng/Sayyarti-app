// Deploy with JWT verification off (Stripe calls it, not a signed-in user):
//   supabase functions deploy sayyarti-stripe-webhook --no-verify-jwt
// Every request is checked against STRIPE_WEBHOOK_SECRET instead.
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17.7.0";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { httpClient: Stripe.createFetchHttpClient() });
const crypto = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method", { status: 405 });
  const sig = req.headers.get("stripe-signature") || "";
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, Deno.env.get("STRIPE_WEBHOOK_SECRET")!, undefined, crypto);
  } catch (e) {
    console.error("bad signature", e);
    return new Response("bad signature", { status: 400 });
  }

  // "completed" fires for card payments; "async_payment_succeeded" for methods that settle later.
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const s = event.data.object as Stripe.Checkout.Session;
    // one Stripe account serves several apps: only Sayyarti's own sessions add Sayyarti credits
    if (s.metadata?.app !== "sayyarti" || s.payment_status !== "paid") return new Response("ignored");
    const { error } = await admin.rpc("stripe_credit_purchase", {
      p_session: s.id,
      p_uid: s.metadata.user_id,
      p_credits: Number(s.metadata.credits),
      p_amount_aed: Math.round((s.amount_total || 0) / 100),
    });
    // a failure makes Stripe retry the webhook later; the session id keeps the retry from double-crediting
    if (error){ console.error("credit failed", s.id, error); return new Response("credit failed", { status: 500 }); }
  }
  return new Response("ok");
});
