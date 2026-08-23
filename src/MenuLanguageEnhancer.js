const MENU_TRANSLATIONS = {
  "Add Your Garage Free": "أضف جراجك مجانًا",
  "+ Add Your Garage Free": "+ أضف جراجك مجانًا",
  "Own a garage? Let car owners find you": "هل تملك جراجًا؟ دع أصحاب السيارات يجدونك",
  "Add your garage to the Karaji directory for free and let car owners discover your services, location and contact details.": "أضف جراجك إلى دليل كراجي مجانًا ودع أصحاب السيارات يكتشفون خدماتك وموقعك وبيانات التواصل معك.",
  "List Your Car for Sale": "اعرض سيارتك للبيع",
  "Legal": "سياسة الموقع",
  "About the App": "حول التطبيق",
};

const MENU_ENGLISH = Object.fromEntries(
  Object.entries(MENU_TRANSLATIONS).map(([en, ar]) => [ar, en])
);
MENU_ENGLISH["سياسة الموقع"] = "App policy";

function getStoredLanguage() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang");
    if (fromUrl === "ar" || fromUrl === "en") return fromUrl;

    const keys = ["karajy-language", "karajiLanguage", "language", "appLanguage", "locale"];
    for (const key of keys) {
      const value = localStorage.getItem(key)?.toLowerCase();
      if (value?.startsWith("ar")) return "ar";
      if (value?.startsWith("en")) return "en";
    }
  } catch (_) {}
  return null;
}

function persistLanguage(lang) {
  if (lang !== "ar" && lang !== "en") return;
  try {
    localStorage.setItem("karajy-language", lang);
    localStorage.setItem("karajiLanguage", lang);
    localStorage.setItem("appLanguage", lang);
    localStorage.setItem("language", lang);
  } catch (_) {}
}

function isLanguageButtonActive(button) {
  if (!button) return false;
  if (button.getAttribute("aria-pressed") === "true") return true;
  const bg = (window.getComputedStyle(button).backgroundColor || "")
    .replace(/\s/g, "")
    .toLowerCase();
  return bg === "rgb(245,185,66)" || bg === "rgba(245,185,66,1)";
}

// Restore the stored language only once after the app initially renders.
// Never force a language again while navigating between app sections.
function syncStoredLanguageToAppOnce() {
  if (typeof document === "undefined") return;
  const stored = getStoredLanguage();
  if (!stored) return;

  const buttons = Array.from(document.querySelectorAll("button"));
  const arButton = buttons.find((b) => b.textContent?.trim() === "AR");
  const enButton = buttons.find((b) => b.textContent?.trim() === "EN");
  const target = stored === "ar" ? arButton : enButton;
  if (!target || isLanguageButtonActive(target)) return;
  target.click();
}

function detectArabic() {
  if (typeof document === "undefined") return false;

  const buttons = Array.from(document.querySelectorAll("button"));
  const arButton = buttons.find((b) => b.textContent?.trim() === "AR");
  const enButton = buttons.find((b) => b.textContent?.trim() === "EN");

  if (isLanguageButtonActive(arButton)) return true;
  if (isLanguageButtonActive(enButton)) return false;
  return getStoredLanguage() === "ar";
}

function translateMenu() {
  const map = detectArabic() ? MENU_TRANSLATIONS : MENU_ENGLISH;

  // Translate exact leaf text throughout the visible app, not only buttons.
  // This covers the garage directory promotional card and its CTA.
  document.querySelectorAll("*").forEach((element) => {
    if (element.children.length !== 0) return;
    const current = element.textContent?.trim();
    if (!current || !map[current]) return;
    element.textContent = map[current];
  });

  document.querySelectorAll("button").forEach((button) => {
    button.querySelectorAll("span").forEach((span) => {
      const current = span.textContent?.trim();
      if (current && map[current]) span.textContent = map[current];
    });
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
    target.remove();
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

  setTimeout(() => {
    syncStoredLanguageToAppOnce();
    schedule();
  }, 150);

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["style", "class", "aria-pressed"],
  });

  const handleClick = (event) => {
    const button = event.target?.closest?.("button");
    const label = button?.textContent?.trim();
    if (label === "AR") {
      persistLanguage("ar");
      window.dispatchEvent(new CustomEvent("karaji-language-change", { detail: { lang: "ar" } }));
    }
    if (label === "EN") {
      persistLanguage("en");
      window.dispatchEvent(new CustomEvent("karaji-language-change", { detail: { lang: "en" } }));
    }
    schedule();
  };

  document.addEventListener("click", handleClick, true);
  window.addEventListener("storage", schedule);
  window.addEventListener("karaji-language-change", schedule);

  return () => {
    observer.disconnect();
    document.removeEventListener("click", handleClick, true);
    window.removeEventListener("storage", schedule);
    window.removeEventListener("karaji-language-change", schedule);
  };
}
