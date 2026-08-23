import React, { useEffect, useMemo, useRef, useState } from "react";

const C = { asphalt: "#14171C", panel: "#1D2129", line: "#2A2F38", cream: "#F2ECDD", dim: "#B9B2A0", amber: "#F5B942", red: "#E4432B", green: "#61A56B" };
const KEY = "karaji-maintenance-planner-v1";

function detectAppLanguage() {
  if (typeof document === "undefined") return "en";
  const buttons = Array.from(document.querySelectorAll("button"));
  const enButton = buttons.find((b) => b.textContent?.trim() === "EN");
  const arButton = buttons.find((b) => b.textContent?.trim() === "AR");
  const isActive = (button) => {
    if (!button) return false;
    if (button.getAttribute("aria-pressed") === "true") return true;
    const inlineBg = (button.style.backgroundColor || "").replace(/\s/g, "").toLowerCase();
    if (inlineBg === "#f5b942" || inlineBg === "rgb(245,185,66)" || inlineBg === "rgba(245,185,66,1)") return true;
    const style = window.getComputedStyle(button);
    const bg = (style.backgroundColor || "").replace(/\s/g, "").toLowerCase();
    return bg === "rgb(245,185,66)" || bg === "rgba(245,185,66,1)" || bg === "#f5b942";
  };
  if (isActive(arButton)) return "ar";
  if (isActive(enButton)) return "en";
  try {
    const saved = localStorage.getItem("karajy-language");
    if (saved === "ar" || saved === "en") return saved;
  } catch (_) {}
  return "en";
}

function getPlan(km) {
  const n = Number(km || 0);
  const plan = [
    { at: 5000, title: "Oil & filter", ar: "تغيير الزيت والفلتر" },
    { at: 10000, title: "Tire & brake inspection", ar: "فحص الإطارات والفرامل" },
    { at: 20000, title: "Air filter & fluids", ar: "فلتر الهواء وفحص السوائل" },
    { at: 40000, title: "Major preventive check", ar: "فحص وقائي شامل" },
  ];
  return plan.map((item) => ({ ...item, due: Math.max(0, item.at - (n % item.at)) })).sort((a, b) => a.due - b.due);
}

export default function KarajiMaintenancePlanner({ lang }) {
  const [appLang, setAppLang] = useState(() => lang || detectAppLanguage());
  const isAr = appLang === "ar";
  const [open, setOpen] = useState(false);
  const [mileage, setMileage] = useState("");
  const [saved, setSaved] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    try { setMileage(localStorage.getItem(KEY) || ""); } catch (_) {}
  }, []);

  useEffect(() => {
    if (lang) {
      setAppLang(lang);
      return undefined;
    }
    const syncLanguage = () => setAppLang(detectAppLanguage());
    syncLanguage();
    const observer = new MutationObserver(syncLanguage);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style", "aria-pressed"] });
    window.addEventListener("storage", syncLanguage);
    window.addEventListener("karaji-language-change", syncLanguage);
    return () => {
      observer.disconnect();
      window.removeEventListener("storage", syncLanguage);
      window.removeEventListener("karaji-language-change", syncLanguage);
    };
  }, [lang]);

  // Kept for compatibility in case anything else still dispatches this event.
  useEffect(() => {
    const openPlanner = () => setOpen(true);
    window.addEventListener("karaji-open-maintenance-planner", openPlanner);
    return () => window.removeEventListener("karaji-open-maintenance-planner", openPlanner);
  }, []);

  // Only intercept the bottom Maintenance button. Do not alter any other
  // navigation item or the existing directory content.
  //
  // iOS fix: previously this listened on THREE event types
  // (pointerdown + touchstart + click), each with preventDefault +
  // stopPropagation + stopImmediatePropagation, AND a second separate
  // script (MaintenanceNavFix.js) did the same thing independently.
  // Two competing capture-phase interceptors triple-hijacking the same
  // tap is exactly the kind of thing iOS Safari's touch-to-click
  // sequencing handles inconsistently (Android Chrome is far more
  // forgiving about this). Using a single "click" listener is the most
  // cross-platform-reliable way to catch a tap, since the browser has
  // already resolved touch-vs-click for you by the time it fires.
  useEffect(() => {
    const getMaintenanceButton = (target) => {
      const button = target?.closest?.("button");
      if (!button) return null;
      const label = (button.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      const aria = (button.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().toLowerCase();
      const title = (button.getAttribute("title") || "").replace(/\s+/g, " ").trim().toLowerCase();
      const haystack = `${label} ${aria} ${title}`;
      return /(^|\s)(maintenance|quick service|الصيانة|الصيانة السريعة)(\s|$)/i.test(haystack) ? button : null;
    };
    const openPlannerFromMaintenance = (event) => {
      const button = getMaintenanceButton(event.target);
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(true);
    };
    document.addEventListener("click", openPlannerFromMaintenance, true);
    return () => {
      document.removeEventListener("click", openPlannerFromMaintenance, true);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const handleOutsidePointer = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handleOutsidePointer, true);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer, true);
  }, [open]);

  const plan = useMemo(() => getPlan(mileage), [mileage]);
  const next = plan[0];
  const save = () => {
    try { localStorage.setItem(KEY, mileage); } catch (_) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div ref={rootRef} dir={isAr ? "rtl" : "ltr"} style={{ position: "fixed", left: 10, bottom: "calc(70px + env(safe-area-inset-bottom))", zIndex: 9997, fontFamily: "system-ui,sans-serif", pointerEvents: open ? "auto" : "none" }}>
      {open && <div style={{ width: "min(330px, calc(100vw - 32px))", maxHeight: "min(520px, calc(100dvh - 150px))", overflowY: "auto", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: "0 18px 50px rgba(0,0,0,.45)", padding: 14, marginBottom: 9 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div><div style={{ color: C.amber, fontSize: 10, fontWeight: 900 }}>KARAJY</div><div style={{ color: C.cream, fontSize: 16, fontWeight: 900 }}>{isAr ? "خطة الصيانة" : "Maintenance plan"}</div></div>
          <button onClick={() => setOpen(false)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.line}`, background: "transparent", color: C.dim }}>×</button>
        </div>
        <label style={{ display: "block", color: C.dim, fontSize: 11 }}>
          {isAr ? "عداد الكيلومترات الحالي" : "Current mileage"}
          <input value={mileage} onChange={(e) => setMileage(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="120000" style={{ width: "100%", boxSizing: "border-box", marginTop: 5, padding: 10, borderRadius: 9, border: `1px solid ${C.line}`, background: C.asphalt, color: C.cream }} />
        </label>
        {next && <div style={{ marginTop: 10, padding: 11, borderRadius: 11, border: `1px solid ${C.amber}55`, background: `${C.amber}0D` }}><div style={{ color: C.dim, fontSize: 10 }}>{isAr ? "الأولوية القادمة" : "Next priority"}</div><div style={{ color: C.cream, fontWeight: 900, marginTop: 3 }}>{isAr ? next.ar : next.title}</div><div style={{ color: C.amber, fontSize: 11, marginTop: 3 }}>{next.due.toLocaleString()} km {isAr ? "متبقية تقريبًا" : "approximately remaining"}</div></div>}
        <div style={{ marginTop: 10 }}>{plan.map((item) => <div key={item.at} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.line}`, color: C.dim, fontSize: 10 }}><span>{isAr ? item.ar : item.title}</span><strong style={{ color: C.cream }}>{item.due.toLocaleString()} km</strong></div>)}</div>
        <button onClick={save} style={{ width: "100%", marginTop: 11, padding: 10, border: 0, borderRadius: 10, background: C.amber, color: C.asphalt, fontWeight: 900 }}>{saved ? (isAr ? "تم الحفظ ✓" : "Saved ✓") : (isAr ? "حفظ العداد" : "Save mileage")}</button>
        <div style={{ color: C.dim, fontSize: 9, lineHeight: 1.4, marginTop: 8, textAlign: "center" }}>{isAr ? "الخطة إرشادية وقد تختلف حسب الشركة وطراز السيارة وظروف الاستخدام." : "Planning guidance only; intervals vary by vehicle, manufacturer and driving conditions."}</div>
      </div>}
    </div>
  );
}
