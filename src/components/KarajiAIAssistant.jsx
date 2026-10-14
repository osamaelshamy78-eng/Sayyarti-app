import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useAppLang } from "../appLanguage";
import { useCloseOnBack } from "../backButton";
import { NAV_BUTTON_STYLE, NAV_ACTIVE_STYLE } from "./BottomNav";
import { C } from "../theme";


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

export default function KarajiAIAssistant() {
  const isAr = useAppLang() === "ar";
  const [open, setOpen] = useState(false);
  useCloseOnBack(open, () => setOpen(false));
  const [mileage, setMileage] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [warning, setWarning] = useState("none");
  const [symptom, setSymptom] = useState("");
  const [saved, setSaved] = useState(false);
  const rootRef = useRef(null);

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

  useEffect(() => {
    if (!open) return undefined;
    const handleOutsidePointer = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handleOutsidePointer, true);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer, true);
  }, [open]);

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
    window.history.pushState({}, "", "/diagnosis");
    window.dispatchEvent(new PopStateEvent("popstate"));
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
    <div ref={rootRef} dir={isAr ? "rtl" : "ltr"} style={{ position: "fixed", right: "calc(var(--app-gutter) + 10px)", bottom: "calc(70px + env(safe-area-inset-bottom))", zIndex: 9998, fontFamily: "inherit", maxWidth: "calc(100vw - 20px)" }}>
      {open && (
        <div style={{
          width: "min(390px, calc(100vw - 32px))",
          height: "min(680px, calc(100dvh - 190px - env(safe-area-inset-bottom)))",
          maxHeight: "calc(100dvh - 190px - env(safe-area-inset-bottom))",
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          boxSizing: "border-box",
          background: C.surface,
          border: `1px solid ${C.line}`,
          borderRadius: 18,
          boxShadow: "0 18px 50px rgba(14,27,44,.16)",
          padding: 14,
          marginBottom: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div>
              <div style={{ color: C.accent, fontSize: 10, fontWeight: 900, letterSpacing: ".08em" }}>SAYYARTI AI</div>
              <div style={{ color: C.text, fontSize: 17, fontWeight: 900, marginTop: 2 }}>{isAr ? "مساعد سيارتك الذكي" : "Your AI car assistant"}</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={isAr ? "إغلاق" : "Close"} style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.textDim, borderRadius: 9, width: 32, height: 32, flex: "0 0 auto" }}>×</button>
          </div>

          <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 13, padding: 12, marginBottom: 10 }}>
            <div style={{ color: C.text, fontSize: 12, fontWeight: 800, marginBottom: 8 }}>{isAr ? "ملخص السيارة" : "Car snapshot"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
              <label style={{ color: C.textDim, fontSize: 10, minWidth: 0 }}>
                {isAr ? "عداد الكيلومترات" : "Mileage"}
                <input value={mileage} onChange={(e) => setMileage(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="120000" style={{ width: "100%", boxSizing: "border-box", marginTop: 4, padding: "9px 8px", borderRadius: 9, border: `1px solid ${C.line}`, background: C.surface, color: C.text }} />
              </label>
              <label style={{ color: C.textDim, fontSize: 10, minWidth: 0 }}>
                {isAr ? "آخر صيانة" : "Last service"}
                <input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} style={{ width: "100%", boxSizing: "border-box", marginTop: 4, padding: "8px 6px", borderRadius: 9, border: `1px solid ${C.line}`, background: C.surface, color: C.text }} />
              </label>
            </div>
            <label style={{ display: "block", color: C.textDim, fontSize: 10, marginTop: 9 }}>
              {isAr ? "لمبة تحذير؟" : "Warning light?"}
              <select value={warning} onChange={(e) => setWarning(e.target.value)} style={{ width: "100%", marginTop: 4, padding: "9px 8px", borderRadius: 9, border: `1px solid ${C.line}`, background: C.surface, color: C.text }}>
                <option value="none">{isAr ? "لا توجد" : "None"}</option>
                <option value="warning">{isAr ? "تحذير" : "Warning"}</option>
                <option value="critical">{isAr ? "خطيرة" : "Critical"}</option>
              </select>
            </label>
            <label style={{ display: "block", color: C.textDim, fontSize: 10, marginTop: 9 }}>
              {isAr ? "ما المشكلة؟" : "What is happening?"}
              <textarea value={symptom} onChange={(e) => setSymptom(e.target.value)} rows={3} placeholder={isAr ? "مثال: صوت عند الفرملة..." : "Example: noise when braking..."} style={{ width: "100%", boxSizing: "border-box", marginTop: 4, padding: "9px 8px", borderRadius: 9, border: `1px solid ${C.line}`, background: C.surface, color: C.text, resize: "vertical", fontFamily: "inherit", minHeight: 78 }} />
            </label>
          </div>

          <div style={{ border: `1px solid ${assessment.urgent ? C.red : C.green}55`, background: `${assessment.urgent ? C.red : C.green}0D`, borderRadius: 13, padding: 12, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ color: C.textDim, fontSize: 10, fontWeight: 800 }}>{isAr ? "مؤشر صحة السيارة" : "Car health indicator"}</span>
              <strong style={{ color: assessment.urgent ? C.red : C.green, fontSize: 19 }}>{assessment.score}%</strong>
            </div>
            <div style={{ color: C.text, fontSize: 12, fontWeight: 800, marginTop: 4 }}>{scoreLabel}</div>
            {assessment.reasons.length > 0 && <ul style={{ margin: "7px 0 0", paddingInlineStart: 18, color: C.textDim, fontSize: 10.5, lineHeight: 1.55 }}>{assessment.reasons.slice(0, 3).map((reason) => <li key={reason}>{translatedReason(reason)}</li>)}</ul>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
            <button type="button" onClick={saveProfile} style={{ border: "none", background: C.accent, color: C.onAccent, borderRadius: 10, padding: 10, fontWeight: 900 }}>{saved ? (isAr ? "تم الحفظ ✓" : "Saved ✓") : (isAr ? "حفظ" : "Save")}</button>
            <button type="button" onClick={openDiagnose} style={{ border: `1px solid ${C.line}`, background: "transparent", color: C.text, borderRadius: 10, padding: 10, fontWeight: 800 }}>{isAr ? "تشخيص بالصور" : "Photo diagnosis"}</button>
          </div>
          <button type="button" onClick={openGarages} style={{ width: "100%", marginTop: 8, border: `1px solid ${C.line}`, background: C.bg, color: C.text, borderRadius: 10, padding: 10, fontWeight: 800 }}>{isAr ? "ابحث عن جراج قريب" : "Find a nearby garage"}</button>
          <div style={{ color: C.textDim, fontSize: 9.5, lineHeight: 1.45, marginTop: 9, textAlign: "center", paddingBottom: 2 }}>{isAr ? "المؤشر تقديري وليس تشخيصًا ميكانيكيًا. لا تعتمد عليه في الحالات الخطرة." : "This indicator is a planning aid, not a mechanical diagnosis. Do not rely on it for safety-critical issues."}</div>
        </div>
      )}

      {/* sits on the bottom nav's last slot: right in English, left in Arabic */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Sayyarti AI"
        aria-expanded={open}
        style={{
          ...NAV_BUTTON_STYLE,
          ...(open ? NAV_ACTIVE_STYLE : null),
          position: "fixed",
          [isAr ? "left" : "right"]: "calc(var(--app-gutter) + 10px)",
          bottom: "calc(8px + env(safe-area-inset-bottom))",
          width: "calc((min(100vw, var(--app-width)) - 32px) / 3)",
          zIndex: 10001,
          boxShadow: "0 8px 24px rgba(14,27,44,.16)",
        }}
      >
        <Sparkles size={20} strokeWidth={2} aria-hidden="true" />
        <div>{isAr ? "مساعد السيارة الذكي" : "AI Assistant"}</div>
      </button>
    </div>
  );
}
