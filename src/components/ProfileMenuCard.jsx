import React from "react";
import { C } from "../theme";

// Profile section shown at the top of the ☰ menu: Google account, credits and a
// button to buy more, free tries, recent credit purchase requests, and sign out.

const STATUS = {
  pending: { ar: "قيد المراجعة", en: "Pending", color: C.accent },
  approved: { ar: "تمت الموافقة", en: "Approved", color: C.green },
  rejected: { ar: "مرفوض", en: "Rejected", color: C.red },
};

export default function ProfileMenuCard({ lang, account, onBuyCredits }) {
  const isAr = lang === "ar";
  const { user, signOut, credits, requests, isAdmin, loading } = account;

  if (!user) return null;

  const meta = user.user_metadata || {};
  const name = meta.full_name || meta.name || user.email;
  const avatar = meta.avatar_url || meta.picture;
  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString(isAr ? "ar-EG" : "en-GB", { day: "numeric", month: "short" });

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      style={{ padding: "14px 16px", textAlign: isAr ? "right" : "left" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {avatar ? (
          <img
            src={avatar}
            alt=""
            referrerPolicy="no-referrer"
            style={{ width: 40, height: 40, borderRadius: 999, flexShrink: 0, objectFit: "cover" }}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              flexShrink: 0,
              background: C.accent,
              color: C.onAccent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
            }}
          >
            {String(name).charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ color: C.text, fontSize: 13.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name}
          </div>
          <div style={{ color: C.textDim, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} dir="ltr">
            {user.email}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px" }}>
        {loading ? (
          <div style={{ color: C.textDim, fontSize: 11.5 }}>{isAr ? "جاري التحميل..." : "Loading..."}</div>
        ) : isAdmin ? (
          <div style={{ color: C.accent, fontSize: 12, fontWeight: 700 }}>
            {isAr ? "حساب أدمن: استخدام غير محدود" : "Admin account: unlimited use"}
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: C.textDim, fontSize: 11.5 }}>{isAr ? "رصيد الكريديت" : "Credits"}</span>
              <strong style={{ color: C.accent, fontSize: 16 }}>{credits?.credits_remaining ?? 0}</strong>
            </div>
            <div style={{ color: C.textDim, fontSize: 10.5, marginTop: 6, lineHeight: 1.6 }}>
              {isAr ? "التشخيص المجاني: " : "Free diagnosis: "}
              <span style={{ color: credits?.free_diagnosis_used ? C.textDim : C.green }}>
                {credits?.free_diagnosis_used ? (isAr ? "مستخدم" : "used") : isAr ? "متاح" : "available"}
              </span>
              {" · "}
              {isAr ? "التقييم المجاني: " : "Free valuation: "}
              <span style={{ color: credits?.free_valuation_used ? C.textDim : C.green }}>
                {credits?.free_valuation_used ? (isAr ? "مستخدم" : "used") : isAr ? "متاح" : "available"}
              </span>
            </div>
            <button
              type="button"
              onClick={onBuyCredits}
              style={{
                marginTop: 10,
                width: "100%",
                background: C.accent,
                color: C.onAccent,
                border: "none",
                borderRadius: 8,
                padding: "9px 10px",
                fontSize: 12.5,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {isAr ? "اشترِ كريديت" : "Buy credits"}
            </button>
          </>
        )}
      </div>

      {!loading && requests.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ color: C.textDim, fontSize: 10.5, marginBottom: 4 }}>{isAr ? "آخر طلبات الشراء" : "Recent purchases"}</div>
          {requests.map((r) => {
            const st = STATUS[r.status] || { ar: r.status, en: r.status, color: C.textDim };
            return (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0" }}>
                <span style={{ color: C.text }}>
                  {r.credits_requested} {isAr ? "كريديت" : "credits"} · {fmtDate(r.created_at)}
                </span>
                <span style={{ color: st.color, fontWeight: 700 }}>{isAr ? st.ar : st.en}</span>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={signOut}
        style={{
          marginTop: 12,
          width: "100%",
          background: "transparent",
          border: `1px solid ${C.line}`,
          borderRadius: 10,
          padding: "8px 10px",
          color: C.textDim,
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {isAr ? "تسجيل خروج" : "Sign out"}
      </button>
    </div>
  );
}
