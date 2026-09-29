import React, { useState } from "react";
import { useCustomerAuth } from "../useCustomerAuth";

// Full-screen Google sign-in shown before the app. Nothing else (app, bottom nav,
// AI button) is usable until the user signs in. Session is remembered by Supabase.
const C = {
  asphalt: "#14171C",
  panel: "#1D2129",
  line: "#2A2F38",
  cream: "#F2ECDD",
  dim: "#B9B2A0",
  amber: "#F5B942",
};

function initialLang() {
  try {
    const saved = localStorage.getItem("karajy-language");
    if (saved === "ar" || saved === "en") return saved;
  } catch (_) {}
  return (navigator.language || "").toLowerCase().startsWith("ar") ? "ar" : "en";
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 10100, // above the bottom nav (9990) and the AI button (10001)
  background: C.asphalt,
  color: C.cream,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "calc(env(safe-area-inset-top, 0px) + 72px) 24px calc(env(safe-area-inset-bottom, 0px) + 24px)",
  overflowY: "auto",
  fontFamily: "'IBM Plex Sans Arabic', 'Inter', system-ui, sans-serif",
};

export default function AppLoginGate({ children }) {
  const { user, checking, signInWithGoogle } = useCustomerAuth();
  const [lang, setLang] = useState(initialLang);
  const [busy, setBusy] = useState(false);
  const isAr = lang === "ar";

  if (user) return children;

  if (checking) {
    return (
      <div style={overlayStyle}>
        <div style={{ color: C.dim, fontSize: 13 }}>{isAr ? "جاري التحميل..." : "Loading..."}</div>
      </div>
    );
  }

  const switchLang = (code) => {
    setLang(code);
    try {
      localStorage.setItem("karajy-language", code);
      localStorage.setItem("karajiLanguage", code);
    } catch (_) {}
  };

  const handleSignIn = async () => {
    setBusy(true);
    try {
      await signInWithGoogle(); // redirects to Google, then back here signed in
    } catch (e) {
      console.error("Google sign-in failed", e);
      setBusy(false);
    }
  };

  return (
    <div style={overlayStyle} dir={isAr ? "rtl" : "ltr"}>
      {/* Language switch, pinned at the top below the phone's status bar */}
      <div
        role="group"
        aria-label="Language / اللغة"
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 16px)",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 4,
          padding: 4,
          borderRadius: 999,
          background: C.panel,
          border: `1px solid ${C.line}`,
        }}
      >
        {["en", "ar"].map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => switchLang(code)}
            aria-pressed={lang === code}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              background: lang === code ? C.amber : "transparent",
              color: lang === code ? C.asphalt : C.dim,
              fontFamily: code === "ar" ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
            }}
          >
            {code === "ar" ? "العربية" : "English"}
          </button>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>

        <div
          aria-hidden="true"
          style={{
            width: 72,
            height: 72,
            borderRadius: 999,
            background: C.amber,
            boxShadow: `0 0 30px ${C.amber}66`,
            margin: "0 auto 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
          }}
        >
          🔧
        </div>

        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{isAr ? "سيارتي" : "Sayyarti"}</h1>
        <p style={{ color: C.dim, fontSize: 14, lineHeight: 1.7, margin: "12px 0 28px" }}>
          {isAr
            ? "تشخيص أعطال سيارتك، الورش، الصيانة، وبيع وشراء السيارات في مكان واحد."
            : "Car diagnostics, garages, maintenance, and buying & selling cars in one place."}
        </p>

        <button
          type="button"
          onClick={handleSignIn}
          disabled={busy}
          style={{
            width: "100%",
            background: C.cream,
            color: C.asphalt,
            border: "none",
            borderRadius: 14,
            padding: "15px 16px",
            fontSize: 15,
            fontWeight: 800,
            cursor: busy ? "wait" : "pointer",
            opacity: busy ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <GoogleGlyph />
          {busy ? (isAr ? "جاري الفتح..." : "Opening...") : isAr ? "الدخول بحساب جوجل" : "Continue with Google"}
        </button>

        <p style={{ color: C.dim, fontSize: 11, lineHeight: 1.6, marginTop: 16, opacity: 0.8 }}>
          {isAr
            ? "بنستخدم حساب جوجل بتاعك لتسجيل الدخول بس، ومش بننشر أي حاجة باسمك."
            : "We only use your Google account to sign you in. We never post anything on your behalf."}
        </p>
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.5 26.7 36 24 36c-5.3 0-9.6-3.4-11.3-8.1l-6.5 5C9.6 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C40.9 36 44 30.7 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}
