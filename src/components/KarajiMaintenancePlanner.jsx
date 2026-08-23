import React, { useEffect, useMemo, useRef, useState } from "react";

const C = { asphalt: "#14171C", panel: "#1D2129", line: "#2A2F38", cream: "#F2ECDD", dim: "#B9B2A0", amber: "#F5B942", red: "#E4432B", green: "#61A56B" };
const KEY = "karaji-maintenance-planner-v1";
const LAST_OIL_KEY = "karaji-maintenance-planner-last-oil-v1";
const INTERVAL_KEY = "karaji-maintenance-planner-oil-interval-v1";

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

// Ratios preserved from the original fixed plan (5000 / 10000 / 20000 / 40000):
// tire&brake = 2x oil interval, air filter&fluids = 4x, major check = 8x.
const RATIOS = [
  { mult: 1, title: "Oil & filter", ar: "تغيير الزيت والفلتر" },
  { mult: 2, title: "Tire & brake inspection", ar: "فحص الإطارات والفرامل" },
  { mult: 4, title: "Air filter & fluids", ar: "فلتر الهواء وفحص السوائل" },
  { mult: 8, title: "Major preventive check", ar: "فحص وقائي شامل" },
];

function getPlan(km, lastOilChange, oilInterval) {
  const n = Number(km || 0);
  const interval = Number(oilInterval || 0);
  const lastOil = Number(lastOilChange || 0);
  const haveLastOil = lastOilChange !== "" && lastOilChange != null && !Number.isNaN(lastOil) && lastOil > 0;
  const haveInterval = oilInterval !== "" && oilInterval != null && interval > 0;
  const ready = haveLastOil && haveInterval;

  return RATIOS.map((item) => {
    if (!ready) return { ...item, at: null, due: null };
    const at = interval * item.mult;
    // due = threshold minus how far the car has driven since the last oil change.
    // Positive = km remaining until due. Negative = km overdue.
    const due = at - (n - lastOil);
    return { ...item, at, due };
  }).sort((a, b) => {
    if (a.due === null && b.due === null) return 0;
    if (a.due === null) return 1;
    if (b.due === null) return -1;
    return a.due - b.due;
  });
}

export default function KarajiMaintenancePlanner({ lang }) {
  const [appLang, setAppLang] = useState(() => lang || detectAppLanguage());
  const isAr = appLang === "ar";
  const [open, setOpen] = useState(false);
  const [mileage, setMileage] = useState("");
  const [lastOilChange, setLastOilChange] = useState("");
  const [oilInterval, setOilInterval] = useState("");
  const [saved, setSaved] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    try {
      setMileage(localStorage.getItem(KEY) || "");
      setLastOilChange(localStorage.getItem(LAST_OIL_KEY) || "");
      setOilInterval(localStorage.getItem(INTERVAL_KEY) || "");
    } catch (_) {}
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

  // The Maintenance bottom-nav button opens this planner through this event.
  useEffect(() => {
    const openPlanner = () => setOpen(true);
    window.addEventListener("karaji-open-maintenance-planner", openPlanner);
    return () => window.removeEventListener("karaji-open-maintenance-planner", openPlanner);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const handleOutsidePointer = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handleOutsidePointer, true);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer, true);
  }, [open]);

  const plan = useMemo(() => getPlan(mileage, lastOilChange, oilInterval), [mileage, lastOilChange, oilInterval]);
  const next = plan[0];
  const save = () => {
    try {
      localStorage.setItem(KEY, mileage);
      localStorage.setItem(LAST_OIL_KEY, lastOilChange);
      localStorage.setItem(INTERVAL_KEY, oilInterval);
    } catch (_) {}
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
        <label style={{ display: "block", color: C.dim, fontSize: 11, marginTop: 10 }}>
          {isAr ? "عداد آخر تغيير زيت" : "Last oil change mileage"}
          <input value={lastOilChange} onChange={(e) => setLastOilChange(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="115000" style={{ width: "100%", boxSizing: "border-box", marginTop: 5, padding: 10, borderRadius: 9, border: `1px solid ${C.line}`, background: C.asphalt, color: C.cream }} />
        </label>
        <label style={{ display: "block", color: C.dim, fontSize: 11, marginTop: 10 }}>
          {isAr ? "الفترة بين تغييرات الزيت" : "Oil change interval"}
          <select value={oilInterval} onChange={(e) => setOilInterval(e.target.value)} style={{ width: "100%", boxSizing: "border-box", marginTop: 5, padding: 10, borderRadius: 9, border: `1px solid ${C.line}`, background: C.asphalt, color: C.cream }}>
            <option value="">{isAr ? "اختر الفترة" : "Select interval"}</option>
            <option value="5000">5,000 km</option>
            <option value="10000">10,000 km</option>
          </select>
        </label>
        {next && next.due !== null && (
          next.due < 0 ? (
            <div style={{ marginTop: 10, padding: 11, borderRadius: 11, border: `1px solid ${C.red}55`, background: `${C.red}0D` }}>
              <div style={{ color: C.dim, fontSize: 10 }}>{isAr ? "الأولوية القادمة" : "Next priority"}</div>
              <div style={{ color: C.cream, fontWeight: 900, marginTop: 3 }}>{isAr ? next.ar : next.title}</div>
              <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{Math.abs(next.due).toLocaleString()} km {isAr ? "متأخرة عن الموعد" : "overdue"}</div>
            </div>
          ) : (
            <div style={{ marginTop: 10, padding: 11, borderRadius: 11, border: `1px solid ${C.amber}55`, background: `${C.amber}0D` }}>
              <div style={{ color: C.dim, fontSize: 10 }}>{isAr ? "الأولوية القادمة" : "Next priority"}</div>
              <div style={{ color: C.cream, fontWeight: 900, marginTop: 3 }}>{isAr ? next.ar : next.title}</div>
              <div style={{ color: C.amber, fontSize: 11, marginTop: 3 }}>{next.due.toLocaleString()} km {isAr ? "متبقية تقريبًا" : "approximately remaining"}</div>
            </div>
          )
        )}
        {(!next || next.due === null) && <div style={{ marginTop: 10, padding: 11, borderRadius: 11, border: `1px solid ${C.line}`, color: C.dim, fontSize: 10.5, textAlign: "center" }}>{isAr ? "أدخل عداد آخر تغيير زيت واختر الفترة لعرض الخطة" : "Enter last oil change mileage and select an interval to see the plan"}</div>}
        <div style={{ marginTop: 10 }}>{plan.map((item, i) => {
          const overdue = item.due !== null && item.due < 0;
          const label = item.due === null ? "—" : overdue ? `${Math.abs(item.due).toLocaleString()} km ${isAr ? "متأخرة" : "overdue"}` : `${item.due.toLocaleString()} km`;
          return (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.line}`, color: C.dim, fontSize: 10 }}>
              <span>{isAr ? item.ar : item.title}</span>
              <strong style={{ color: overdue ? C.red : C.cream }}>{label}</strong>
            </div>
          );
        })}</div>
        <button onClick={save} style={{ width: "100%", marginTop: 11, padding: 10, border: 0, borderRadius: 10, background: C.amber, color: C.asphalt, fontWeight: 900 }}>{saved ? (isAr ? "تم الحفظ ✓" : "Saved ✓") : (isAr ? "حفظ العداد" : "Save mileage")}</button>
        <div style={{ color: C.dim, fontSize: 9, lineHeight: 1.4, marginTop: 8, textAlign: "center" }}>{isAr ? "الخطة إرشادية وقد تختلف حسب الشركة وطراز السيارة وظروف الاستخدام." : "Planning guidance only; intervals vary by vehicle, manufacturer and driving conditions."}</div>
      </div>}
    </div>
  );
}
