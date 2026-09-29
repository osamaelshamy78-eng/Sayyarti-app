import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useCustomerAuth } from "../useCustomerAuth";

// Profile section shown at the top of the ☰ menu: Google account, credits,
// free tries, recent credit purchase requests, and sign out.
const C = {
  panel: "#1D2129",
  line: "#2A2F38",
  cream: "#F2ECDD",
  dim: "#B9B2A0",
  amber: "#F5B942",
  green: "#61A56B",
  red: "#E4432B",
};

const STATUS = {
  pending: { ar: "قيد المراجعة", en: "Pending", color: C.amber },
  approved: { ar: "تمت الموافقة", en: "Approved", color: C.green },
  rejected: { ar: "مرفوض", en: "Rejected", color: C.red },
};

export default function ProfileMenuCard({ lang }) {
  const isAr = lang === "ar";
  const { user, signOut } = useCustomerAuth();
  const [credits, setCredits] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !supabase) return undefined;
    let active = true;
    (async () => {
      try {
        const [creditsRes, requestsRes, adminRes] = await Promise.all([
          supabase
            .from("user_credits")
            .select("credits_remaining, free_diagnosis_used, free_valuation_used")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("credit_purchase_requests")
            .select("id, credits_requested, status, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(3),
          supabase.rpc("is_car_admin"),
        ]);
        if (!active) return;
        setCredits(creditsRes.data || { credits_remaining: 0, free_diagnosis_used: false, free_valuation_used: false });
        setRequests(requestsRes.data || []);
        setIsAdmin(adminRes.data === true);
      } catch (e) {
        console.error("profile load failed", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  if (!user) return null;

  const meta = user.user_metadata || {};
  const name = meta.full_name || meta.name || user.email;
  const avatar = meta.avatar_url || meta.picture;
  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString(isAr ? "ar-EG" : "en-GB", { day: "numeric", month: "short" });

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      style={{ padding: "14px 16px", borderBottom: `1px solid ${C.line}`, textAlign: isAr ? "right" : "left" }}
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
              background: C.amber,
              color: "#14171C",
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
          <div style={{ color: C.cream, fontSize: 13.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name}
          </div>
          <div style={{ color: C.dim, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} dir="ltr">
            {user.email}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, background: "#14171C", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px" }}>
        {loading ? (
          <div style={{ color: C.dim, fontSize: 11.5 }}>{isAr ? "جاري التحميل..." : "Loading..."}</div>
        ) : isAdmin ? (
          <div style={{ color: C.amber, fontSize: 12, fontWeight: 700 }}>
            {isAr ? "حساب أدمن: استخدام غير محدود" : "Admin account: unlimited use"}
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: C.dim, fontSize: 11.5 }}>{isAr ? "رصيد الكريديت" : "Credits"}</span>
              <strong style={{ color: C.amber, fontSize: 16 }}>{credits?.credits_remaining ?? 0}</strong>
            </div>
            <div style={{ color: C.dim, fontSize: 10.5, marginTop: 6, lineHeight: 1.6 }}>
              {isAr ? "التشخيص المجاني: " : "Free diagnosis: "}
              <span style={{ color: credits?.free_diagnosis_used ? C.dim : C.green }}>
                {credits?.free_diagnosis_used ? (isAr ? "مستخدم" : "used") : isAr ? "متاح" : "available"}
              </span>
              {" · "}
              {isAr ? "التقييم المجاني: " : "Free valuation: "}
              <span style={{ color: credits?.free_valuation_used ? C.dim : C.green }}>
                {credits?.free_valuation_used ? (isAr ? "مستخدم" : "used") : isAr ? "متاح" : "available"}
              </span>
            </div>
          </>
        )}
      </div>

      {!loading && requests.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ color: C.dim, fontSize: 10.5, marginBottom: 4 }}>{isAr ? "آخر طلبات الشراء" : "Recent purchases"}</div>
          {requests.map((r) => {
            const st = STATUS[r.status] || { ar: r.status, en: r.status, color: C.dim };
            return (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0" }}>
                <span style={{ color: C.cream }}>
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
          color: C.dim,
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
