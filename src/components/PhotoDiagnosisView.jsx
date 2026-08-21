import { useEffect, useRef, useState } from "react";
import BuyCreditForm from "./BuyCreditForm";

const EDGE_FUNCTION_URL =
  "https://fgexzguyjgbwvvqoakly.supabase.co/functions/v1/smart-endpoint";

const PACKAGES = [
  { credits: 3, price: 9, labelAr: "تجربة", labelEn: "Trial" },
  { credits: 10, price: 25, labelAr: "قياسية", labelEn: "Standard" },
  { credits: 25, price: 50, labelAr: "موفرة", labelEn: "Saver" },
];

const buildActionProfile = (diagnosis, description, isAr) => {
  const text = `${diagnosis || ""} ${description || ""}`.toLowerCase();
  const urgentTerms = [
    "brake", "oil pressure", "overheating", "overheat", "smoke", "fuel leak",
    "gasoline leak", "coolant leak", "fire", "no brake", "فرامل", "حرارة",
    "سخونة", "دخان", "بنزين", "تسريب وقود", "زيت",
  ];
  const urgent = urgentTerms.some((term) => text.includes(term));
  return {
    urgent,
    driveLabel: urgent
      ? isAr
        ? "الأفضل توقف القيادة وتفحص السيارة قبل التحرك إذا كانت المشكلة مؤثرة على السلامة."
        : "Avoid driving if the issue affects braking, overheating, fuel leaks, smoke, or other safety-critical systems."
      : isAr
      ? "التشخيص استرشادي؛ لو العربية فيها أعراض قوية أو بتسوء، افحصها عند فني قبل الاستمرار في القيادة."
      : "This is advisory guidance; if symptoms are severe or getting worse, have the car inspected before continuing to drive.",
    mapsQuery: description?.trim() ? `${description.trim()} car garage` : "car diagnostic garage",
    videoQuery: description?.trim() ? `${description.trim()} car repair diagnostic` : "car repair diagnostic",
  };
};

export default function PhotoDiagnosisView({ lang }) {
  const isAr = lang === "ar";
  const [code, setCode] = useState(() => localStorage.getItem("pd_code") || "");
  const [issueDescription, setIssueDescription] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [creditsRemaining, setCreditsRemaining] = useState(null);
  const [buyOpen, setBuyOpen] = useState(false);
  const [actionProfile, setActionProfile] = useState(null);
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);

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
      setError(isAr ? "الفيديو كبير جدًا. اختر فيديو قصير أو أصغر من 30 ميجابايت." : "Video is too large. Choose a short video or one under 30 MB.");
      return;
    }
    setMediaFile(file);
    setError(null);
    setResult(null);
    setActionProfile(null);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const canvasFrameToFile = (video, time, index) =>
    new Promise((resolve, reject) => {
      const handleSeeked = () => {
        try {
          const max = 720;
          const width = video.videoWidth || 640;
          const height = video.videoHeight || 360;
          const scale = Math.min(1, max / Math.max(width, height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(width * scale));
          canvas.height = Math.max(1, Math.round(height * scale));
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            video.removeEventListener("seeked", handleSeeked);
            if (!blob) return reject(new Error("Could not extract video frame"));
            resolve(new File([blob], `video-frame-${index + 1}.jpg`, { type: "image/jpeg" }));
          }, "image/jpeg", 0.68);
        } catch (err) {
          video.removeEventListener("seeked", handleSeeked);
          reject(err);
        }
      };
      video.addEventListener("seeked", handleSeeked, { once: true });
      video.currentTime = time;
    });

  const extractVideoFrames = (file) =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      const cleanup = () => URL.revokeObjectURL(url);
      video.onloadedmetadata = async () => {
        try {
          const duration = Number(video.duration || 0);
          if (!Number.isFinite(duration) || duration <= 0) throw new Error("Invalid video duration");
          const frameCount = Math.min(6, Math.max(3, Math.ceil(duration / 2)));
          const times = Array.from({ length: frameCount }, (_, i) => frameCount === 1 ? 0 : (duration * i) / (frameCount - 1));
          const safeTimes = times.map((t) => Math.max(0, Math.min(duration - 0.05, t)));
          const files = [];
          for (let i = 0; i < safeTimes.length; i += 1) files.push(await canvasFrameToFile(video, safeTimes[i], i));
          cleanup();
          resolve(files);
        } catch (err) {
          cleanup();
          reject(err);
        }
      };
      video.onerror = () => { cleanup(); reject(new Error("Could not read video")); };
      video.src = url;
      video.load();
    });

  const handleAnalyze = async () => {
    if (!code.trim()) { setError(isAr ? "من فضلك أدخل الكود" : "Please enter your code"); return; }
    if (!mediaFile) { setError(isAr ? "من فضلك اختر صورة أو فيديو" : "Please select a photo or video"); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    setActionProfile(null);
    try {
      const isVideo = mediaFile.type.startsWith("video/");
      const imageFiles = isVideo ? await extractVideoFrames(mediaFile) : [mediaFile];
      const imagesBase64 = await Promise.all(imageFiles.map(fileToBase64));
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), description: issueDescription.trim(), imagesBase64, imageBase64: imagesBase64[0], mediaType: "image/jpeg", mediaKind: isVideo ? "video" : "image", frameCount: imagesBase64.length }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isAr ? "حصل خطأ، حاول تاني" : "Something went wrong"));
        return;
      }
      setResult(data.diagnosis);
      setCreditsRemaining(data.creditsRemaining);
      setActionProfile(buildActionProfile(data.diagnosis, issueDescription, isAr));
      localStorage.setItem("pd_code", code.trim());
    } catch (err) {
      setError(isAr ? "تعذر قراءة الملف. جرّب فيديو قصير أو صورة أصغر." : "Could not read the file. Try a short video or a smaller photo.");
    } finally {
      setLoading(false);
    }
  };

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };
  const startCapturePress = () => {
    longPressTriggeredRef.current = false;
    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      videoInputRef.current?.click();
    }, 650);
  };
  const endCapturePress = () => {
    clearLongPressTimer();
    if (!longPressTriggeredRef.current) cameraInputRef.current?.click();
  };
  const cancelCapturePress = () => {
    clearLongPressTimer();
    longPressTriggeredRef.current = true;
  };
  const openMaps = () => {
    const query = encodeURIComponent(actionProfile?.mapsQuery || "car diagnostic garage");
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener,noreferrer");
  };
  const openVideoSearch = () => {
    const query = encodeURIComponent(actionProfile?.videoQuery || "car repair diagnostic");
    window.open(`https://www.youtube.com/results?search_query=${query}`, "_blank", "noopener,noreferrer");
  };
  const openInfoSearch = () => {
    const query = encodeURIComponent(isAr ? `مشكلة سيارة: ${issueDescription || result}` : `Car problem: ${issueDescription || result}`);
    window.open(`https://www.google.com/search?q=${query}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-lg mx-auto p-4 pb-24" dir={isAr ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-bold mb-2 text-white">{isAr ? "تشخيص بالصورة" : "Photo Diagnosis"}</h1>
      <p className="text-sm text-gray-400 mb-6">{isAr ? "ارفع صورة أو فيديو قصير من جهازك، أو اضغط على الالتقاط للصورة واضغط مطولًا للفيديو." : "Upload a photo or short video, tap Capture for a photo, or press and hold for video."}</p>

      <div className="mb-5 bg-gray-50 border rounded-lg p-4">
        <h2 className="font-semibold text-sm mb-2">{isAr ? "إزاي الخدمة شغالة؟" : "How does this work?"}</h2>
        <ol className={`text-sm text-gray-600 space-y-1 ${isAr ? "pr-4" : "pl-4"}`}>
          <li>{isAr ? "اختر صورة أو فيديو من الجهاز، أو التقط صورة بالكاميرا" : "Choose a photo or video from the device, or take a photo with the camera"}</li>
          <li>{isAr ? "اضغط مطولًا على زر الالتقاط لتسجيل فيديو قصير" : "Press and hold Capture to record a short video"}</li>
          <li>{isAr ? "الذكاء الاصطناعي يحلل مجموعة لقطات من الفيديو عبر مدته، وليس أول لقطة فقط" : "For video, AI analyzes multiple frames sampled across the video, not only the first frame"}</li>
          <li>{isAr ? "كل تحليل يخصم كريدت واحد" : "Each analysis uses one credit"}</li>
        </ol>
        <p className="text-xs text-gray-400 mt-2">{isAr ? "التشخيص استرشادي ولا يغني عن فحص ميكانيكي حقيقي." : "This diagnosis is advisory only and doesn't replace a real mechanic's inspection."}</p>
        <h3 className="font-semibold text-sm mt-4 mb-2">{isAr ? "أسعار الرصيد" : "Credit pricing"}</h3>
        <div className="space-y-1">
          {PACKAGES.map((pkg) => <div key={pkg.credits} className="flex justify-between text-sm text-gray-600"><span>{isAr ? pkg.labelAr : pkg.labelEn} — {isAr ? `${pkg.credits} تشخيص` : `${pkg.credits} diagnoses`}</span><span className="font-semibold text-gray-800">{pkg.price} {isAr ? "درهم" : "AED"}</span></div>)}
        </div>
        <button onClick={() => setBuyOpen(true)} className="w-full mt-3 bg-blue-600 text-white font-semibold py-2 rounded-lg text-sm">{isAr ? "اشترِ رصيد" : "Buy credit"}</button>
      </div>

      <div className="mb-4"><label className="block text-sm font-medium mb-1">{isAr ? "كود الرصيد" : "Credit code"}</label><input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder={isAr ? "مثال: KRJ-XXXXX" : "e.g. KRJ-XXXXX"} className="w-full border rounded-lg px-3 py-2" /></div>
      <div className="mb-4"><label className="block text-sm font-medium mb-1">{isAr ? "وصف العطل" : "Issue description"}</label><textarea value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} placeholder={isAr ? "اكتب وصف العطل بالتفصيل" : "Describe the issue in detail"} rows={4} className="w-full border rounded-lg px-3 py-2 resize-y" /></div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">{isAr ? "ارفع أو صوّر المشكلة" : "Upload or capture the problem"}</label>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => galleryInputRef.current?.click()} className="rounded-xl border border-gray-200 bg-white py-3 px-2 text-xs font-semibold text-gray-800">📁 {isAr ? "من الجهاز" : "Device"}<span className="block mt-1 font-normal text-gray-500">{isAr ? "صورة أو فيديو" : "Photo or video"}</span></button>
          <button type="button" onPointerDown={startCapturePress} onPointerUp={endCapturePress} onPointerCancel={cancelCapturePress} onPointerLeave={cancelCapturePress} onContextMenu={(e) => e.preventDefault()} className="rounded-xl border border-gray-200 bg-white py-3 px-2 text-xs font-semibold text-gray-800 select-none touch-none" aria-label={isAr ? "التقاط صورة أو تسجيل فيديو" : "Capture photo or record video"}>📷 {isAr ? "التقاط" : "Capture"}<span className="block mt-1 font-normal text-gray-500">{isAr ? "ضغطة: صورة • مطول: فيديو" : "Tap: photo • Hold: video"}</span></button>
        </div>
        <input ref={galleryInputRef} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" onChange={handleMediaChange} className="hidden" />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleMediaChange} className="hidden" />
        <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" capture="environment" onChange={handleMediaChange} className="hidden" />
        {mediaFile && <div className="mt-3 rounded-xl border bg-white p-3 text-xs text-gray-600"><div className="font-semibold text-gray-800 break-all">{mediaFile.name}</div><div className="mt-1">{(mediaFile.size / 1024 / 1024).toFixed(2)} MB</div></div>}
        {mediaFile?.type.startsWith("video/") && mediaPreview && <video src={mediaPreview} controls playsInline className="mt-3 w-full max-h-64 object-contain rounded-lg border bg-black" />}
        {mediaFile?.type.startsWith("image/") && mediaPreview && <img src={mediaPreview} alt="preview" className="mt-3 w-full max-h-64 object-contain rounded-lg border" />}
      </div>

      <button onClick={handleAnalyze} disabled={loading} className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50">{loading ? (isAr ? "جاري تحليل الملف..." : "Analyzing...") : isAr ? "حلل الصورة / الفيديو" : "Analyze photo / video"}</button>
      {error && <div className="mt-4 bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">{error}</div>}

      {result && (
        <>
          <div className="mt-4 bg-gray-50 border rounded-lg p-4"><h2 className="font-semibold mb-2">{isAr ? "نتيجة التشخيص" : "Diagnosis result"}</h2><pre className="whitespace-pre-wrap text-sm text-gray-700">{result}</pre>{creditsRemaining !== null && <div className="mt-3 text-xs text-gray-500">{isAr ? `الرصيد المتبقي: ${creditsRemaining}` : `Credits remaining: ${creditsRemaining}`}</div>}</div>
          {actionProfile && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2"><span className="text-lg">🧭</span><h2 className="font-bold text-gray-900 text-base">{isAr ? "طيب تعمل إيه دلوقتي؟" : "What should you do next?"}</h2></div>
              <div className={`rounded-xl p-3 mb-3 ${actionProfile.urgent ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}><div className={`text-sm font-semibold ${actionProfile.urgent ? "text-red-800" : "text-amber-800"}`}>{isAr ? "مستوى التنبيه" : "Safety note"}</div><p className={`text-xs leading-5 mt-1 ${actionProfile.urgent ? "text-red-700" : "text-amber-700"}`}>{actionProfile.driveLabel}</p></div>
              <div className="grid grid-cols-1 gap-2">
                <button onClick={openVideoSearch} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-3 text-sm font-semibold text-gray-900 flex items-center justify-center gap-2">▶️ {isAr ? "شوف فيديوهات مرتبطة بالعطل" : "Watch repair videos"}</button>
                <button onClick={openMaps} className="w-full rounded-xl bg-blue-600 py-3 px-3 text-sm font-semibold text-white flex items-center justify-center gap-2">📍 {isAr ? "دور على جراج قريب" : "Find a nearby garage"}</button>
                <button onClick={openInfoSearch} className="w-full rounded-xl border border-gray-200 bg-white py-3 px-3 text-sm font-semibold text-gray-800 flex items-center justify-center gap-2">🔎 {isAr ? "اقرأ معلومات إضافية عن المشكلة" : "Read more about this issue"}</button>
              </div>
              <p className="text-[11px] text-gray-400 mt-3 leading-5">{isAr ? "كراجي لا يضمن نتيجة الإصلاح أو جودة أي جراج مستقل. استخدم معلومات التشخيص كإرشاد، وتأكد من الخدمة والأسعار قبل التعاقد." : "Karaji does not guarantee repair outcomes or the quality of independent garages. Use the diagnosis as guidance and confirm service details and pricing before hiring."}</p>
            </div>
          )}
        </>
      )}
      {buyOpen && <BuyCreditForm lang={lang} onClose={() => setBuyOpen(false)} />}
    </div>
  );
}
