const C = {
  asphalt: "#14171C",
  panel: "#1D2129",
  line: "#2A2F38",
  cream: "#F2ECDD",
  dim: "#B9B2A0",
  amber: "#F5B942",
};

export default function CustomerAuthGate({
  lang,
  user,
  checking,
  signInWithGoogle,
  signOut,
  titleAr,
  titleEn,
  descAr,
  descEn,
  children,
}) {
  const isAr = lang === "ar";

  if (checking) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-10 pb-24 text-center" dir={isAr ? "rtl" : "ltr"} style={{ color: C.dim, fontSize: 13 }}>
        {isAr ? "جاري التحقق..." : "Checking..."}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-8 pb-24" dir={isAr ? "rtl" : "ltr"} style={{ color: C.cream }}>
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 18, padding: 22, textAlign: "center" }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>🔐</div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{isAr ? titleAr : titleEn}</h2>
          <p style={{ color: C.dim, fontSize: 12.5, lineHeight: 1.65, margin: "10px 0 18px" }}>
            {isAr ? descAr : descEn}
          </p>
          <button
            type="button"
            onClick={signInWithGoogle}
            style={{
              width: "100%",
              background: C.cream,
              color: C.asphalt,
              border: "none",
              borderRadius: 13,
              padding: "13px 16px",
              fontSize: 14,
              fontWeight: 900,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
            }}
          >
            <GoogleGlyph />
            {isAr ? "تسجيل الدخول بجوجل" : "Sign in with Google"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: 512,
          margin: "0 auto",
          padding: "10px 16px 0",
          color: C.dim,
          fontSize: 11,
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
          {user.email}
        </span>
        <button
          type="button"
          onClick={signOut}
          style={{ background: "none", border: "none", color: C.dim, fontSize: 11, cursor: "pointer", textDecoration: "underline", padding: 0 }}
        >
          {isAr ? "تسجيل خروج" : "Sign out"}
        </button>
      </div>
      {children}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.5 26.7 36 24 36c-5.3 0-9.6-3.4-11.3-8.1l-6.5 5C9.6 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C40.9 36 44 30.7 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}
