import { supabase } from "./supabaseClient";

const isRequestCard = (el) => {
  const t = (el?.innerText || "").replace(/\s+/g, " ");
  return (/Photo diagnosis request|طلب تشخيص صور/.test(t) && /WhatsApp\s*:/i.test(t));
};
const phoneFrom = (el) => {
  const m = (el?.innerText || "").match(/WhatsApp\s*:\s*([+\d\s()-]+)/i);
  return m ? m[1].replace(/\D/g, "") : "";
};
let requests = [];
let busy = false;

async function loadRequests() {
  if (!supabase || busy) return;
  busy = true;
  try {
    const { data, error } = await supabase.rpc("get_photo_diagnosis_requests");
    if (!error) {
      requests = (data || []).slice().sort((a, b) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    }
  } finally { busy = false; }
}

function requestFor(card) {
  const phone = phoneFrom(card);
  if (!phone) return null;

  // Phone numbers are not unique, so matching by phone alone is unsafe.
  // Match the card by its occurrence among cards with the same phone,
  // while the RPC results are ordered newest-first like the admin list.
  const cards = Array.from(document.querySelectorAll("div")).filter(isRequestCard);
  const samePhoneCards = cards.filter(c => phoneFrom(c) === phone);
  const cardIndex = samePhoneCards.indexOf(card);
  if (cardIndex < 0) return null;

  const samePhoneRequests = requests.filter(r =>
    String(r.whatsapp_number || "").replace(/\D/g, "") === phone
  );
  return samePhoneRequests[cardIndex] || null;
}

function cardFor(button) {
  let n = button?.parentElement;
  for (let i = 0; n && i < 8; i++, n = n.parentElement) if (isRequestCard(n)) return n;
  return null;
}

function addDeleteButton(card, request) {
  if (!request || card.querySelector("[data-karaji-delete]")) return;
  const completed = request.status === "approved" && !!request.generated_code;
  const rejected = request.status === "rejected";
  if (!completed && !rejected) return;

  const b = document.createElement("button");
  b.type = "button";
  b.dataset.karajiDelete = "1";
  b.textContent = card.innerText.includes("طلب تشخيص صور") ? "حذف الطلب" : "Delete request";
  Object.assign(b.style, {
    width: "100%", marginTop: "8px", background: "transparent", color: "#F06A5F",
    border: "1px solid #F06A5F66", borderRadius: "8px", padding: "9px", fontWeight: "800", cursor: "pointer"
  });
  b.onclick = async () => {
    if (!window.confirm(card.innerText.includes("طلب تشخيص صور") ? "حذف هذا الطلب نهائيًا؟" : "Delete this request permanently?")) return;
    b.disabled = true; b.textContent = "...";
    const { error } = await supabase.rpc("delete_photo_diagnosis_request", { p_request_id: request.id });
    if (error) {
      b.disabled = false; b.textContent = card.innerText.includes("طلب تشخيص صور") ? "حذف الطلب" : "Delete request";
      window.alert(error.message || "Could not delete request");
      return;
    }
    requests = requests.filter(r => r.id !== request.id);
    card.remove();
  };
  card.appendChild(b);
}

function enhance() {
  if (!supabase || location.pathname !== "/admin") return;
  document.querySelectorAll("button").forEach(button => {
    const label = button.innerText || "";
    if (!/Send code to customer on WhatsApp|إرسال الكود للعميل على WhatsApp/.test(label)) return;
    const card = cardFor(button); if (!card) return;
    const request = requestFor(card); if (!request) return;
    if (!button.dataset.karajiApprovedHook) {
      button.dataset.karajiApprovedHook = "1";
      button.addEventListener("click", async () => {
        const { error } = await supabase.rpc("mark_photo_diagnosis_code_sent", { p_request_id: request.id });
        if (error) console.error("Karaji approval confirmation failed", error);
        else request.status = "approved";
      });
    }
    addDeleteButton(card, request);
  });

  const candidates = Array.from(document.querySelectorAll("div")).filter(isRequestCard);
  candidates.forEach(el => {
    const hasSmallerCard = Array.from(el.querySelectorAll("div")).some(isRequestCard);
    if (hasSmallerCard || el.querySelector("[data-karaji-delete]")) return;
    addDeleteButton(el, requestFor(el));
  });
}

export function startAdminPhotoRequestEnhancer() {
  if (!supabase || window.__karajiPhotoAdminEnhancer) return;
  window.__karajiPhotoAdminEnhancer = true;
  const run = async () => { await loadRequests(); enhance(); };
  run();
  new MutationObserver(() => {
    clearTimeout(window.__karajiPhotoAdminTimer);
    window.__karajiPhotoAdminTimer = setTimeout(enhance, 120);
  }).observe(document.body, { childList: true, subtree: true });
  setInterval(run, 5000);
}
