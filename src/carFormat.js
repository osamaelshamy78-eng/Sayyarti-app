// Price and mileage as listings show them. Sellers type these freely ("162000 km", "21,000"),
// so the number is pulled out and shown once, with its unit or the country's currency.
const CURRENCY = {
  uae: { en: "AED", ar: "درهم" },
  ksa: { en: "SAR", ar: "ريال" },
  egypt: { en: "EGP", ar: "جنيه" },
};

function numberIn(value) {
  const n = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function formatPrice(price, country, lang) {
  const n = numberIn(price);
  if (n == null) return price || "";
  const amount = n.toLocaleString("en");
  const cur = CURRENCY[country];
  if (!cur) return amount;
  return lang === "ar" ? `${amount} ${cur.ar}` : `${cur.en} ${amount}`;
}

export function formatMileage(mileage, lang) {
  const n = numberIn(mileage);
  if (n == null) return "";
  return `${n.toLocaleString("en")} ${lang === "ar" ? "كم" : "km"}`;
}
