import React, { useEffect, useMemo, useState } from "react";

const C = { asphalt: "#14171C", panel: "#1D2129", line: "#2A2F38", cream: "#F2ECDD", dim: "#B9B2A0", amber: "#F5B942", red: "#E4432B", green: "#61A56B" };
const KEY = "karaji-maintenance-planner-v1";

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

export default function KarajiMaintenancePlanner({ lang = "ar" }) {
  const isAr = lang === "ar";
  const [open, setOpen] = useState(false);
  const [mileage, setMileage] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try { setMileage(localStorage.getItem(KEY) || ""); } catch (_) {}
  }, []);

  const plan = useMemo(() => getPlan(mileage), [mileage]);
  const next = plan[0];

  const save = () => {
    try { localStorage.setItem(KEY, mileage); } catch (_) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ position: "fixed", left: 10, bottom: "calc(70px + env(safe-area-inset-bottom))", zIndex: 9997, fontFamily: "system-ui,sans-serif" }}>
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
      <button onClick={() => setOpen(v => !v)} aria-label="Maintenance plan" style={{ width: 50, height: 50, borderRadius: "50%", border: `1px solid ${C.line}`, background: C.asphalt, color: C.amber, boxShadow: "0 8px 22px rgba(0,0,0,.35)", fontWeight: 900, fontSize: 11 }}>🔧<br/>{isAr ? "صيانة" : "Service"}</button>
    </div>
  );
}
