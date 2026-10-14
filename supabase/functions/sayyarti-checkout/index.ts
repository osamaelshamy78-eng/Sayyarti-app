import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17.7.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

// credits -> price in AED. The price is decided here, never by the app.
const PACKAGES: Record<number, number> = { 3: 9, 10: 25, 25: 50 };

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { httpClient: Stripe.createFetchHttpClient() });

// Stripe sends the buyer back to where they paid from (so a Vercel preview returns to itself);
// anything that isn't a real https site falls back to the SITE_URL secret.
function returnBase(req: Request) {
  const o = req.headers.get("origin") || "";
  if (/^https:\/\/[^/]+$/.test(o) && !/^https:\/\/localhost/.test(o)) return o;
  // the Capacitor app runs on https://localhost, so it lands here too
  return (Deno.env.get("SITE_URL") || "https://sayyarti.online").replace(/\/+$/, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (!Deno.env.get("STRIPE_SECRET_KEY")) return json({ error: "not_configured" }, 501);

  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: u } = await admin.auth.getUser(token);
  const user = u?.user;
  if (!user || (user as { is_anonymous?: boolean }).is_anonymous) return json({ error: "sign_in_required" }, 401);

  let body: { credits?: number; returnPath?: string };
  try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  const credits = Number(body.credits);
  const aed = PACKAGES[credits];
  if (!aed) return json({ error: "invalid_package" }, 400);

  const base = returnBase(req);
  // back to the screen they paid from; only a plain path is accepted
  const path = typeof body.returnPath === "string" && /^\/[A-Za-z0-9/_-]*$/.test(body.returnPath) ? body.returnPath : "/";
  const meta = { app: "sayyarti", user_id: user.id, credits: String(credits) };
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ quantity: 1, price_data: { currency: "aed", unit_amount: aed * 100, product_data: { name: `Sayyarti — ${credits} credits` } } }],
      client_reference_id: user.id,
      customer_email: user.email || undefined,
      metadata: meta,
      payment_intent_data: { metadata: meta },
      success_url: `${base}${path}?paid=1`,
      cancel_url: `${base}${path}?paid=0`,
    });
    return json({ url: session.url });
  } catch (e) {
    console.error("checkout failed", e);
    return json({ error: "stripe_error" }, 502);
  }
});
