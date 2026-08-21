import { useEffect, useRef, useState } from "react";
import BuyCreditForm from "./BuyCreditForm";

const EDGE_FUNCTION_URL =
  "https://fgexzguyjgbwvvqoakly.supabase.co/functions/v1/smart-endpoint";

const PACKAGES = [
  { credits: 3, price: 9, labelAr: "تجربة", labelEn: "Trial" },
  { credits: 10, price: 25, labelAr: "قياسية", labelEn: "Standard" },
  { credits: 25, price: 50, labelAr: "موفرة", labelEn: "Saver" },
];

export default function PhotoDiagnosisView({ lang }) {
  const isAr = lang === "ar";
  const [code, setCode] = useState(() => localStorage.getItem("pd_code") || "");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [creditsRemaining, setCreditsRemaining] = useState(null);
  const [buyOpen, setBuyOpen] = useState(false);
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    if (!mediaFile) {
      setMediaPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(mediaFile);
    setMediaPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type.startsWith("video/") && file.size > 30 * 1024 * 1024) {
      setError(isAr ? "الفيديو كبير جدًا. اختر فيديو أقصر أو أصغر من 30 ميجابايت." : "Video is too large. Choose a shorter video or one under 30 MB.");
      return;
    }

    setMediaFile(file);
    setError(null);
    setResult(null);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Videos are intentionally kept lightweight: the current AI endpoint accepts
  // an image, so we extract the first frame from the selected short video.
  const videoFirstFrame = (file) =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.onloadeddata = () => {
        try {
          video.currentTime = 0;
        } catch (e) {
          cleanup();
          reject(e);
        }
      };
      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          const max = 1280;
          const scale = Math.min(1, max / Math.max(video.videoWidth || 1, video.videoHeight || 1));
          canvas.width = Math.max(1, Math.round((video.videoWidth || 640) * scale));
          canvas.height = Math.max(1, Math.round((video.videoHeight || 360) * scale));
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              cleanup();
              if (!blob) return reject(new Error("Could not extract video frame"));
              resolve(new File([blob], "video-frame.jpg", { type: "image/jpeg" }));
            },
            "image/jpeg",
            0.82
          );
        } catch (e) {
          cleanup();
          reject(e);
        }
      };
      video.onerror = () => {
        cleanup();
        reject(new Error("Could not read video"));
      };
      const cleanup = () => URL.revokeObjectURL(url);
      video.src = url;
      video.load();
    });

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError(isAr ? "من فضلك أدخل الكود" : "Please enter your code");
      return;
    }
    if (!mediaFile) {
      setError(isAr ? "من فضلك اختر صورة أو فيديو" : "Please select a photo or video");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const imageFile = mediaFile.type.startsWith("video/")
        ? await videoFirstFrame(mediaFile)
        : mediaFile;
      const imageBase64 = await fileToBase64(imageFile);

      const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          imageBase64,
          mediaType: "image/jpeg",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isAr ? "حصل خطأ، حاول تاني" : "Something went wrong"));
        return;
      }

      setResult(data.diagnosis);
      setCreditsRemaining(data.creditsRemaining);
      localStorage.setItem("pd_code", code.trim());
    } catch (err) {
      setError(
        isAr
          ? "تعذر قراءة الملف. جرّب صورة أو فيديو أصغر."
          : "Could not read the file. Try a smaller photo or video."
      );
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
          ? "ارفع صورة من جهازك، التقط صورة بالكاميرا، أو اختر فيديو قصير. الفيديو يتم تحليل أول لقطة منه."
          : "Upload a photo, take a photo with your camera, or choose a short video. Videos are analyzed using the first frame."}
      </p>

      <div className="mb-5 bg-gray-50 border rounded-lg p-4">
        <h2 className="font-semibold text-sm mb-2">
          {isAr ? "إزاي الخدمة شغالة؟" : "How does this work?"}
        </h2>
        <ol className={`text-sm text-gray-600 space-y-1 ${isAr ? "pr-4" : "pl-4"}`}>
          <li>{isAr ? "اختر صورة من الجهاز أو التقط صورة بالكاميرا" : "Choose a photo from the device or take one with the camera"}</li>
          <li>{isAr ? "ممكن كمان تختار فيديو قصير للمشكلة" : "You can also choose a short video of the problem"}</li>
          <li>{isAr ? "الذكاء الاصطناعي يحلل الصورة أو أول لقطة من الفيديو" : "AI analyzes the photo or the first video frame"}</li>
          <li>{isAr ? "كل تحليل يخصم كريدت واحد" : "Each analysis uses one credit"}</li>
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
        <button onClick={() => setBuyOpen(true)} className="w-full mt-3 bg-blue-600 text-white font-semibold py-2 rounded-lg text-sm">
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
          {isAr ? "ارفع أو صوّر المشكلة" : "Upload or capture the problem"}
        </label>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="rounded-xl border border-gray-200 bg-white py-3 px-2 text-xs font-semibold text-gray-800"
          >
            📁 {isAr ? "من الجهاز" : "Device"}
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="rounded-xl border border-gray-200 bg-white py-3 px-2 text-xs font-semibold text-gray-800"
          >
            📷 {isAr ? "الكاميرا" : "Camera"}
          </button>
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="rounded-xl border border-gray-200 bg-white py-3 px-2 text-xs font-semibold text-gray-800"
          >
            🎥 {isAr ? "فيديو قصير" : "Short video"}
          </button>
        </div>

        <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleMediaChange} className="hidden" />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleMediaChange} className="hidden" />
        <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" capture="environment" onChange={handleMediaChange} className="hidden" />

        {mediaFile && (
          <div className="mt-3 rounded-xl border bg-white p-3 text-xs text-gray-600">
            <div className="font-semibold text-gray-800 break-all">{mediaFile.name}</div>
            <div className="mt-1">{(mediaFile.size / 1024 / 1024).toFixed(2)} MB</div>
          </div>
        )}
        {mediaFile?.type.startsWith("video/") && mediaPreview && (
          <video src={mediaPreview} controls playsInline className="mt-3 w-full max-h-64 object-contain rounded-lg border bg-black" />
        )}
        {mediaFile?.type.startsWith("image/") && mediaPreview && (
          <img src={mediaPreview} alt="preview" className="mt-3 w-full max-h-64 object-contain rounded-lg border" />
        )}
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
      >
        {loading ? (isAr ? "جاري التحليل..." : "Analyzing...") : isAr ? "حلل الصورة / الفيديو" : "Analyze photo / video"}
      </button>

      {error && <div className="mt-4 bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">{error}</div>}

      {result && (
        <div className="mt-4 bg-gray-50 border rounded-lg p-4">
          <h2 className="font-semibold mb-2">{isAr ? "نتيجة التحليل" : "Diagnosis"}</h2>
          <p className="whitespace-pre-wrap text-sm">{result}</p>
          {creditsRemaining !== null && (
            <p className="text-xs text-gray-500 mt-3">{isAr ? `الرصيد المتبقي: ${creditsRemaining}` : `Credits remaining: ${creditsRemaining}`}</p>
          )}
        </div>
      )}

      <BuyCreditForm isOpen={buyOpen} onClose={() => setBuyOpen(false)} lang={lang} />
    </div>
  );
}
