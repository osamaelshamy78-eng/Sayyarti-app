import { useEffect, useRef, useState } from "react";
import BuyCreditForm from "./BuyCreditForm";

const EDGE_FUNCTION_URL =
  "https://fgexzguyjgbwvvqoakly.supabase.co/functions/v1/smart-endpoint";

const PACKAGES = [
  { credits: 3, price: 9, labelAr: "تجربة", labelEn: "Trial" },
  { credits: 10, price: 25, labelAr: "قياسية", labelEn: "Standard" },
  { credits: 25, price: 50, labelAr: "موفرة", labelEn: "Saver" },
];

const C = {
  asphalt: "#14171C",
  panel: "#1D2129",
  line: "#2A2F38",
  cream: "#F2ECDD",
  dim: "#B9B2A0",
  amber: "#F5B942",
  blue: "#4C7EA8",
  red: "#E4432B",
  green: "#61A56B",
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
      setError(
        isAr
          ? "الفيديو كبير جدًا. اختر فيديو قصير أو أصغر من 30 ميجابايت."
          : "Video is too large. Choose a short video or one under 30 MB."
      );
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
          canvas.toBlob(
            (blob) => {
              video.removeEventListener("seeked", handleSeeked);
              if (!blob) return reject(new Error("Could not extract video frame"));
              resolve(new File([blob], `video-frame-${index + 1}.jpg`, { type: "image/jpeg" }));
            },
            "image/jpeg",
            0.68
          );
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
          const times = Array.from({ length: frameCount }, (_, i) =>
            frameCount === 1 ? 0 : (duration * i) / (frameCount - 1)
          );
          const safeTimes = times.map((t) => Math.max(0, Math.min(duration - 0.05, t)));
          const files = [];

          for (let i = 0; i < safeTimes.length; i += 1) {
            files.push(await canvasFrameToFile(video, safeTimes[i], i));
          }

          cleanup();
          resolve(files);
        } catch (err) {
          cleanup();
          reject(err);
        }
      };

      video.onerror = () => {
        cleanup();
        reject(new Error("Could not read video"));
      };

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
      const isVideo = mediaFile.type.startsWith("video/");
      const imageFiles = isVideo ? await extractVideoFrames(mediaFile) : [mediaFile];
      const imagesBase64 = await Promise.all(imageFiles.map(fileToBase64));

      const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          description: issueDescription.trim(),
          imagesBase64,
          imageBase64: imagesBase64[0],
          mediaType: "image/jpeg",
          mediaKind: isVideo ? "video" : "image",
          frameCount: imagesBase64.length,
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
          ? "تعذر قراءة الملف. جرّب فيديو قصير أو صورة أصغر."
          : "Could not read the file. Try a short video or a smaller photo."
      );
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

  const openGarages = () => window.history.pushState({}, "", "/garages") || window.dispatchEvent(new PopStateEvent("popstate"));
  const openYouTube = () =>
    window.open(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(issueDescription || "car problem diagnosis")}`,
      "_blank",
      "noopener,noreferrer"
    );

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24" dir={isAr ? "rtl" : "ltr"} style={{ color: C.cream }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ color: C.amber, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", marginBottom: 5 }}>
            KARAJY AI
          </div>
          <h1 style={{ margin: 0, fontSize: 24, lineHeight: 1.2, fontWeight: 800 }}>
            {isAr ? "خلّي كراجي يفهم المشكلة" : "Let Karaji understand the problem"}
          </h1>
          <p style={{ color: C.dim, fontSize: 12.5, margin: "6px 0 0", lineHeight: 1.5 }}>
            {isAr ? "صورة أو فيديو + وصفك + كود العطل = تشخيص أوضح وخطوة تالية." : "Photo or video + your description + fault code = clearer diagnosis and a next step."}
          </p>
        </div>
        <div style={{ minWidth: 72, padding: "8px 10px", borderRadius: 999, background: `${C.amber}16`, border: `1px solid ${C.amber}55`, textAlign: "center" }}>
          <div style={{ color: C.dim, fontSize: 9.5 }}>{isAr ? "الرصيد" : "Credits"}</div>
          <div style={{ color: C.amber, fontSize: 17, fontWeight: 900 }}>{creditsRemaining ?? "—"}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, marginBottom: 14 }}>
        {[
          ["01", isAr ? "ارفع" : "Upload"],
          ["02", isAr ? "حلّل" : "Analyze"],
          ["03", isAr ? "تحرّك" : "Act"],
        ].map(([n, label], i) => (
          <div key={n} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: "8px 9px" }}>
            <div style={{ color: i === 2 && result ? C.green : C.amber, fontSize: 10, fontWeight: 900 }}>{n}</div>
            <div style={{ color: C.dim, fontSize: 10.5, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14, marginBottom: 12 }}>
        <div style={{ color: C.cream, fontSize: 13.5, fontWeight: 800, marginBottom: 9 }}>
          {isAr ? "1. ارفع أو صوّر المشكلة" : "1. Upload or capture the problem"}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button type="button" onClick={() => galleryInputRef.current?.click()} style={{ border: `1px solid ${C.line}`, background: C.asphalt, color: C.cream, borderRadius: 12, padding: "12px 8px", cursor: "pointer" }}>
            <div style={{ fontSize: 21 }}>↥</div>
            <div style={{ fontSize: 12, fontWeight: 800, marginTop: 3 }}>{isAr ? "من الجهاز" : "From device"}</div>
            <div style={{ color: C.dim, fontSize: 9.5, marginTop: 2 }}>{isAr ? "صورة أو فيديو" : "Photo or video"}</div>
          </button>

          <button type="button" onPointerDown={startCapturePress} onPointerUp={endCapturePress} onPointerCancel={cancelCapturePress} onPointerLeave={cancelCapturePress} onContextMenu={(e) => e.preventDefault()} style={{ border: `1px solid ${C.amber}66`, background: `${C.amber}0D`, color: C.cream, borderRadius: 12, padding: "12px 8px", cursor: "pointer", userSelect: "none", touchAction: "none" }}>
            <div style={{ fontSize: 21 }}>●</div>
            <div style={{ fontSize: 12, fontWeight: 800, marginTop: 3 }}>{isAr ? "التقاط" : "Capture"}</div>
            <div style={{ color: C.dim, fontSize: 9.5, marginTop: 2 }}>{isAr ? "ضغطة صورة • مطول فيديو" : "Tap photo • hold video"}</div>
          </button>
        </div>

        <input ref={galleryInputRef} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" onChange={handleMediaChange} hidden />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleMediaChange} hidden />
        <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" capture="environment" onChange={handleMediaChange} hidden />

        {mediaFile && (
          <div style={{ marginTop: 10, borderRadius: 11, background: C.asphalt, border: `1px solid ${C.line}`, padding: 10 }}>
            <div style={{ color: C.cream, fontSize: 11.5, fontWeight: 700, overflowWrap: "anywhere" }}>{mediaFile.name}</div>
            <div style={{ color: C.dim, fontSize: 10.5, marginTop: 3 }}>{(mediaFile.size / 1024 / 1024).toFixed(2)} MB</div>
          </div>
        )}
        {mediaFile?.type.startsWith("video/") && mediaPreview && <video src={mediaPreview} controls playsInline style={{ marginTop: 10, width: "100%", maxHeight: 245, objectFit: "contain", borderRadius: 12, background: "#000", display: "block" }} />}
        {mediaFile?.type.startsWith("image/") && mediaPreview && <img src={mediaPreview} alt="preview" style={{ marginTop: 10, width: "100%", maxHeight: 245, objectFit: "contain", borderRadius: 12, background: "#0B0D10", display: "block" }} />}
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14, marginBottom: 12 }}>
        <div style={{ color: C.cream, fontSize: 13.5, fontWeight: 800, marginBottom: 9 }}>{isAr ? "2. قول لنا إيه اللي حصل" : "2. Tell us what happened"}</div>
        <textarea value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} placeholder={isAr ? "مثال: العربية بتنتش عند التسارع وظهرت اللمبة من يومين..." : "Example: the car jerks under acceleration and the warning light appeared two days ago..."} rows={4} style={{ width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: 94, borderRadius: 11, border: `1px solid ${C.line}`, background: C.asphalt, color: C.cream, padding: "11px 12px", outline: "none", fontFamily: "inherit", fontSize: 12.5 }} />
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14, marginBottom: 12 }}>
        <div style={{ color: C.cream, fontSize: 13.5, fontWeight: 800, marginBottom: 9 }}>{isAr ? "3. كود العطل" : "3. Fault code"}</div>
        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder={isAr ? "مثال: P0300" : "e.g. P0300"} style={{ width: "100%", boxSizing: "border-box", borderRadius: 11, border: `1px solid ${C.line}`, background: C.asphalt, color: C.cream, padding: "11px 12px", outline: "none", fontFamily: "monospace", fontSize: 13.5, direction: "ltr" }} />
        <div style={{ color: C.dim, fontSize: 10, marginTop: 6 }}>{isAr ? "الكود يساعد الذكاء الاصطناعي على تضييق الاحتمالات." : "The code helps the AI narrow the likely causes."}</div>
      </div>

      <div style={{ background: `${C.blue}14`, border: `1px solid ${C.blue}44`, borderRadius: 12, padding: "10px 12px", marginBottom: 12 }}>
        <div style={{ color: C.cream, fontSize: 11.5, fontWeight: 800, marginBottom: 4 }}>{isAr ? "نصيحة مهمة" : "Important"}</div>
        <div style={{ color: C.dim, fontSize: 10.5, lineHeight: 1.55 }}>{isAr ? "التشخيص إرشادي وليس بديلًا عن فحص فني مؤهل، خصوصًا في مشاكل الفرامل والوقود والحرارة والوسائد الهوائية." : "This is guidance, not a substitute for a qualified inspection—especially for brakes, fuel, overheating or airbag issues."}</div>
      </div>

      <button onClick={handleAnalyze} disabled={loading} style={{ width: "100%", border: "none", borderRadius: 13, padding: "14px 16px", cursor: loading ? "wait" : "pointer", background: loading ? `${C.amber}55` : C.amber, color: C.asphalt, fontSize: 14, fontWeight: 900, boxShadow: `0 8px 28px ${C.amber}18` }}>
        {loading ? (isAr ? "جاري تحليل الصورة / الفيديو…" : "Analyzing photo / video…") : isAr ? "حلّل المشكلة" : "Analyze the problem"}
      </button>

      {error && <div style={{ marginTop: 12, background: `${C.red}12`, border: `1px solid ${C.red}55`, color: C.cream, borderRadius: 12, padding: "11px 12px", fontSize: 11.5, lineHeight: 1.5 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 14 }}>
          <div style={{ color: C.amber, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.07em", marginBottom: 7 }}>{isAr ? "نتيجة التشخيص" : "DIAGNOSIS RESULT"}</div>
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14 }}>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0, color: C.cream, fontSize: 12.5, lineHeight: 1.75, fontFamily: "inherit" }}>{result}</pre>
            {creditsRemaining !== null && <div style={{ marginTop: 10, paddingTop: 9, borderTop: `1px solid ${C.line}`, color: C.dim, fontSize: 10.5 }}>{isAr ? `الرصيد المتبقي: ${creditsRemaining}` : `Credits remaining: ${creditsRemaining}`}</div>}
          </div>

          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button onClick={openGarages} style={{ border: `1px solid ${C.amber}66`, background: `${C.amber}0D`, color: C.cream, borderRadius: 11, padding: "11px 8px", cursor: "pointer" }}>
              <div style={{ fontSize: 17 }}>⌖</div>
              <div style={{ fontSize: 11.5, fontWeight: 800, marginTop: 3 }}>{isAr ? "هات جراج قريب" : "Find a nearby garage"}</div>
              <div style={{ color: C.dim, fontSize: 9.5, marginTop: 2 }}>{isAr ? "انتقل للورش" : "Open garages"}</div>
            </button>
            <button onClick={openYouTube} style={{ border: `1px solid ${C.blue}66`, background: `${C.blue}12`, color: C.cream, borderRadius: 11, padding: "11px 8px", cursor: "pointer" }}>
              <div style={{ fontSize: 17 }}>▶</div>
              <div style={{ fontSize: 11.5, fontWeight: 800, marginTop: 3 }}>{isAr ? "شوف طريقة الإصلاح" : "Watch repair videos"}</div>
              <div style={{ color: C.dim, fontSize: 9.5, marginTop: 2 }}>{isAr ? "فيديوهات مرتبطة" : "Related videos"}</div>
            </button>
          </div>

          <div style={{ marginTop: 10, background: `${C.green}12`, border: `1px solid ${C.green}44`, borderRadius: 11, padding: "10px 12px", color: C.dim, fontSize: 10.5, lineHeight: 1.55 }}>
            <strong style={{ color: C.cream }}>{isAr ? "الخطوة التالية:" : "Next step:"}</strong>{" "}
            {isAr ? "استخدم نتيجة التشخيص كدليل أولي، ثم اختَر الفيديو أو الجراج المناسب قبل اتخاذ قرار الإصلاح." : "Use the result as a first guide, then choose a repair video or garage before deciding what to do."}
          </div>
        </div>
      )}

      <div style={{ marginTop: 16, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 12 }}>
        <div style={{ color: C.cream, fontSize: 12, fontWeight: 800, marginBottom: 7 }}>{isAr ? "الرصيد" : "Credits"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {PACKAGES.map((pkg) => (
            <button key={pkg.credits} onClick={() => setBuyOpen(true)} style={{ border: `1px solid ${C.line}`, background: C.asphalt, borderRadius: 9, padding: "8px 6px", cursor: "pointer", color: C.cream }}>
              <div style={{ color: C.amber, fontSize: 12.5, fontWeight: 900 }}>{pkg.credits}</div>
              <div style={{ color: C.dim, fontSize: 8.8, marginTop: 2 }}>{isAr ? "تشخيص" : "diagnoses"}</div>
              <div style={{ fontSize: 10, fontWeight: 800, marginTop: 4 }}>{pkg.price} AED</div>
            </button>
          ))}
        </div>
        <button onClick={() => setBuyOpen(true)} style={{ width: "100%", marginTop: 8, border: `1px solid ${C.amber}66`, background: "transparent", color: C.amber, borderRadius: 9, padding: 9, cursor: "pointer", fontSize: 11.5, fontWeight: 800 }}>
          {isAr ? "شراء رصيد" : "Buy credits"}
        </button>
      </div>

      {buyOpen && <BuyCreditForm lang={lang} onClose={() => setBuyOpen(false)} />}
    </div>
  );
}
