import { useState } from "react";
import { CAR_MAKES, CAR_MODELS } from "./CarForm.jsx";
import { useCustomerAuth } from "../useCustomerAuth";
import CustomerAuthGate from "./CustomerAuthGate";
import BuyCreditForm from "./BuyCreditForm";
import { C } from "../theme";

const EDGE_FUNCTION_URL =
  "https://fgexzguyjgbwvvqoakly.supabase.co/functions/v1/car-valuation";


const COUNTRIES = [
  { code: "uae", en: "United Arab Emirates", ar: "الإمارات" },
  { code: "ksa", en: "Saudi Arabia", ar: "السعودية" },
  { code: "egypt", en: "Egypt", ar: "مصر" },
];

const CONDITIONS = [
  { id: "excellent", en: "Excellent", ar: "ممتازة" },
  { id: "good", en: "Good", ar: "جيدة" },
  { id: "fair", en: "Has some issues", ar: "فيها بعض الأعطال" },
];

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: C.bg,
  border: `1px solid ${C.line}`,
  borderRadius: 12,
  color: C.text,
  padding: "11px 12px",
  fontSize: 13,
  outline: "none",
};

export default function CarValuationView({ lang }) {
  const isAr = lang === "ar";
  const { user, accessToken, checking, signInWithGoogle } = useCustomerAuth();
  const [form, setForm] = useState({
    country: "",
    make: "",
    model: "",
    trim: "",
    year: "",
    mileage: "",
    engineSize: "",
    specs: "",
    condition: "",
    defects: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showBuyCredit, setShowBuyCredit] = useState(false);
  const [needsCreditsMsg, setNeedsCreditsMsg] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value, ...(key === "make" ? { model: "" } : {}) }));
  const modelOptions = form.make && form.make !== "Other" ? CAR_MODELS[form.make] || [] : [];

  const canSubmit =
    form.country && form.make && form.model && form.year && form.mileage;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ ...form, lang }),
      });
      const data = await res.json();
      if (res.status === 402 || data.needsCredits) {
        setNeedsCreditsMsg(true);
        return;
      }
      if (!res.ok) {
        setError(data.error || (isAr ? "حصل خطأ، حاول تاني" : "Something went wrong, please try again."));
        return;
      }
      setNeedsCreditsMsg(false);
      setResult(data);
    } catch (err) {
      setError(isAr ? "تعذر الاتصال بالخادم، تأكد من الإنترنت وحاول تاني" : "Could not connect. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerAuthGate
      lang={lang}
      user={user}
      checking={checking}
      signInWithGoogle={signInWithGoogle}
      titleAr="سجّل دخولك عشان تجرب مجانًا"
      titleEn="Sign in to try it free"
      descAr="محاولة واحدة مجانية لكل حساب، وبعدها تقدر تشتري كريديتس لو حبيت تكمل."
      descEn="One free try per account. After that, you can buy credits to keep going."
    >
      <div className="max-w-lg mx-auto px-4 pt-4 pb-24" dir={isAr ? "rtl" : "ltr"} style={{ color: C.text }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: C.accent, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.08em", marginBottom: 5 }}>SAYYARTI AI</div>
          <h1 style={{ margin: 0, fontSize: 23, lineHeight: 1.25, fontWeight: 900 }}>
            {isAr ? "قيّم سعر سيارتك" : "Estimate your car's price"}
          </h1>
          <p style={{ color: C.textDim, fontSize: 12.5, margin: "7px 0 0", lineHeight: 1.55 }}>
            {isAr
              ? "دخّل بيانات سيارتك وهيدور الذكاء الاصطناعي على إعلانات حقيقية مشابهة في سوقك ويديك نطاق سعر تقريبي."
              : "Enter your car's details and the AI will search real comparable listings in your market for an estimated price range."}
          </p>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14, marginBottom: 12, display: "grid", gap: 10 }}>
          <div>
            <label style={{ color: C.textDim, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4 }}>{isAr ? "الدولة" : "Country"}</label>
            <select style={inputStyle} value={form.country} onChange={set("country")}>
              <option value="">{isAr ? "اختر الدولة" : "Select country"}</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{isAr ? c.ar : c.en}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label style={{ color: C.textDim, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4 }}>{isAr ? "الماركة" : "Make"}</label>
              <select style={inputStyle} value={form.make} onChange={set("make")}>
                <option value="">{isAr ? "اختر" : "Select"}</option>
                {CAR_MAKES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ color: C.textDim, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4 }}>{isAr ? "الموديل" : "Model"}</label>
              {modelOptions.length ? (
                <select style={inputStyle} value={form.model} onChange={set("model")}>
                  <option value="">{isAr ? "اختر" : "Select"}</option>
                  {modelOptions.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              ) : (
                <input
                  style={inputStyle}
                  value={form.model}
                  onChange={set("model")}
                  placeholder={isAr ? "اكتب الموديل" : "Type the model"}
                />
              )}
            </div>
          </div>

          <div>
            <label style={{ color: C.textDim, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4 }}>
              {isAr ? "الفئة/التريم (اختياري)" : "Trim / Grade (optional)"}
            </label>
            <input
              style={inputStyle}
              value={form.trim}
              onChange={set("trim")}
              placeholder={isAr ? "مثال: LE، Limited، GLX" : "e.g. LE, Limited, GLX"}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label style={{ color: C.textDim, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4 }}>{isAr ? "السنة" : "Year"}</label>
              <input type="number" style={inputStyle} value={form.year} onChange={set("year")} placeholder={isAr ? "مثال: 2019" : "e.g. 2019"} />
            </div>
            <div>
              <label style={{ color: C.textDim, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4 }}>{isAr ? "الكيلومترات" : "Mileage (km)"}</label>
              <input type="number" style={inputStyle} value={form.mileage} onChange={set("mileage")} placeholder={isAr ? "مثال: 85000" : "e.g. 85000"} />
            </div>
          </div>

          <div>
            <label style={{ color: C.textDim, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4 }}>
              {isAr ? "سعة المحرك (اختياري)" : "Engine size (optional)"}
            </label>
            <input
              style={inputStyle}
              value={form.engineSize}
              onChange={set("engineSize")}
              placeholder={isAr ? "مثال: 2.0L، V6 3.5L" : "e.g. 2.0L, V6 3.5L"}
            />
          </div>

          <div>
            <label style={{ color: C.textDim, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6 }}>{isAr ? "المواصفات" : "Specs"}</label>
            <div className="flex gap-2">
              {[
                { id: "gulf", en: "Gulf specs", ar: "خليجي" },
                { id: "american", en: "American specs", ar: "أمريكي" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, specs: f.specs === s.id ? "" : s.id }))}
                  style={{
                    flex: 1,
                    padding: "9px 10px",
                    borderRadius: 10,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: `1px solid ${form.specs === s.id ? C.accent : C.line}`,
                    background: form.specs === s.id ? `${C.accent}1A` : C.bg,
                    color: form.specs === s.id ? C.accent : C.textDim,
                  }}
                >
                  {isAr ? s.ar : s.en}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ color: C.textDim, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6 }}>{isAr ? "الحالة العامة" : "Overall condition"}</label>
            <div className="flex gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, condition: f.condition === c.id ? "" : c.id }))}
                  style={{
                    flex: 1,
                    padding: "9px 6px",
                    borderRadius: 10,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: `1px solid ${form.condition === c.id ? C.accent : C.line}`,
                    background: form.condition === c.id ? `${C.accent}1A` : C.bg,
                    color: form.condition === c.id ? C.accent : C.textDim,
                  }}
                >
                  {isAr ? c.ar : c.en}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ color: C.textDim, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4 }}>
              {isAr ? "أي عيوب تحب تذكرها؟ (اختياري)" : "Any defects to mention? (optional)"}
            </label>
            <textarea
              rows={3}
              style={{ ...inputStyle, resize: "vertical", minHeight: 70, fontFamily: "inherit" }}
              value={form.defects}
              onChange={set("defects")}
              placeholder={isAr ? "مثال: خدوش في الباب، حادثة بسيطة قديمة..." : "e.g. scratches on the door, an old minor accident..."}
            />
          </div>
        </div>

        <div style={{ background: `${C.blue}12`, border: `1px solid ${C.blue}55`, borderRadius: 13, padding: "11px 12px", marginBottom: 12 }}>
          <div style={{ color: C.textDim, fontSize: 11.5, lineHeight: 1.55 }}>
            {isAr
              ? "التقييم تقديري وبناءً على إعلانات السوق الحالية، مش تقييم رسمي معتمد."
              : "This is an approximate estimate based on current market listings, not an official valuation."}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          style={{
            width: "100%",
            background: !canSubmit || loading ? `${C.accent}88` : C.accent,
            color: C.onAccent,
            border: "none",
            borderRadius: 13,
            padding: "14px 16px",
            cursor: !canSubmit || loading ? "not-allowed" : "pointer",
            fontSize: 14.5,
            fontWeight: 900,
          }}
        >
          {loading ? (isAr ? "جاري البحث والتحليل..." : "Searching & analyzing...") : (isAr ? "قيّم السيارة" : "Get price estimate")}
        </button>

        {error && (
          <div style={{ marginTop: 10, background: `${C.red}12`, border: `1px solid ${C.red}66`, borderRadius: 12, padding: "10px 12px", color: C.text, fontSize: 12.5 }}>
            {error}
          </div>
        )}

        {needsCreditsMsg && (
          <div style={{ marginTop: 10, background: `${C.accent}14`, border: `1px solid ${C.accent}55`, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ color: C.text, fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
              {isAr ? "خلصت محاولتك المجانية. اشترِ كريديتس عشان تكمل." : "You've used your free try. Buy credits to continue."}
            </div>
            <button
              type="button"
              onClick={() => setShowBuyCredit(true)}
              style={{ width: "100%", background: C.accent, color: C.onAccent, border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 900, cursor: "pointer" }}
            >
              {isAr ? "اشترِ كريديتس" : "Buy credits"}
            </button>
          </div>
        )}

        {result && (
          <div style={{ marginTop: 14 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.green}55`, borderRadius: 16, padding: 14 }}>
              <div style={{ color: C.green, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.05em", marginBottom: 7 }}>
                {isAr ? "التقييم التقريبي" : "ESTIMATED VALUE"}
              </div>
              <div style={{ color: C.text, whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.7 }}>{result.estimate}</div>
            </div>
            {result.creditsRemaining != null && (
              <div style={{ marginTop: 9, color: C.textDim, fontSize: 10.5, lineHeight: 1.5, textAlign: "center" }}>
                {isAr ? `الرصيد المتبقي: ${result.creditsRemaining}` : `Credits remaining: ${result.creditsRemaining}`}
              </div>
            )}
          </div>
        )}
      </div>

      <BuyCreditForm
        isOpen={showBuyCredit}
        onClose={() => setShowBuyCredit(false)}
        lang={lang}
        userEmail={user?.email}
      />
    </CustomerAuthGate>
  );
}
