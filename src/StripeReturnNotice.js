// Back from Stripe Checkout (?paid=1 / ?paid=0): read the flag once, clean the address bar,
// and show a short notice. useFeatureCredits re-reads the balance while the webhook adds the credits.
export const PAID_RETURN = (() => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const paid = params.get("paid");
  if (paid !== "1" && paid !== "0") return null;
  params.delete("paid");
  const query = params.toString();
  window.history.replaceState(window.history.state, "", window.location.pathname + (query ? `?${query}` : "") + window.location.hash);
  return paid;
})();

export function startStripeReturnNotice() {
  if (!PAID_RETURN) return;
  const isAr = (localStorage.getItem("karajy-language") || "ar") !== "en";
  const text = PAID_RETURN === "1"
    ? (isAr ? "تم الدفع — الرصيد بيتضاف لحسابك دلوقتي" : "Payment done — adding the credits to your account now")
    : (isAr ? "الدفع اتلغى، ما اتخصمش أي مبلغ" : "Payment cancelled, nothing was charged");
  const el = document.createElement("div");
  el.setAttribute("role", "status");
  el.dir = isAr ? "rtl" : "ltr";
  el.textContent = text;
  el.style.cssText = "position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:10100;max-width:90vw;padding:12px 18px;border-radius:12px;font:600 14px system-ui,sans-serif;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.3);background:" + (PAID_RETURN === "1" ? "#15803d" : "#4b5563");
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 6000);
}
