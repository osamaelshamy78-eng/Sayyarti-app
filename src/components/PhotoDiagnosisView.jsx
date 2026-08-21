import { useRef, useState } from "react";
import BuyCreditForm from "./BuyCreditForm"; // عدّل المسار ده لو حفظت الملف في مكان تاني

const EDGE_FUNCTION_URL =
  "https://fgexzguyjgbwvvqoakly.supabase.co/functions/v1/smart-endpoint";

// ===== باقات الرصيد (لازم تفضل مطابقة لـ BuyCreditForm.jsx) =====
const PACKAGES = [
  { credits: 3, price: 9, labelAr: "تجربة", labelEn: "Trial" },
  { credits: 10, price: 25, labelAr: "قياسية", labelEn: "Standard" },
  { credits: 25, price: 50, labelAr: "موفرة", labelEn: "Saver" },
];

export default function PhotoDiagnosisView({ lang }) {
  const isAr = lang === "ar";

  const [code, setCode] = useState(localStorage.getItem("pd_code") || "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [creditsRemaining, setCreditsRemaining] = useState(null);
  const [buyOpen, setBuyOpen] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        // result looks like "data:image/jpeg;base64,AAAA..."
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError(isAr ? "من فضلك أدخل الكود" : "Please enter your code");
      return;
    }
    if (!imageFile) {
      setError(isAr ? "من فضلك اختر صورة" : "Please select an image");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const imageBase64 = await fileToBase64(imageFile);
      const mediaType = imageFile.type || "image/jpeg";

      const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), imageBase64, mediaType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || (isAr ? "حصل خطأ، حاول تاني" : "Something went wrong"));
        setLoading(false);
        return;
      }

      setResult(data.diagnosis);
      setCreditsRemaining(data.creditsRemaining);
      localStorage.setItem("pd_code", code.trim());
    } catch (err) {
      setError(isAr ? "حصل خطأ في الاتصال، حاول تاني" : "Connection error, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 pb-24" dir={isAr ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-bold mb-2 text-white">
        {isAr ? "تشخيص بالصورة" : "Photo Diagnosis"}
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        {isAr
          ? "ارفع صورة لجزء أو مشكلة في سيارتك وخد تشخيص فوري من الذكاء الاصطناعي"
          : "Upload a photo of a car part or issue and get an instant AI diagnosis"}
      </p>

      <div className="mb-5 bg-gray-50 border rounded-lg p-4">
        <h2 className="font-semibold text-sm mb-2">
          {isAr ? "إزاي الخدمة شغالة؟" : "How does this work?"}
        </h2>
        <ol className={`text-sm text-gray-600 space-y-1 ${isAr ? "pr-4 list-decimal" : "pl-4 list-decimal"}`}>
          <li>
            {isAr
              ? "صوّر أو ارفع صورة واضحة للجزء أو المشكلة في عربيتك"
              : "Take or upload a clear photo of the part or issue"}
          </li>
          <li>
            {isAr
              ? "الذكاء الاصطناعي بيحلل الصورة ويديك تشخيص أولي فوري"
              : "AI analyzes the photo and gives you an instant preliminary diagnosis"}
          </li>
          <li>
            {isAr
              ? "كل تحليل بيخصم كريدت واحد من رصيدك"
              : "Each analysis uses one credit from your balance"}
          </li>
        </ol>
        <p className="text-xs text-gray-400 mt-2">
          {isAr
            ? "التشخيص استرشادي ولا يغني عن فحص ميكانيكي حقيقي."
            : "This diagnosis is advisory only and doesn't replace a real mechanic's inspection."}
        </p>

        <h3 className="font-semibold text-sm mt-4 mb-2">
          {isAr ? "أسعار الرصيد" : "Credit pricing"}
        </h3>
        <div className="space-y-1">
          {PACKAGES.map((pkg) => (
            <div key={pkg.credits} className="flex justify-between text-sm text-gray-600">
              <span>{isAr ? pkg.labelAr : pkg.labelEn} — {isAr ? `${pkg.credits} تشخيص` : `${pkg.credits} diagnoses`}</span>
              <span className="font-semibold text-gray-800">{pkg.price} {isAr ? "درهم" : "AED"}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setBuyOpen(true)}
          className="w-full mt-3 bg-blue-600 text-white font-semibold py-2 rounded-lg text-sm"
        >
          {isAr ? "اشترِ رصيد" : "Buy credit"}
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {isAr ? "كود الرصيد" : "Credit code"}
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={isAr ? "مثال: KRJ-XXXXX" : "e.g. KRJ-XXXXX"}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          {isAr ? "صورة المشكلة" : "Photo"}
        </label>

        {/* Camera: opens the device camera directly on supported phones */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Gallery/device: opens the normal file/photo picker */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="w-full border border-gray-300 bg-white text-gray-800 font-semibold py-3 rounded-lg"
          >
            {isAr ? "📷 التقاط صورة" : "📷 Take photo"}
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="w-full border border-gray-300 bg-white text-gray-800 font-semibold py-3 rounded-lg"
          >
            {isAr ? "🖼️ اختيار من الجهاز" : "🖼️ Choose from device"}
          </button>
        </div>

        {imageFile && (
          <p className="text-xs text-gray-400 mt-2 truncate">
            {isAr ? `الصورة المختارة: ${imageFile.name}` : `Selected: ${imageFile.name}`}
          </p>
        )}

        {imagePreview && (
          <img
            src={imagePreview}
            alt="preview"
            className="mt-3 w-full max-h-64 object-cover rounded-lg border"
          />
        )}
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
      >
        {loading
          ? isAr
            ? "جاري التحليل..."
            : "Analyzing..."
          : isAr
          ? "حلل الصورة"
          : "Analyze Photo"}
      </button>

      {error && (
        <div className="mt-4 bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 bg-gray-50 border rounded-lg p-4">
          <h2 className="font-semibold mb-2">
            {isAr ? "نتيجة التحليل" : "Diagnosis"}
          </h2>
          <p className="whitespace-pre-wrap text-sm">{result}</p>
          {creditsRemaining !== null && (
            <p className="text-xs text-gray-500 mt-3">
              {isAr
                ? `الرصيد المتبقي: ${creditsRemaining}`
                : `Credits remaining: ${creditsRemaining}`}
            </p>
          )}
        </div>
      )}

      <BuyCreditForm isOpen={buyOpen} onClose={() => setBuyOpen(false)} lang={lang} />
    </div>
  );
}
