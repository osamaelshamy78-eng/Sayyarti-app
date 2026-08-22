import React, { useEffect, useMemo, useState } from "react";

const C = {
  asphalt: "#14171C",
  panel: "#1D2129",
  line: "#2A2F38",
  cream: "#F2ECDD",
  dim: "#B9B2A0",
  amber: "#F5B942",
  red: "#E4432B",
  green: "#61A56B",
};

const STORAGE_KEY = "karaji-ai-assistant-v1";

function getAssessment({ mileage, serviceDate, warning, symptom }) {
  let score = 100;
  const reasons = [];
  const km = Number(mileage || 0);

  if (km >= 180000) {
    score -= 25;
    reasons.push("High mileage: inspect major wear items.");
  } else if (km >= 120000) {
    score -= 15;
    reasons.push("Higher mileage: stay strict with preventive maintenance.");
  }

  if (serviceDate) {
    const days = Math.floor((Date.now() - new Date(serviceDate).getTime()) / 86400000);
    if (days > 365) {
      score -= 20;
      reasons.push("More than a year since the recorded service date.");
    } else if (days > 180) {
      score -= 8;
      reasons.push("A service check may be due soon.");
    }
  }

  if (warning === "critical") {
    score -= 45;
    reasons.push("A critical warning light requires prompt inspection.");
  } else if (warning === "warning") {
    score -= 20;
    reasons.push("A warning light is active; diagnose it before the issue grows.");
  }

  if (symptom.trim()) {
    score -= 8;
    reasons.push("A reported symptom should be checked rather than ignored.");
  }

  score = Math.max(0, Math.min(100, score));
  const urgent = warning === "critical" || /brake|smoke|overheat|oil pressure|fuel leak|فرامل|دخان|حرارة|زيت|تسريب/i.test(symptom);
  return { score, urgent, reasons };
}

export default function KarajiAIAssistant({ lang = "ar" }) {
  const isAr = lang === "ar";
  const [open, setOpen] = useState(false);
  const [mileage, setMileage] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [warning, setWarning] = useState("none");
  const [symptom, setSymptom] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!savedState) return;
      setMileage(savedState.mileage || "");
      setServiceDate(savedState.serviceDate || "");
      setWarning(savedState.warning || "none");
      setSymptom(savedState.symptom || "");
    } catch (_) {}
  }, []);

  const assessment = useMemo(
    () => getAssessment({ mileage, serviceDate, warning, symptom }),
    [mileage, serviceDate, warning, symptom]
  );

  const saveProfile = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mileage, serviceDate, warning, symptom }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const openGarages = () => {
    window.history.pushState({}, "", "/garages");
    window.dispatchEvent(new PopStateEvent("popstate"));
    setOpen(false);
  };

  const openDiagnose = () => {
    const target = Array.from(document.querySelectorAll("button")).find((b) => /diagnos|شخّص|عطل|fix/i.test(b.textContent || ""));
    if (target) target.click();
    else window.location.hash = "#diagnose";
    setOpen(false);
  };

  const scoreLabel = assessment.urgent
    ? (isAr ? "يحتاج فحصًا سريعًا" : "Needs prompt inspection")
    : assessment.score >= 80
      ? (isAr ? "الحالة جيدة مبدئيًا" : "Looks healthy for now")
      : (isAr ? "يحتاج متابعة" : "Needs follow-up");

  const translatedReason = (reason) => isAr
    ? reason
      .replace("High mileage", "عداد مرتفع")
      .replace("Higher mileage", "عداد مرتفع")
      .replace("A critical warning light requires prompt inspection.", "لمبة تحذير خطيرة تحتاج فحصًا سريعًا.")
      .replace("A warning light is active; diagnose it before the issue grows.", "هناك لمبة تحذير؛ شخّصها قبل أن تتفاقم المشكلة.")
      .replace("A reported symptom should be checked rather than ignored.", "الأعراض المبلغ عنها تحتاج فحصًا ولا يُفضّل تجاهلها.")
    : reason;

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ position: "fixed", right: 10, bottom: "calc(70px + env(safe-area-inset-bottom))", zIndex: 9998, fontFamily: "system-ui, sans-serif", maxWidth: "calc(100vw - 20px)" }}>
      {open && (
        <div style={{
          width: "min(390px, calc(100vw - 32px))",
          height: "min(680px, calc(100dvh - 190px - env(safe-area-inset-bottom)))",
          maxHeight: "calc(100dvh - 190px - env(safe-area-inset-bottom))",
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          boxSizing: "border-box",
          background: C.panel,
          border: `1px solid ${C.line}`,
          borderRadius: 18,
          boxShadow: "0 18px 50px rgba(0,0,0,.45)",
          padding: 14,
          marginBottom: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div>
              <div style={{ color: C.amber, fontSize: 10, fontWeight: 900, letterSpacing: ".08em" }}>KARAJY AI</div>
              <div style={{ color: C.cream, fontSize: 17, fontWeight: 900, marginTop: 2 }}>{isAr ? "مساعد سيارتك الذكي" : "Your AI car assistant"}</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.dim, borderRadius: 9, width: 32, height: 32, flex: "0 0 auto" }}>×</button>
          </div>

          <div style={{ background: C.asphalt, border: `1px solid ${C.line}`, borderRadius: 13, padding: 12, marginBottom: 10 }}>
            <div style={{ color: C.cream, fontSize: 12, fontWeight: 800, marginBottom: 8 }}>{isAr ? "ملخص السيارة" : "Car snapshot"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
              <label style={{ color: C.dim, fontSize: 10, minWidth: 0 }}>
                {isAr ? "عداد الكيلومترات" : "Mileage"}
                <input value={mileage} onChange={(e) => setMileage(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="120000" style={{ width: "100%", boxSizing: "border-box", marginTop: 4, padding: "9px 8px", borderRadius: 9, border: `1px solid ${C.line}`, background: C.panel, color: C.cream }} />
              </label>
              <label style={{ color: C.dim, fontSize: 10, minWidth: 0 }}>
                {isAr ? "آخر صيانة" : "Last service"}
                <input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} style={{ width: "100%", boxSizing: "border-box", marginTop: 4, padding: "8px 6px", borderRadius: 9, border: `1px solid ${C.line}`, background: C.panel, color: C.cream }} />
              </label>
            </div>
            <label style={{ display: "block", color: C.dim, fontSize: 10, marginTop: 9 }}>
              {isAr ? "لمبة تحذير؟" : "Warning light?"}
              <select value={warning} onChange={(e) => setWarning(e.target.value)} style={{ width: "100%", marginTop: 4, padding: "9px 8px", borderRadius: 9, border: `1px solid ${C.line}`, background: C.panel, color: C.cream }}>
                <option value="none">{isAr ? "لا توجد" : "None"}</option>
                <option value="warning">{isAr ? "تحذير" : "Warning"}</option>
                <option value="critical">{isAr ? "خطيرة" : "Critical"}</option>
              </select>
            </label>
            <label style={{ display: "block", color: C.dim, fontSize: 10, marginTop: 9 }}>
              {isAr ? "ما المشكلة؟" : "What is happening?"}
              <textarea value={symptom} onChange={(e) => setSymptom(e.target.value)} rows={3} placeholder={isAr ? "مثال: صوت عند الفرملة..." : "Example: noise when braking..."} style={{ width: "100%", boxSizing: "border-box", marginTop: 4, padding: "9px 8px", borderRadius: 9, border: `1px solid ${C.line}`, background: C.panel, color: C.cream, resize: "vertical", fontFamily: "inherit", minHeight: 78 }} />
            </label>
          </div>

          <div style={{ border: `1px solid ${assessment.urgent ? C.red : C.green}55`, background: `${assessment.urgent ? C.red : C.green}0D`, borderRadius: 13, padding: 12, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ color: C.dim, fontSize: 10, fontWeight: 800 }}>{isAr ? "مؤشر صحة السيارة" : "Car health indicator"}</span>
              <strong style={{ color: assessment.urgent ? C.red : C.green, fontSize: 19 }}>{assessment.score}%</strong>
            </div>
            <div style={{ color: C.cream, fontSize: 12, fontWeight: 800, marginTop: 4 }}>{scoreLabel}</div>
            {assessment.reasons.length > 0 && <ul style={{ margin: "7px 0 0", paddingInlineStart: 18, color: C.dim, fontSize: 10.5, lineHeight: 1.55 }}>{assessment.reasons.slice(0, 3).map((reason) => <li key={reason}>{translatedReason(reason)}</li>)}</ul>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
            <button type="button" onClick={saveProfile} style={{ border: "none", background: C.amber, color: C.asphalt, borderRadius: 10, padding: 10, fontWeight: 900 }}>{saved ? (isAr ? "تم الحفظ ✓" : "Saved ✓") : (isAr ? "حفظ" : "Save")}</button>
            <button type="button" onClick={openDiagnose} style={{ border: `1px solid ${C.line}`, background: "transparent", color: C.cream, borderRadius: 10, padding: 10, fontWeight: 800 }}>{isAr ? "تشخيص بالصور" : "Photo diagnosis"}</button>
          </div>
          <button type="button" onClick={openGarages} style={{ width: "100%", marginTop: 8, border: `1px solid ${C.line}`, background: C.asphalt, color: C.cream, borderRadius: 10, padding: 10, fontWeight: 800 }}>{isAr ? "ابحث عن جراج قريب" : "Find a nearby garage"}</button>
          <div style={{ color: C.dim, fontSize: 9.5, lineHeight: 1.45, marginTop: 9, textAlign: "center", paddingBottom: 2 }}>{isAr ? "المؤشر تقديري وليس تشخيصًا ميكانيكيًا. لا تعتمد عليه في الحالات الخطرة." : "This indicator is a planning aid, not a mechanical diagnosis. Do not rely on it for safety-critical issues."}</div>
        </div>
      )}

      <button type="button" onClick={() => setOpen((value) => !value)} aria-label="Karaji AI" style={{ width: 58, height: 58, borderRadius: "50%", border: `2px solid ${C.asphalt}`, background: C.amber, color: C.asphalt, boxShadow: "0 8px 24px rgba(0,0,0,.35)", fontSize: 11, fontWeight: 950, cursor: "pointer" }}>
        <div style={{ fontSize: 18, lineHeight: 1 }}>✦</div>
        AI
      </button>
    </div>
  );
}
