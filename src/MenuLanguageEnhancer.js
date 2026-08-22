const MENU_TRANSLATIONS = {
  "Add Your Garage Free": "أضف جراجك مجانًا",
  "List Your Car for Sale": "اعرض سيارتك للبيع",
  "Legal": "الشؤون القانونية",
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
    return bg === "rgb(245,185,66)" || bg === "rgba(245,185,66,1)" || bg === "#f5b942";
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
  const isArabic = detectArabic();
  const map = isArabic ? MENU_TRANSLATIONS : MENU_ENGLISH;

  document.querySelectorAll("button").forEach((button) => {
    const text = button.textContent?.trim();
    if (!text || !map[text]) return;

    // Only translate menu items; these labels are unique to the side menu.
    button.querySelectorAll("span").forEach((span) => {
      const spanText = span.textContent?.trim();
      if (map[spanText]) span.textContent = map[spanText];
    });

    if (!button.querySelector("span")) button.textContent = map[text];
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
    });
  };

  schedule();

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["style", "class", "aria-pressed"],
  });

  window.addEventListener("storage", schedule);
  window.addEventListener("karaji-language-change", schedule);

  return () => {
    observer.disconnect();
    window.removeEventListener("storage", schedule);
    window.removeEventListener("karaji-language-change", schedule);
  };
}
