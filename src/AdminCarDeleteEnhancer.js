import { supabase } from "./supabaseClient";

const ADMIN_MARKERS = [
  "Manage garages + photo diagnosis requests + cars",
  "إدارة الجراجات + طلبات تشخيص الصور + السيارات",
];

function normalize(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

function isAdminDashboard() {
  const text = normalize(document.body?.innerText || "");
  return ADMIN_MARKERS.some((marker) => text.includes(normalize(marker)));
}

function findCarCard(button) {
  let node = button;
  for (let i = 0; i < 8 && node; i += 1) {
    if (node instanceof HTMLElement) {
      const text = node.innerText || "";
      if (text.length > 25 && text.length < 900 && /(mark as sold|mark as available|تحديد تم البيع|إعادة للعرض)/i.test(text)) {
        return node;
      }
    }
    node = node.parentElement;
  }
  return null;
}

async function getAdminListings() {
  if (!supabase) return [];
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const { data: admin, error: adminError } = await supabase.rpc("is_car_admin");
  if (adminError || admin !== true) return [];

  const { data, error } = await supabase
    .from("car_listings")
    .select("id,make_model,year,price,city,status")
    .in("status", ["approved", "sold"])
    .order("created_at", { ascending: false });

  return error ? [] : data || [];
}

function matchListing(cardText, listings) {
  const text = normalize(cardText);
  const candidates = listings
    .map((listing) => {
      let score = 0;
      const makeModel = normalize(listing.make_model);
      if (makeModel && text.includes(makeModel)) score += 10;
      if (listing.year != null && text.includes(normalize(listing.year))) score += 3;
      if (listing.price != null && text.includes(normalize(listing.price))) score += 3;
      if (listing.city && text.includes(normalize(listing.city))) score += 2;
      return { listing, score };
    })
    .filter((item) => item.score >= 10)
    .sort((a, b) => b.score - a.score);

  if (!candidates.length) return null;
  if (candidates.length > 1 && candidates[0].score === candidates[1].score) return null;
  return candidates[0].listing;
}

async function addDeleteButtons() {
  if (!isAdminDashboard() || !supabase) return;

  const listings = await getAdminListings();
  if (!listings.length) return;

  const statusButtons = Array.from(document.querySelectorAll("button")).filter((button) =>
    /(mark as sold|mark as available|تحديد تم البيع|إعادة للعرض)/i.test(button.innerText || "")
  );

  statusButtons.forEach((statusButton) => {
    const card = findCarCard(statusButton);
    if (!card || card.querySelector("[data-karaji-delete-car]") || card.dataset.karajiDeleteReady === "1") return;

    const listing = matchListing(card.innerText || "", listings);
    if (!listing) return;

    card.dataset.karajiDeleteReady = "1";
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.dataset.karajiDeleteCar = listing.id;
    deleteButton.innerHTML = "🗑️ <span></span>";
    const arabic = /إدارة الجراجات|صور الأعطال|طلب/i.test(document.body.innerText || "");
    deleteButton.querySelector("span").textContent = arabic ? "حذف السيارة" : "Delete car";
    deleteButton.style.cssText = [
      "width:100%",
      "margin-top:8px",
      "background:transparent",
      "border:1px solid rgba(228,67,43,.55)",
      "border-radius:10px",
      "padding:9px 12px",
      "cursor:pointer",
      "color:#E4432B",
      "font-size:12.5px",
      "font-weight:700",
    ].join(";");

    deleteButton.addEventListener("click", async () => {
      const confirmed = window.confirm(
        arabic
          ? "هل أنت متأكد من حذف إعلان السيارة نهائيًا؟ لا يمكن التراجع عن هذا الإجراء."
          : "Delete this car listing permanently? This action cannot be undone."
      );
      if (!confirmed) return;

      deleteButton.disabled = true;
      deleteButton.style.cursor = "wait";
      const oldText = deleteButton.querySelector("span").textContent;
      deleteButton.querySelector("span").textContent = arabic ? "جاري الحذف..." : "Deleting...";

      const { data: admin, error: adminError } = await supabase.rpc("is_car_admin");
      if (adminError || admin !== true) {
        window.alert(arabic ? "غير مصرح لك بحذف السيارات." : "You are not authorized to delete car listings.");
        deleteButton.disabled = false;
        deleteButton.style.cursor = "pointer";
        deleteButton.querySelector("span").textContent = oldText;
        return;
      }

      const { error } = await supabase.from("car_listings").delete().eq("id", listing.id);
      if (error) {
        console.error("Karaji car delete failed:", error);
        window.alert(arabic ? "تعذر حذف السيارة. حاول مرة أخرى." : "Could not delete the car listing. Please try again.");
        deleteButton.disabled = false;
        deleteButton.style.cursor = "pointer";
        deleteButton.querySelector("span").textContent = oldText;
        return;
      }

      card.remove();
    });

    statusButton.insertAdjacentElement("afterend", deleteButton);
  });
}

export function startAdminCarDeleteEnhancer() {
  if (window.__karajiAdminCarDeleteEnhancerStarted) return;
  window.__karajiAdminCarDeleteEnhancerStarted = true;

  let timer = null;
  const run = () => {
    clearTimeout(timer);
    timer = setTimeout(() => addDeleteButtons().catch((error) => console.error("Karaji admin car enhancer:", error)), 250);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }

  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
