import { supabase } from "./supabaseClient";

const MARKERS = [
  "Manage garages + photo diagnosis requests + cars",
  "إدارة الجراجات + طلبات تشخيص الصور + السيارات",
];

function normalize(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

function isAdminDashboard() {
  const text = normalize(document.body?.innerText || "");
  return MARKERS.some((marker) => text.includes(normalize(marker)));
}

async function loadPending() {
  if (!supabase || !isAdminDashboard()) return;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return;
  const { data: admin, error: adminError } = await supabase.rpc("is_car_admin");
  if (adminError || admin !== true) return;

  const { data, error } = await supabase
    .from("car_listings")
    .select("id,make_model,year,price,mileage,city,country,phone,description,photo_url,photo_urls,created_at,status")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) return;

  let root = document.querySelector("[data-karaji-pending-cars]");
  if (!root) {
    root = document.createElement("section");
    root.dataset.karajiPendingCars = "1";
    root.style.cssText = "margin:0 0 16px;padding:14px;background:#1D2129;border:1px solid #F5B94255;border-radius:14px;";
    const anchor = Array.from(document.querySelectorAll("div")).find((el) => normalize(el.innerText) === normalize("Manage garages + photo diagnosis requests + cars"));
    if (anchor?.parentElement) anchor.parentElement.insertBefore(root, anchor.parentElement.firstChild);
    else document.body.prepend(root);
  }

  const arabic = /إدارة الجراجات|السيارات/.test(document.body.innerText || "");
  root.innerHTML = "";

  const title = document.createElement("div");
  title.textContent = arabic ? `سيارات بانتظار الموافقة (${data.length})` : `Cars awaiting approval (${data.length})`;
  title.style.cssText = "color:#F5B942;font-size:15px;font-weight:800;margin-bottom:10px;";
  root.appendChild(title);

  if (!data.length) {
    const empty = document.createElement("div");
    empty.textContent = arabic ? "لا توجد سيارات جديدة بانتظار الموافقة." : "No new cars are waiting for approval.";
    empty.style.cssText = "color:#B9B2A0;font-size:12.5px;";
    root.appendChild(empty);
    return;
  }

  data.forEach((car) => {
    const card = document.createElement("div");
    card.style.cssText = "padding:10px;margin-top:8px;background:#14171C;border:1px solid #2A2F38;border-radius:12px;";

    if (car.photo_url || car.photo_urls?.[0]) {
      const img = document.createElement("img");
      img.src = car.photo_url || car.photo_urls[0];
      img.alt = car.make_model || "Car";
      img.style.cssText = "width:100%;height:130px;object-fit:cover;border-radius:9px;margin-bottom:8px;";
      card.appendChild(img);
    }

    const info = document.createElement("div");
    info.style.cssText = "color:#F2ECDD;font-size:13px;line-height:1.6;";
    info.innerHTML = `<strong>${escapeHtml(car.make_model || "")}${car.year ? ` · ${escapeHtml(car.year)}` : ""}</strong><br>${escapeHtml(car.price ?? "")} ${car.city ? ` · ${escapeHtml(car.city)}` : ""}<br>${arabic ? "الهاتف" : "Phone"}: ${escapeHtml(car.phone || "")}`;
    card.appendChild(info);

    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;gap:8px;margin-top:10px;";

    const approve = makeButton(arabic ? "✓ اعتماد" : "✓ Approve", "#F5B942", "#14171C");
    const reject = makeButton(arabic ? "حذف / رفض" : "Reject / Delete", "transparent", "#E4432B");
    reject.style.border = "1px solid #E4432B88";

    approve.onclick = () => updateStatus(car.id, "approved", card, approve, reject, arabic);
    reject.onclick = () => {
      const ok = window.confirm(arabic ? "هل تريد رفض وحذف إعلان السيارة؟" : "Reject and delete this car listing?");
      if (ok) updateStatus(car.id, "rejected", card, approve, reject, arabic);
    };

    actions.append(approve, reject);
    card.appendChild(actions);
    root.appendChild(card);
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
}

function makeButton(text, background, color) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = text;
  b.style.cssText = `flex:1;padding:9px 10px;border:1px solid #F5B94288;border-radius:10px;background:${background};color:${color};font-size:12px;font-weight:800;cursor:pointer;`;
  return b;
}

async function updateStatus(id, status, card, approve, reject, arabic) {
  approve.disabled = true;
  reject.disabled = true;
  const { data: admin, error: adminError } = await supabase.rpc("is_car_admin");
  if (adminError || admin !== true) {
    window.alert(arabic ? "غير مصرح لك بهذا الإجراء." : "You are not authorized for this action.");
    approve.disabled = false;
    reject.disabled = false;
    return;
  }

  if (status === "rejected") {
    const { error } = await supabase.from("car_listings").delete().eq("id", id);
    if (error) {
      window.alert(arabic ? "تعذر رفض الإعلان." : "Could not reject the listing.");
      approve.disabled = false;
      reject.disabled = false;
      return;
    }
  } else {
    const { error } = await supabase.from("car_listings").update({ status: "approved" }).eq("id", id);
    if (error) {
      window.alert(arabic ? "تعذر اعتماد الإعلان." : "Could not approve the listing.");
      approve.disabled = false;
      reject.disabled = false;
      return;
    }
  }
  card.remove();
}

export function startPendingCarAdminEnhancer() {
  if (window.__karajiPendingCarAdminEnhancerStarted) return;
  window.__karajiPendingCarAdminEnhancerStarted = true;
  let timer = null;
  const run = () => {
    clearTimeout(timer);
    timer = setTimeout(() => loadPending().catch((error) => console.error("Sayyarti pending car enhancer:", error)), 400);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
  new MutationObserver(run).observe(document.documentElement, { childList: true, subtree: true });
}
