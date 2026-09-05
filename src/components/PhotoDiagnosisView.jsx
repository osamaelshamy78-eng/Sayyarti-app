import { useEffect, useRef, useState } from "react";

const EDGE_FUNCTION_URL =
  "https://fgexzguyjgbwvvqoakly.supabase.co/functions/v1/smart-endpoint";

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
  const [issueDescription, setIssueDescription] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
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
    if (!mediaFile) {
      setError(isAr ? "من فضلك اختر صورة أو فيديو أولًا" : "Please choose a photo or video first.");
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
          freeMode: true,
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
        setError(data.error || (isAr ? "حصل خطأ أثناء التحليل، حاول تاني" : "Something went wrong while analyzing the media."));
        return;
      }
      setResult(data.diagnosis);
    } catch (err) {
      setError(isAr ? "تعذر قراءة الملف. جرّب صورة أو فيديو أوضح وأقصر." : "Could not read the file. Try a clearer photo or a shorter video.");
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
  const openGarages = () => {
    window.history.pushState({}, "", "/garages");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  const openYouTube = () => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(issueDescription || "car problem diagnosis")}`, "_blank", "noopener,noreferrer");

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24" dir={isAr ? "rtl" : "ltr"} style={{ color: C.cream }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: C.amber, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.08em", marginBottom: 5 }}>SAYYARTI AI</div>
        <h1 style={{ margin: 0, fontSize: 23, lineHeight: 1.25, fontWeight: 900 }}>
          {isAr ? "شخّص مشكلة سيارتك بالصورة" : "Understand your car problem from a photo"}
        </h1>
        <p style={{ color: C.dim, fontSize: 12.5, margin: "7px 0 0", lineHeight: 1.55 }}>
          {isAr ? "ارفع صورة أو فيديو، واحكي لسيارتي إيه اللي حصل. بدون كود عطل وبدون شراء باقة." : "Upload a photo or video and tell Sayyarti what happened. No fault code and no package required."}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, marginBottom: 12 }}>
        {[["01", isAr ? "صوّر" : "Capture"], ["02", isAr ? "حلّل" : "Analyze"], ["03", isAr ? "حل المشكلة" : "Solve it"]].map(([n, label]) => (
          <div key={n} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: "8px 9px" }}>
            <div style={{ color: C.amber, fontSize: 10, fontWeight: 900 }}>{n}</div>
            <div style={{ color: C.dim, fontSize: 10.5, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14, marginBottom: 12 }}>
        <div style={{ color: C.cream, fontSize: 13.5, fontWeight: 800, marginBottom: 9 }}>{isAr ? "1. ارفع أو صوّر المشكلة" : "1. Upload or capture the problem"}</div>
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
        {mediaFile && <div style={{ marginTop: 10, borderRadius: 11, background: C.asphalt, border: `1px solid ${C.line}`, padding: 10 }}><div style={{ color: C.cream, fontSize: 11.5, fontWeight: 700, overflowWrap: "anywhere" }}>{mediaFile.name}</div><div style={{ color: C.dim, fontSize: 10.5, marginTop: 3 }}>{(mediaFile.size / 1024 / 1024).toFixed(2)} MB</div></div>}
        {mediaFile?.type.startsWith("video/") && mediaPreview && <video src={mediaPreview} controls playsInline style={{ marginTop: 10, width: "100%", maxHeight: 245, objectFit: "contain", borderRadius: 12, background: "#000", display: "block" }} />}
        {mediaFile?.type.startsWith("image/") && mediaPreview && <img src={mediaPreview} alt="preview" style={{ marginTop: 10, width: "100%", maxHeight: 245, objectFit: "contain", borderRadius: 12, background: "#0B0D10", display: "block" }} />}
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14, marginBottom: 12 }}>
        <div style={{ color: C.cream, fontSize: 13.5, fontWeight: 800, marginBottom: 8 }}>{isAr ? "2. احكي لسيارتي إيه اللي حصل" : "2. Tell Sayyarti what happened"}</div>
        <textarea value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} placeholder={isAr ? "مثال: العربية بدأت تخرج دخان أبيض من الكبوت..." : "Example: the car started making a strange noise when I brake..."} rows={4} style={{ width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: 95, background: C.asphalt, border: `1px solid ${C.line}`, borderRadius: 12, color: C.cream, padding: "11px 12px", outline: "none", fontFamily: "inherit", fontSize: 13, lineHeight: 1.55 }} />
      </div>

      <div style={{ background: `${C.blue}12`, border: `1px solid ${C.blue}55`, borderRadius: 13, padding: "11px 12px", marginBottom: 12 }}>
        <div style={{ color: C.cream, fontSize: 12.5, fontWeight: 800, marginBottom: 4 }}>{isAr ? "مهم" : "Important"}</div>
        <div style={{ color: C.dim, fontSize: 11.5, lineHeight: 1.55 }}>{isAr ? "التشخيص إرشادي وليس بديلًا عن فحص فني مؤهل، خصوصًا في الفرامل والوقود وارتفاع الحرارة والإيرباج." : "This is guidance, not a substitute for a qualified inspection, especially for brakes, fuel, overheating or airbag issues."}</div>
      </div>

      <button type="button" onClick={handleAnalyze} disabled={loading} style={{ width: "100%", background: loading ? `${C.amber}88` : C.amber, color: C.asphalt, border: "none", borderRadius: 13, padding: "14px 16px", cursor: loading ? "wait" : "pointer", fontSize: 14.5, fontWeight: 900 }}>
        {loading ? (isAr ? "جاري التحليل..." : "Analyzing...") : (isAr ? "حلّل المشكلة مجانًا" : "Analyze the problem — Free")}
      </button>

      {error && <div style={{ marginTop: 10, background: `${C.red}12`, border: `1px solid ${C.red}66`, borderRadius: 12, padding: "10px 12px", color: C.cream, fontSize: 12.5 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 14 }}>
          <div style={{ background: C.panel, border: `1px solid ${C.green}55`, borderRadius: 16, padding: 14 }}>
            <div style={{ color: C.green, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.05em", marginBottom: 7 }}>{isAr ? "نتيجة التحليل" : "ANALYSIS RESULT"}</div>
            <div style={{ color: C.cream, whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.7 }}>{result}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            <button type="button" onClick={openGarages} style={{ background: C.amber, color: C.asphalt, border: "none", borderRadius: 11, padding: "11px 8px", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>{isAr ? "جراجات قريبة" : "Nearby garages"}</button>
            <button type="button" onClick={openYouTube} style={{ background: "transparent", color: C.cream, border: `1px solid ${C.line}`, borderRadius: 11, padding: "11px 8px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>{isAr ? "فيديوهات الإصلاح" : "Repair videos"}</button>
          </div>
          <div style={{ marginTop: 9, color: C.dim, fontSize: 10.5, lineHeight: 1.5, textAlign: "center" }}>{isAr ? "لو النتيجة غير واضحة، جرّب صورة أقرب للجزء المتأثر أو أضف تفاصيل أكثر في الوصف." : "If the result is unclear, try a closer photo of the affected part or add more detail to the description."}</div>
        </div>
      )}
    </div>
  );
}
