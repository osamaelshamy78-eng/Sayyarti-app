import React, { useEffect, useMemo, useState } from "react";

const C = {
  bg: "#14171C",
  panel: "#1D2129",
  line: "#2A2F38",
  text: "#F2ECDD",
  dim: "#B9B2A0",
  amber: "#F5B942",
  red: "#E4432B",
  blue: "#4C7EA8",
};

const guides = [
  {
    id: "spark-plugs",
    titleEn: "Replace Spark Plugs",
    titleAr: "تغيير البوجيهات",
    difficulty: "Medium",
    time: "25 min",
    tools: ["10mm socket", "Spark-plug socket", "Ratchet"],
    stepsEn: [
      "Open the engine cover and locate the ignition coils.",
      "Disconnect the coil connector and remove the retaining bolt.",
      "Lift the coil, then loosen and remove the spark plug.",
      "Install the new plug, tighten to the correct torque and refit the coil.",
    ],
    stepsAr: [
      "افتح غطاء المحرك وحدد مكان كويلات الإشعال.",
      "افصل فيشة الكويل وفك مسمار التثبيت.",
      "ارفع الكويل ثم فك البوجيه القديم وأخرجه.",
      "ركب البوجيه الجديد بالعزم المناسب ثم أعد تركيب الكويل.",
    ],
  },
  {
    id: "battery",
    titleEn: "Replace Car Battery",
    titleAr: "تغيير بطارية السيارة",
    difficulty: "Easy",
    time: "10 min",
    tools: ["10mm wrench", "Gloves"],
    stepsEn: [
      "Switch the vehicle off and identify the positive and negative terminals.",
      "Disconnect the negative terminal first, then the positive terminal.",
      "Remove the battery hold-down and lift the old battery out.",
      "Install the new battery, secure it, then reconnect positive before negative.",
    ],
    stepsAr: [
      "اقفل العربية وحدد قطبي البطارية الموجب والسالب.",
      "افصل القطب السالب أولاً ثم القطب الموجب.",
      "فك تثبيت البطارية وارفع البطارية القديمة.",
      "ركب البطارية الجديدة وثبتها ثم وصل الموجب قبل السالب.",
    ],
  },
];

function EngineScene({ step, playing, progress }) {
  const coilLift = step >= 2 ? -24 - progress * 6 : 0;
  const plugLift = step >= 3 ? -32 * Math.min(progress * 1.35, 1) : 0;
  const rotation = 18 + progress * 8;

  return (
    <div className="fix3d-scene" style={{ perspective: 1100 }}>
      <div className="fix3d-shadow" />
      <div
        className="fix3d-engine"
        style={{ transform: `rotateX(${rotation}deg) rotateY(-18deg) rotateZ(-1deg)` }}
      >
        <div className="fix3d-engine-top">
          <span>2.0L DOHC</span>
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="fix3d-coil"
            style={{ transform: `translate3d(${i * 44 - 66}px, ${coilLift * (i === 1 ? 1 : 0.7)}px, ${i * 5}px)` }}
          >
            <div className="fix3d-coil-cap" />
            <div className="fix3d-coil-body" />
            {i === 1 && <div className="fix3d-highlight">TARGET</div>}
          </div>
        ))}
        <div className="fix3d-plug" style={{ transform: `translate3d(0, ${plugLift}px, 44px)` }}>
          <div className="fix3d-plug-metal" />
          <div className="fix3d-plug-tip" />
        </div>
        <div className="fix3d-label label-coils">IGNITION COILS</div>
        <div className="fix3d-label label-plug">SPARK PLUG</div>
      </div>
      <div className="fix3d-controls">
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("fix3d-toggle"))}>
          {playing ? "❚❚" : "▶"}
        </button>
        <div className="fix3d-progress"><span style={{ width: `${progress * 100}%` }} /></div>
        <span>{Math.round(progress * 4) + 1}/4</span>
      </div>
    </div>
  );
}

export default function Fix3DLibrary() {
  const [lang, setLang] = useState("en");
  const [guideId, setGuideId] = useState("spark-plugs");
  const [step, setStep] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const guide = useMemo(() => guides.find((g) => g.id === guideId) || guides[0], [guideId]);
  const steps = lang === "ar" ? guide.stepsAr : guide.stepsEn;
  const title = lang === "ar" ? guide.titleAr : guide.titleEn;

  useEffect(() => {
    const toggle = () => setPlaying((p) => !p);
    window.addEventListener("fix3d-toggle", toggle);
    return () => window.removeEventListener("fix3d-toggle", toggle);
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = p + 0.025;
        if (next >= 1) {
          setPlaying(false);
          setStep((s) => (s >= 4 ? 1 : s + 1));
          return 0;
        }
        return next;
      });
    }, 90);
    return () => clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    setStep(1);
    setProgress(0);
    setPlaying(false);
  }, [guideId]);

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="fix3d-page">
      <style>{`
        .fix3d-page{min-height:100vh;background:${C.bg};color:${C.text};font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:18px;box-sizing:border-box}
        .fix3d-shell{max-width:1050px;margin:auto}
        .fix3d-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}
        .fix3d-brand{font-weight:900;letter-spacing:.5px}.fix3d-sub{color:${C.dim};font-size:12px;margin-top:2px}
        .fix3d-lang{display:flex;gap:7px}.fix3d-lang button,.fix3d-back{border:1px solid ${C.line};background:${C.panel};color:${C.text};padding:8px 10px;border-radius:10px;cursor:pointer;font-weight:700}
        .fix3d-grid{display:grid;grid-template-columns:290px 1fr;gap:14px}
        .fix3d-card{background:${C.panel};border:1px solid ${C.line};border-radius:18px;overflow:hidden}
        .fix3d-list{padding:10px}.fix3d-item{width:100%;text-align:start;background:transparent;border:1px solid transparent;color:${C.text};padding:13px;border-radius:12px;cursor:pointer;margin-bottom:6px}.fix3d-item.active{border-color:${C.amber};background:rgba(245,185,66,.09)}
        .fix3d-item strong{display:block}.fix3d-meta{font-size:11px;color:${C.dim};margin-top:4px}
        .fix3d-stage{padding:14px}.fix3d-title{font-size:21px;font-weight:900;margin:2px 0 3px}.fix3d-caption{font-size:12px;color:${C.dim};margin-bottom:12px}
        .fix3d-scene{height:380px;border-radius:16px;background:radial-gradient(circle at 50% 24%,#2d3540 0,#202731 42%,#171b21 75%);border:1px solid ${C.line};position:relative;overflow:hidden}
        .fix3d-shadow{position:absolute;left:50%;top:56%;width:270px;height:60px;background:rgba(0,0,0,.45);filter:blur(16px);transform:translateX(-50%);border-radius:50%}
        .fix3d-engine{position:absolute;left:50%;top:51%;width:250px;height:150px;transform-style:preserve-3d;transform-origin:center}
        .fix3d-engine-top{position:absolute;inset:0;border-radius:22px;background:linear-gradient(145deg,#5d6670,#232932 55%,#15191e);box-shadow:inset 0 1px 0 rgba(255,255,255,.15),0 18px 24px rgba(0,0,0,.3);display:grid;place-items:center;font-size:13px;font-weight:900;color:#c8d0d7}
        .fix3d-coil{position:absolute;left:50%;top:33px;width:32px;height:70px;transform-style:preserve-3d;transition:transform .2s}.fix3d-coil-cap{height:14px;background:#15181c;border-radius:6px 6px 3px 3px;box-shadow:inset 0 0 0 1px #59626b}.fix3d-coil-body{height:48px;background:linear-gradient(90deg,#0b0e11,#343b44 48%,#101317);border-radius:0 0 7px 7px;box-shadow:inset 0 0 0 1px #464e57}.fix3d-highlight{position:absolute;top:-22px;left:-16px;font-size:8px;font-weight:900;color:${C.amber};letter-spacing:1px}
        .fix3d-plug{position:absolute;left:50%;top:70px;width:16px;height:92px;transform-style:preserve-3d;transition:transform .2s}.fix3d-plug-metal{height:72px;background:linear-gradient(90deg,#9ca3aa,#f3f4f6 48%,#6b7280);border-radius:5px;box-shadow:inset 0 0 0 1px #4b5563}.fix3d-plug-tip{width:24px;height:18px;background:#cad0d4;border-radius:0 0 7px 7px;margin-left:-4px;margin-top:-1px}
        .fix3d-label{position:absolute;font-size:9px;font-weight:900;letter-spacing:1px;color:${C.dim};background:rgba(0,0,0,.35);padding:4px 6px;border-radius:5px}.label-coils{left:18px;top:18px}.label-plug{right:18px;bottom:18px}
        .fix3d-controls{position:absolute;left:12px;right:12px;bottom:12px;display:flex;align-items:center;gap:9px;background:rgba(10,12,15,.72);backdrop-filter:blur(8px);padding:8px;border-radius:12px}.fix3d-controls button{width:34px;height:34px;border:0;border-radius:10px;background:${C.amber};color:${C.bg};font-weight:900;cursor:pointer}.fix3d-progress{height:6px;background:#39414a;border-radius:999px;flex:1;overflow:hidden}.fix3d-progress span{display:block;height:100%;background:${C.amber};border-radius:999px}.fix3d-controls>span{font-size:11px;color:${C.dim};min-width:28px;text-align:center}
        .fix3d-stepbar{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}.fix3d-step{background:${C.bg};border:1px solid ${C.line};border-radius:12px;padding:10px;cursor:pointer;color:${C.text};text-align:start}.fix3d-step.active{border-color:${C.amber};background:rgba(245,185,66,.08)}.fix3d-step b{display:block;font-size:11px;color:${C.amber};margin-bottom:3px}.fix3d-step span{font-size:10px;color:${C.dim)}
        .fix3d-info{margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:10px}.fix3d-box{border:1px solid ${C.line};background:${C.bg};border-radius:12px;padding:12px}.fix3d-box h4{margin:0 0 6px;font-size:11px;color:${C.amber};text-transform:uppercase;letter-spacing:.6px}.fix3d-box p,.fix3d-box li{font-size:12px;line-height:1.55;color:${C.dim};margin:0}.fix3d-box ul{margin:0;padding-inline-start:17px}
        @media(max-width:800px){.fix3d-grid{grid-template-columns:1fr}.fix3d-list{display:grid;grid-template-columns:1fr 1fr;gap:6px}.fix3d-item{margin:0}.fix3d-scene{height:330px}.fix3d-stepbar{grid-template-columns:1fr 1fr}.fix3d-info{grid-template-columns:1fr}}
      `}</style>
      <div className="fix3d-shell">
        <div className="fix3d-head">
          <div>
            <div className="fix3d-brand">KARAJY · 3D FIX LAB</div>
            <div className="fix3d-sub">{lang === "ar" ? "مكتبة تجريبية لشرح الإصلاحات بتفاعل ثلاثي الأبعاد" : "Prototype library for interactive 3D repair guidance"}</div>
          </div>
          <div className="fix3d-lang">
            <button type="button" onClick={() => setLang("en")}>EN</button>
            <button type="button" onClick={() => setLang("ar")}>AR</button>
            <button type="button" className="fix3d-back" onClick={() => (window.location.href = "/")}>← Karaji</button>
          </div>
        </div>

        <div className="fix3d-grid">
          <div className="fix3d-card fix3d-list">
            {guides.map((g) => (
              <button key={g.id} type="button" className={`fix3d-item ${guideId === g.id ? "active" : ""}`} onClick={() => setGuideId(g.id)}>
                <strong>{lang === "ar" ? g.titleAr : g.titleEn}</strong>
                <div className="fix3d-meta">{g.difficulty} · {g.time} · 3D</div>
              </button>
            ))}
          </div>

          <div className="fix3d-card fix3d-stage">
            <div className="fix3d-title">{title}</div>
            <div className="fix3d-caption">{lang === "ar" ? "نموذج تفاعلي تجريبي — شغّل الخطوات أو اختر أي خطوة مباشرة" : "Interactive prototype — play the sequence or jump to any step"}</div>
            <EngineScene step={step} playing={playing} progress={progress} />

            <div className="fix3d-stepbar">
              {steps.map((s, i) => (
                <button key={i} type="button" className={`fix3d-step ${step === i + 1 ? "active" : ""}`} onClick={() => { setStep(i + 1); setProgress(0); setPlaying(false); }}>
                  <b>{lang === "ar" ? `الخطوة ${i + 1}` : `STEP ${i + 1}`}</b>
                  <span>{s}</span>
                </button>
              ))}
            </div>

            <div className="fix3d-info">
              <div className="fix3d-box">
                <h4>{lang === "ar" ? "الأدوات" : "Tools"}</h4>
                <ul>{guide.tools.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
              <div className="fix3d-box">
                <h4>{lang === "ar" ? "بيانات الإصلاح" : "Repair data"}</h4>
                <p>{lang === "ar" ? `الصعوبة: ${guide.difficulty}` : `Difficulty: ${guide.difficulty}`}</p>
                <p>{lang === "ar" ? `الوقت التقريبي: ${guide.time}` : `Estimated time: ${guide.time}`}</p>
                <p style={{ marginTop: 7, color: C.red }}>{lang === "ar" ? "اتبع إجراءات السلامة الخاصة بسيارتك قبل البدء." : "Follow your vehicle-specific safety procedures before starting."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
