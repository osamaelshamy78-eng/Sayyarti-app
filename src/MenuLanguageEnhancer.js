const MENU_TRANSLATIONS = {
  "Add Your Garage Free": "أضف جراجك مجانًا",
  "List Your Car for Sale": "اعرض سيارتك للبيع",
  "Legal": "سياسة الموقع",
  "About the App": "حول التطبيق",
};

const MENU_ENGLISH = Object.fromEntries(
  Object.entries(MENU_TRANSLATIONS).map(([en, ar]) => [ar, en])
);

function detectArabic() {
  if (typeof document === "undefined") return false;

  const buttons = Array.from(document.querySelectorAll("button"));
  const arButton = buttons.find((b) => b.textContent?.trim() === "AR");
  const enButton = buttons.find((b) => b.textContent?.trim() === "EN");

  const isActive = (button) => {
    if (!button) return false;
    if (button.getAttribute("aria-pressed") === "true") return true;
    const bg = (window.getComputedStyle(button).backgroundColor || "")
      .replace(/\s/g, "")
      .toLowerCase();
    return bg === "rgb(245,185,66)" || bg === "rgba(245,185,66,1)";
  };

  if (isActive(arButton)) return true;
  if (isActive(enButton)) return false;

  try {
    return localStorage.getItem("karajy-language") === "ar";
  } catch (_) {
    return false;
  }
}

function translateMenu() {
  const map = detectArabic() ? MENU_TRANSLATIONS : MENU_ENGLISH;

  document.querySelectorAll("button").forEach((button) => {
    button.querySelectorAll("span").forEach((span) => {
      const current = span.textContent?.trim();
      if (current && map[current]) span.textContent = map[current];
    });

    const directText = Array.from(button.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent?.trim())
      .filter(Boolean)
      .join(" ");

    if (directText && map[directText]) {
      Array.from(button.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
          node.textContent = ` ${map[directText]} `;
        }
      });
    }
  });
}

function hideGeneralFaultCategory() {
  const labels = new Set([
    "General / Not Sure What's Wrong",
    "أعطال عامة / مش عارف العطل فين",
  ]);

  document.querySelectorAll("*").forEach((element) => {
    if (element.children.length !== 0) return;
    const text = element.textContent?.trim();
    if (!text || !labels.has(text)) return;

    let target = element;
    for (let i = 0; i < 5 && target.parentElement; i += 1) {
      const tag = target.tagName?.toLowerCase();
      const role = target.getAttribute?.("role");
      const clickable = tag === "button" || role === "button" || typeof target.onclick === "function";
      if (clickable) break;
      target = target.parentElement;
    }
    target.style.display = "none";
  });
}

export function startMenuLanguageEnhancer() {
  if (typeof document === "undefined") return () => {};

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      translateMenu();
      hideGeneralFaultCategory();
    });
  };

  schedule();

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["style", "class", "aria-pressed"],
  });

  document.addEventListener("click", schedule, true);
  window.addEventListener("storage", schedule);
  window.addEventListener("karaji-language-change", schedule);

  return () => {
    observer.disconnect();
    document.removeEventListener("click", schedule, true);
    window.removeEventListener("storage", schedule);
    window.removeEventListener("karaji-language-change", schedule);
  };
}
