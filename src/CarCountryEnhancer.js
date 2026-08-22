const COUNTRIES = [
  { code: "all", en: "All Countries", ar: "كل الدول" },
  { code: "uae", en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" },
  { code: "ksa", en: "Saudi Arabia", ar: "المملكة العربية السعودية" },
  { code: "egypt", en: "Egypt", ar: "مصر" },
];

const LOCAL_OR_OTHER_SPECS = "Local / Other";

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
  const labels = Array.from(document.querySelectorAll("span"));
  const label = labels.find((el) => ["Country", "الدولة"].includes(el.textContent?.trim()));
  if (!label) return;
  const field = label.parentElement;
  if (!field) return;
  const input = field.querySelector("input");
  const select = field.querySelector("[data-karaji-country-select='true']");
  if (!input && !select) return;

  if (select) {
    const arabic = detectArabic();
    const current = select.value;
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
  const labels = Array.from(document.querySelectorAll("span"));
  const label = labels.find((el) => ["Specs", "المواصفات"].includes(el.textContent?.trim()));
  if (!label) return;
  const field = label.parentElement;
  if (!field) return;
  const select = field.querySelector("select");
  if (!select || select.querySelector("[data-karaji-local-specs='true']")) return;

  const option = document.createElement("option");
  option.value = LOCAL_OR_OTHER_SPECS;
  option.setAttribute("data-karaji-local-specs", "true");
  option.textContent = detectArabic() ? "مواصفات محلية / أخرى" : "Local / Other Specs";
  select.appendChild(option);
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
    const matches = !wanted || text.includes(wanted.en) || text.includes(wanted.ar);
    card.style.display = matches ? "" : "none";
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
      enhanceCarFilter();
    });
  };
  schedule();
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["style", "class"] });
  window.addEventListener("karaji-language-change", schedule);
  return () => {
    observer.disconnect();
    window.removeEventListener("karaji-language-change", schedule);
  };
}
