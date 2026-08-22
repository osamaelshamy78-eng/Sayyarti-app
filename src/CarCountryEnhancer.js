const COUNTRIES = [
  { code: "all", en: "All Countries", ar: "كل الدول" },
  { code: "uae", en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" },
  { code: "ksa", en: "Saudi Arabia", ar: "المملكة العربية السعودية" },
  { code: "egypt", en: "Egypt", ar: "مصر" },
];

const LOCAL_OR_OTHER_SPECS = "Local / Other";
const LEGACY_NAV_LABELS = new Set([
  "Home", "الرئيسية", "Garages", "الورش", "Quick Service", "خدمة سريعة",
  "Cars", "السيارات", "Spare Parts", "قطع غيار", "Photo Diagnosis", "تشخيص بالصور",
  "Sell Your Car", "بيع سيارتك", "Quick", "سريع", "Sell Your", "اعرض سيارتك",
]);

function detectArabic() {
  const ar = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.trim() === "AR");
  return ar?.getAttribute("aria-pressed") === "true" ||
    (ar && getComputedStyle(ar).backgroundColor.replace(/\s/g, "").toLowerCase().includes("245,185,66"));
}

function setReactInputValue(input, value) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  if (setter) setter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function enhanceCountryField() {
  const label = Array.from(document.querySelectorAll("span")).find((el) => ["Country", "الدولة"].includes(el.textContent?.trim()));
  if (!label) return;
  const field = label.parentElement;
  if (!field) return;
  const input = field.querySelector("input");
  const select = field.querySelector("[data-karaji-country-select='true']");
  if (!input && !select) return;
  if (select) {
    const current = select.value;
    const arabic = detectArabic();
    select.innerHTML = `<option value="">—</option>${COUNTRIES.slice(1).map((c) => `<option value="${c.code}">${arabic ? c.ar : c.en}</option>`).join("")}`;
    select.value = current;
    return;
  }
  const newSelect = document.createElement("select");
  newSelect.setAttribute("data-karaji-country-select", "true");
  newSelect.required = true;
  newSelect.style.cssText = input.style.cssText + ";cursor:pointer;";
  const arabic = detectArabic();
  newSelect.innerHTML = `<option value="">—</option>${COUNTRIES.slice(1).map((c) => `<option value="${c.code}">${arabic ? c.ar : c.en}</option>`).join("")}`;
  newSelect.value = ["uae", "ksa", "egypt"].includes(input.value) ? input.value : "";
  newSelect.addEventListener("change", () => setReactInputValue(input, newSelect.value));
  input.style.display = "none";
  input.insertAdjacentElement("afterend", newSelect);
}

function enhanceSpecsField() {
  const label = Array.from(document.querySelectorAll("span")).find((el) => ["Specs", "المواصفات"].includes(el.textContent?.trim()));
  if (!label) return;
  const field = label.parentElement;
  const select = field?.querySelector("select");
  if (!select || select.querySelector("[data-karaji-local-specs='true']")) return;
  const option = document.createElement("option");
  option.value = LOCAL_OR_OTHER_SPECS;
  option.setAttribute("data-karaji-local-specs", "true");
  option.textContent = detectArabic() ? "مواصفات محلية / أخرى" : "Local / Other Specs";
  select.appendChild(option);
}

function getButtonLabel(button) {
  return button.textContent?.replace(/\s+/g, " ").trim() || "";
}

function findLegacyNav() {
  const buttons = Array.from(document.querySelectorAll("button")).filter((b) => LEGACY_NAV_LABELS.has(getButtonLabel(b)));
  const visited = new Set();
  for (const button of buttons) {
    let parent = button.parentElement;
    for (let depth = 0; parent && depth < 8; depth += 1, parent = parent.parentElement) {
      if (visited.has(parent)) continue;
      visited.add(parent);
      const childButtons = Array.from(parent.querySelectorAll("button"));
      const labels = childButtons.map(getButtonLabel);
      const legacyCount = labels.filter((label) => LEGACY_NAV_LABELS.has(label)).length;
      const style = getComputedStyle(parent);
      const rect = parent.getBoundingClientRect();
      if (legacyCount >= 5 && (style.position === "fixed" || style.position === "sticky") && (rect.bottom >= window.innerHeight - 60 || style.bottom !== "auto")) return parent;
    }
  }
  return null;
}

function navigateTo(path) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function findOriginalAIButton() {
  return Array.from(document.querySelectorAll("button")).find((b) => b.getAttribute("aria-label") === "Karaji AI");
}

function hideUnexpectedServiceButton() {
  const labels = new Set(["Service", "Services", "خدمة", "الخدمات"]);
  const candidates = Array.from(document.querySelectorAll("button, [role='button']"));
  candidates.forEach((element) => {
    if (element.closest("[data-karaji-bottom-nav='true']") || element.getAttribute("data-karaji-ai-bottom-button") === "true") return;
    const label = getButtonLabel(element);
    if (!labels.has(label)) return;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    if ((style.position === "fixed" || style.position === "sticky") && rect.bottom >= window.innerHeight - 180) {
      element.setAttribute("data-karaji-unwanted-service-button", "true");
      element.style.setProperty("display", "none", "important");
    }
  });
}

function styleAIAsBottomNavButton(button, arabic) {
  if (!button) return;
  const label = arabic ? "مساعد السيارة الذكي" : "Car AI Ass";
  button.setAttribute("data-karaji-ai-bottom-button", "true");
  button.style.cssText = [
    "position:fixed",
    "right:10px",
    "bottom:calc(8px + env(safe-area-inset-bottom))",
    "width:calc((100vw - 32px) / 3)",
    "height:58px",
    "z-index:10001",
    "border:1px solid #2A2F38",
    "border-radius:12px",
    "background:#14171C",
    "color:#F2ECDD",
    "box-shadow:0 8px 24px rgba(0,0,0,.25)",
    "font-size:11px",
    "font-weight:800",
    "line-height:1.2",
    "cursor:pointer",
    "-webkit-tap-highlight-color:transparent",
    "touch-action:manipulation",
    "display:flex",
    "flex-direction:column",
    "align-items:center",
    "justify-content:center",
    "gap:4px",
    "box-sizing:border-box",
  ].join(";");
  button.innerHTML = `<div style="font-size:18px;line-height:1">✦</div><div>${label}</div>`;
}

function enhanceBottomNavigation() {
  const original = findLegacyNav();
  if (original) original.style.display = "none";

  let nav = document.querySelector("[data-karaji-bottom-nav='true']");
  if (!nav) {
    nav = document.createElement("nav");
    nav.setAttribute("data-karaji-bottom-nav", "true");
    nav.style.cssText = [
      "position:fixed", "left:0", "right:0", "bottom:0", "z-index:9990",
      "display:flex", "align-items:stretch", "justify-content:space-around", "gap:6px",
      "padding:8px 10px calc(8px + env(safe-area-inset-bottom))",
      "background:#1D2129", "border-top:1px solid #2A2F38", "box-sizing:border-box",
      "box-shadow:0 -8px 24px rgba(0,0,0,.25)", "-webkit-tap-highlight-color:transparent",
    ].join(";");
    document.body.appendChild(nav);
  }

  const arabic = detectArabic();
  const labels = arabic ? { home: "الرئيسية", maintenance: "الصيانة" } : { home: "Home", maintenance: "Maintenance" };
  nav.innerHTML = "";

  const makeButton = (label, icon, path) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("data-karaji-nav-action", path);
    button.setAttribute("role", "button");
    button.style.cssText = [
      "flex:1", "min-width:0", "height:58px", "border:1px solid #2A2F38", "border-radius:12px",
      "background:#14171C", "color:#F2ECDD", "padding:8px 5px", "font-size:11px", "font-weight:800",
      "line-height:1.2", "cursor:pointer", "display:flex", "flex-direction:column", "align-items:center",
      "justify-content:center", "gap:4px", "-webkit-tap-highlight-color:transparent", "touch-action:manipulation",
      "-webkit-user-select:none", "user-select:none", "box-sizing:border-box",
    ].join(";");
    button.innerHTML = `<span style="font-size:18px;line-height:1">${icon}</span><span>${label}</span>`;
    const action = () => navigateTo(path);
    button.onclick = action;
    button.addEventListener("touchend", (event) => {
      event.preventDefault();
      action();
    }, { passive: false });
    return button;
  };

  nav.appendChild(makeButton(labels.home, "⌂", "/"));
  nav.appendChild(makeButton(labels.maintenance, "🔧", "/maintenance"));

  // Keep a real third slot so the native AI button aligns exactly with the right slot.
  const aiSlot = document.createElement("div");
  aiSlot.setAttribute("aria-hidden", "true");
  aiSlot.style.cssText = "flex:1;min-width:0;height:58px;visibility:hidden;pointer-events:none;";
  nav.appendChild(aiSlot);

  const ai = findOriginalAIButton();
  if (ai) styleAIAsBottomNavButton(ai, arabic);
  hideUnexpectedServiceButton();
}

function enhanceCarFilter() {
  const heading = Array.from(document.querySelectorAll("h1")).find((el) => ["Sell Your Car", "بيع سيارتك"].includes(el.textContent?.trim()));
  if (!heading) return;
  const container = heading.parentElement?.parentElement;
  if (!container) return;
  const addButton = Array.from(container.querySelectorAll("button")).find((b) => ["+ List Your Car", "+ اعرض سيارتك"].includes(b.textContent?.trim()));
  if (!addButton) return;
  let filterWrap = container.querySelector("[data-karaji-car-filter='true']");
  if (!filterWrap) {
    filterWrap = document.createElement("div");
    filterWrap.setAttribute("data-karaji-car-filter", "true");
    filterWrap.style.cssText = "margin-bottom:14px;";
    addButton.insertAdjacentElement("afterend", filterWrap);
  }
  let select = filterWrap.querySelector("select");
  if (!select) {
    select = document.createElement("select");
    select.style.cssText = "width:100%;box-sizing:border-box;padding:10px 12px;border-radius:10px;border:1px solid #2A2F38;background:#1D2129;color:#F2ECDD;font-size:13px;cursor:pointer;";
    filterWrap.appendChild(select);
    select.addEventListener("change", () => applyCarFilter(container, select.value));
  }
  const arabic = detectArabic();
  const current = select.value || "all";
  select.innerHTML = COUNTRIES.map((c) => `<option value="${c.code}">${arabic ? c.ar : c.en}</option>`).join("");
  select.value = current;
  applyCarFilter(container, select.value);
}

function applyCarFilter(container, selected) {
  const list = Array.from(container.querySelectorAll("div")).find((el) => el.className?.includes("flex flex-col gap-2.5"));
  if (!list) return;
  const wanted = selected === "all" ? null : COUNTRIES.find((c) => c.code === selected);
  Array.from(list.children).forEach((card) => {
    if (!card.querySelector) return;
    const text = card.textContent || "";
    card.style.display = !wanted || text.includes(wanted.en) || text.includes(wanted.ar) ? "" : "none";
  });
}

export function startCarCountryEnhancer() {
  if (typeof document === "undefined") return () => {};
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enhanceCountryField();
      enhanceSpecsField();
      enhanceBottomNavigation();
      enhanceCarFilter();
      hideUnexpectedServiceButton();
    });
  };
  schedule();
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["style", "class", "aria-pressed"] });
  window.addEventListener("karaji-language-change", schedule);
  return () => {
    observer.disconnect();
    window.removeEventListener("karaji-language-change", schedule);
  };
}
