import { useEffect, useState } from "react";

// App owns the language and announces every change with a "karaji-language-change" event,
// so the parts mounted beside it (bottom nav, AI assistant, maintenance planner) follow along.
export function storedLang() {
  try {
    const saved = localStorage.getItem("karajy-language");
    if (saved === "ar" || saved === "en") return saved;
  } catch (_) {}
  return (navigator.language || "").toLowerCase().startsWith("ar") ? "ar" : "en";
}

export function announceLang(lang) {
  window.dispatchEvent(new CustomEvent("karaji-language-change", { detail: { lang } }));
}

export function useAppLang() {
  const [lang, setLang] = useState(storedLang);
  useEffect(() => {
    const sync = (event) => setLang(event?.detail?.lang || storedLang());
    window.addEventListener("karaji-language-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("karaji-language-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return lang;
}
