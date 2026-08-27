import React, { useEffect, useMemo, useRef, useState } from "react";

const C = { asphalt: "#14171C", panel: "#1D2129", line: "#2A2F38", cream: "#F2ECDD", dim: "#B9B2A0", amber: "#F5B942", red: "#E4432B", green: "#61A56B" };
const KEY = "karaji-maintenance-planner-v1";
const LAST_OIL_KEY = "karaji-maintenance-planner-last-oil-v1";
const INTERVAL_KEY = "karaji-maintenance-planner-oil-interval-v1";
const LAST_OIL_DATE_KEY = "karaji-maintenance-planner-last-oil-date-v1";
const DUE_DATES_KEY = "karaji-maintenance-planner-due-dates-v1";
const UPCOMING_NOTIFIED_KEY = "karaji-maintenance-planner-last-upcoming-notice-v1";
const REMINDER_WINDOW_DAYS = 3;
const TOAST_AUTO_DISMISS_MS = 8000;

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

// Average km driven per day, based on how much mileage has accumulated since
// the last oil change date. Returns null when we don't have enough data yet.
function getDailyAvg(km, lastOilChange, lastOilDate) {
  const n = Number(km || 0);
  const lastOil = Number(lastOilChange || 0);
  if (!lastOilDate || !lastOil) return null;
  const kmDriven = n - lastOil;
  if (kmDriven <= 0) return null;
  const start = new Date(lastOilDate);
  if (Number.isNaN(start.getTime())) return null;
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const daysElapsed = Math.round((today.getTime() - start.getTime()) / 86400000);
  if (daysElapsed <= 0) return null;
  return kmDriven / daysElapsed;
}

// Snapshot the *calendar dates* each item is predicted to be due, using the
// driving pace at the moment of calculation. Once stored, these dates are
// fixed reference points — "days remaining/overdue" is then a plain calendar
// countdown against them, so it changes by exactly 1 day per real day instead
// of drifting based on a recalculated average every time the app is opened.
function computeDueDates(km, lastOilChange, oilInterval, lastOilDate) {
  const dailyAvg = getDailyAvg(km, lastOilChange, lastOilDate);
  if (!dailyAvg) return null;
  const plan = getPlan(km, lastOilChange, oilInterval);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDates = {};
  plan.forEach((item) => {
    if (item.due === null) return;
    const daysFromToday = Math.round(item.due / dailyAvg);
    const d = new Date(today);
    d.setDate(d.getDate() + daysFromToday);
    dueDates[item.title] = d.toISOString().slice(0, 10);
  });
  return dueDates;
}

function daysRemainingFromDueDate(dueDateStr) {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

function formatDaysLeft(days, isAr) {
  if (days === null || days === undefined || Number.isNaN(days)) return "—";
  if (days < 0) {
    const overdueDays = Math.round(Math.abs(days));
    return isAr ? `متأخر بـ ${overdueDays} يوم` : `${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue`;
  }
  if (days < 30) {
    const d = Math.round(days);
    return isAr ? `~${d} يوم متبقي` : `~${d} day${d === 1 ? "" : "s"} left`;
  }
  const months = Math.round((days / 30) * 10) / 10;
  return isAr ? `~${months} شهر متبقي` : `~${months} month${months === 1 ? "" : "s"} left`;
}

export default function KarajiMaintenancePlanner({ lang }) {
  const [appLang, setAppLang] = useState(() => lang || detectAppLanguage());
  const isAr = appLang === "ar";
  const [open, setOpen] = useState(false);
  const [mileage, setMileage] = useState("");
  const [lastOilChange, setLastOilChange] = useState("");
  const [oilInterval, setOilInterval] = useState("");
  const [lastOilDate, setLastOilDate] = useState("");
  const [dueDates, setDueDates] = useState({});
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null); // { kind: "overdue" | "upcoming", title, ar, detail }
  const rootRef = useRef(null);

  useEffect(() => {
    try {
      const storedMileage = localStorage.getItem(KEY) || "";
      const storedLastOil = localStorage.getItem(LAST_OIL_KEY) || "";
      const storedInterval = localStorage.getItem(INTERVAL_KEY) || "";
      const storedLastOilDate = localStorage.getItem(LAST_OIL_DATE_KEY) || "";
      setMileage(storedMileage);
      setLastOilChange(storedLastOil);
      setOilInterval(storedInterval);
      setLastOilDate(storedLastOilDate);

      let storedDueDates = null;
      try {
        const raw = localStorage.getItem(DUE_DATES_KEY);
        if (raw) storedDueDates = JSON.parse(raw);
      } catch (_) {}
      if (!storedDueDates) {
        // First run with this data — snapshot due dates now.
        storedDueDates = computeDueDates(storedMileage, storedLastOil, storedInterval, storedLastOilDate);
        if (storedDueDates) localStorage.setItem(DUE_DATES_KEY, JSON.stringify(storedDueDates));
      }
      if (storedDueDates) setDueDates(storedDueDates);

      const planNow = getPlan(storedMileage, storedLastOil, storedInterval);
      const soonest = planNow[0];
      const todayStr = new Date().toDateString();

      if (soonest && soonest.due !== null) {
        if (soonest.due < 0) {
          // Overdue — shown every time the app opens (not just once/day), since
          // it now stays on screen until the user dismisses it or opens the plan,
          // rather than timing out on its own.
          setToast({
            kind: "overdue",
            title: soonest.title,
            ar: soonest.ar,
            detail: `${Math.abs(soonest.due).toLocaleString()} km`,
          });
        } else if (storedDueDates && storedDueDates[soonest.title]) {
          const daysRemaining = daysRemainingFromDueDate(storedDueDates[soonest.title]);
          if (daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= REMINDER_WINDOW_DAYS) {
            const lastUpcomingNotice = localStorage.getItem(UPCOMING_NOTIFIED_KEY);
            if (lastUpcomingNotice !== todayStr) {
              setToast({
                kind: "upcoming",
                title: soonest.title,
                ar: soonest.ar,
                detail: formatDaysLeft(daysRemaining, isAr),
              });
              localStorage.setItem(UPCOMING_NOTIFIED_KEY, todayStr);
            }
          }
        }
      }
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss "coming up soon" toasts after a few seconds so they never nag.
  // Overdue toasts stay on screen until the user dismisses them or opens the plan —
  // they're urgent enough that they shouldn't vanish on their own.
  useEffect(() => {
    if (!toast || toast.kind === "overdue") return undefined;
    const timer = setTimeout(() => setToast(null), TOAST_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast]);

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
  const planWithDays = useMemo(
    () => plan.map((item) => ({ ...item, daysRemaining: daysRemainingFromDueDate(dueDates[item.title]) })),
    [plan, dueDates]
  );
  const next = planWithDays[0];
  const showReminderBanner = next && next.daysRemaining !== null && next.daysRemaining >= 0 && next.daysRemaining <= REMINDER_WINDOW_DAYS;

  const save = () => {
    try {
      localStorage.setItem(KEY, mileage);
      localStorage.setItem(LAST_OIL_KEY, lastOilChange);
      localStorage.setItem(INTERVAL_KEY, oilInterval);
      localStorage.setItem(LAST_OIL_DATE_KEY, lastOilDate);
      // Recalculate the due-date snapshot from the freshly saved data.
      const freshDueDates = computeDueDates(mileage, lastOilChange, oilInterval, lastOilDate);
      if (freshDueDates) {
        localStorage.setItem(DUE_DATES_KEY, JSON.stringify(freshDueDates));
        setDueDates(freshDueDates);
      } else {
        localStorage.removeItem(DUE_DATES_KEY);
        setDueDates({});
      }
    } catch (_) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const openFromToast = () => {
    setToast(null);
    setOpen(true);
  };

  return (
    <div ref={rootRef} dir={isAr ? "rtl" : "ltr"} style={{ position: "fixed", left: 10, bottom: "calc(70px + env(safe-area-inset-bottom))", zIndex: 9997, fontFamily: "system-ui,sans-serif" }}>
      {!open && toast && (
        <button
          onClick={openFromToast}
          style={{
            display: "flex", alignItems: "center", gap: 8, textAlign: isAr ? "right" : "left",
            width: "min(300px, calc(100vw - 32px))", marginBottom: 9, padding: "10px 12px",
            borderRadius: 12, border: `1px solid ${toast.kind === "overdue" ? C.red : C.amber}66`,
            background: C.panel, boxShadow: "0 12px 30px rgba(0,0,0,.4)", cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>{toast.kind === "overdue" ? "⚠️" : "⏰"}</span>
          <span style={{ flex: 1 }}>
            <span style={{ display: "block", color: toast.kind === "overdue" ? C.red : C.amber, fontWeight: 900, fontSize: 11 }}>
              {toast.kind === "overdue" ? (isAr ? "صيانة متأخرة" : "Overdue maintenance") : (isAr ? "صيانة قريبة" : "Maintenance coming up")}
            </span>
            <span style={{ display: "block", color: C.cream, fontSize: 11, marginTop: 1 }}>
              {isAr ? toast.ar : toast.title} — {toast.detail}
            </span>
          </span>
          <span
            onClick={(e) => { e.stopPropagation(); setToast(null); }}
            style={{ color: C.dim, fontSize: 14, padding: "0 2px" }}
          >
            ×
          </span>
        </button>
      )}

      {open && <div style={{ width: "min(330px, calc(100vw - 32px))", maxHeight: "min(560px, calc(100dvh - 150px))", overflowY: "auto", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: "0 18px 50px rgba(0,0,0,.45)", padding: 14, marginBottom: 9 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div><div style={{ color: C.amber, fontSize: 10, fontWeight: 900 }}>KARAJY</div><div style={{ color: C.cream, fontSize: 16, fontWeight: 900 }}>{isAr ? "خطة الصيانة" : "Maintenance plan"}</div></div>
          <button onClick={() => setOpen(false)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.line}`, background: "transparent", color: C.dim }}>×</button>
        </div>

        {showReminderBanner && (
          <div style={{ marginBottom: 10, padding: 10, borderRadius: 10, border: `1px solid ${C.amber}`, background: `${C.amber}1A`, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>⏰</span>
            <div>
              <div style={{ color: C.amber, fontWeight: 900, fontSize: 12 }}>{isAr ? "تذكير صيانة" : "Maintenance reminder"}</div>
              <div style={{ color: C.cream, fontSize: 11.5, marginTop: 2 }}>
                {isAr
                  ? `${next.ar} متوقع خلال ${formatDaysLeft(next.daysRemaining, true)}`
                  : `${next.title} is expected due ${formatDaysLeft(next.daysRemaining, false)}`}
              </div>
            </div>
          </div>
        )}

        <label style={{ display: "block", color: C.dim, fontSize: 11 }}>
          {isAr ? "عداد الكيلومترات الحالي" : "Current mileage"}
          <input value={mileage} onChange={(e) => setMileage(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="120000" style={{ width: "100%", boxSizing: "border-box", marginTop: 5, padding: 10, borderRadius: 9, border: `1px solid ${C.line}`, background: C.asphalt, color: C.cream }} />
        </label>
        <label style={{ display: "block", color: C.dim, fontSize: 11, marginTop: 10 }}>
          {isAr ? "عداد آخر تغيير زيت" : "Last oil change mileage"}
          <input value={lastOilChange} onChange={(e) => setLastOilChange(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="115000" style={{ width: "100%", boxSizing: "border-box", marginTop: 5, padding: 10, borderRadius: 9, border: `1px solid ${C.line}`, background: C.asphalt, color: C.cream }} />
        </label>
        <label style={{ display: "block", color: C.dim, fontSize: 11, marginTop: 10 }}>
          {isAr ? "تاريخ آخر تغيير زيت" : "Date of last oil change"}
          <input type="date" value={lastOilDate} onChange={(e) => setLastOilDate(e.target.value)} max={new Date().toISOString().slice(0, 10)} style={{ width: "100%", boxSizing: "border-box", marginTop: 5, padding: 10, borderRadius: 9, border: `1px solid ${C.line}`, background: C.asphalt, color: C.cream, colorScheme: "dark" }} />
          <span style={{ display: "block", color: C.dim, fontSize: 9.5, marginTop: 4 }}>{isAr ? "اختياري — يُستخدم لتقدير الأيام/الأشهر المتبقية والتذكير" : "Optional — used to estimate days/months left and to trigger the reminder"}</span>
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
              {next.daysRemaining !== null && <div style={{ color: C.red, fontSize: 10, marginTop: 2, opacity: 0.85 }}>{formatDaysLeft(next.daysRemaining, isAr)}</div>}
            </div>
          ) : (
            <div style={{ marginTop: 10, padding: 11, borderRadius: 11, border: `1px solid ${C.amber}55`, background: `${C.amber}0D` }}>
              <div style={{ color: C.dim, fontSize: 10 }}>{isAr ? "الأولوية القادمة" : "Next priority"}</div>
              <div style={{ color: C.cream, fontWeight: 900, marginTop: 3 }}>{isAr ? next.ar : next.title}</div>
              <div style={{ color: C.amber, fontSize: 11, marginTop: 3 }}>{next.due.toLocaleString()} km {isAr ? "متبقية تقريبًا" : "approximately remaining"}</div>
              {next.daysRemaining !== null && <div style={{ color: C.amber, fontSize: 10, marginTop: 2, opacity: 0.85 }}>{formatDaysLeft(next.daysRemaining, isAr)}</div>}
            </div>
          )
        )}
        {(!next || next.due === null) && <div style={{ marginTop: 10, padding: 11, borderRadius: 11, border: `1px solid ${C.line}`, color: C.dim, fontSize: 10.5, textAlign: "center" }}>{isAr ? "أدخل عداد آخر تغيير زيت واختر الفترة لعرض الخطة" : "Enter last oil change mileage and select an interval to see the plan"}</div>}

        <div style={{ marginTop: 10 }}>{planWithDays.map((item, i) => {
          const overdue = item.due !== null && item.due < 0;
          const kmLabel = item.due === null ? "—" : overdue ? `${Math.abs(item.due).toLocaleString()} km ${isAr ? "متأخرة" : "overdue"}` : `${item.due.toLocaleString()} km`;
          const timeLabel = formatDaysLeft(item.daysRemaining, isAr);
          return (
            <div key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, color: C.dim, fontSize: 10 }}>
                <span>{isAr ? item.ar : item.title}</span>
                <strong style={{ color: overdue ? C.red : C.cream }}>{kmLabel}</strong>
              </div>
              <div style={{ textAlign: isAr ? "left" : "right", color: overdue ? C.red : C.dim, fontSize: 9.5, marginTop: 2, opacity: 0.85 }}>{timeLabel}</div>
            </div>
          );
        })}</div>

        <button onClick={save} style={{ width: "100%", marginTop: 11, padding: 10, border: 0, borderRadius: 10, background: C.amber, color: C.asphalt, fontWeight: 900 }}>{saved ? (isAr ? "تم الحفظ ✓" : "Saved ✓") : (isAr ? "حفظ العداد" : "Save mileage")}</button>
        <div style={{ color: C.dim, fontSize: 9, lineHeight: 1.4, marginTop: 8, textAlign: "center" }}>{isAr ? "الخطة إرشادية وقد تختلف حسب الشركة وطراز السيارة وظروف الاستخدام. الأيام تُحسب من تاريخ استحقاق ثابت يتحدّث فقط عند حفظ عداد جديد." : "Planning guidance only; intervals vary by vehicle, manufacturer and driving conditions. Days are counted from a fixed due date that only updates when you save a new mileage reading."}</div>
      </div>}
    </div>
  );
}
