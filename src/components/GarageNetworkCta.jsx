import React from "react";

const C = { asphalt: "#14171C", panel: "#1D2129", line: "#2A2F38", cream: "#F2ECDD", dim: "#B9B2A0", amber: "#F5B942" };

// Top of the garage directory: invites garage owners to the free listing page.
export default function GarageNetworkCta({ lang }) {
  const ar = lang === "ar";
  return (
    <div style={{ margin: "0 0 18px 0", padding: "15px 16px", background: `linear-gradient(135deg, ${C.panel}, ${C.asphalt})`, border: `1px solid ${C.line}`, borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,.16)" }}>
      <div style={{ color: C.cream, fontSize: 15, fontWeight: 700, marginBottom: 5, lineHeight: 1.45 }}>
        {ar ? "صاحب جراج؟ خلّي أصحاب السيارات يلاقوك" : "Own a garage? Let car owners find you"}
      </div>
      <div style={{ color: C.dim, fontSize: 12, lineHeight: 1.7, marginBottom: 10 }}>
        {ar
          ? "أضف جراجك إلى دليل سيارتي مجانًا، وعرّف أصحاب السيارات بخدماتك وموقعك وبيانات التواصل."
          : "Add your garage to the Sayyarti directory for free and let car owners discover your services, location and contact details."}
      </div>
      <button
        type="button"
        onClick={() => { window.location.href = "/free-garage/"; }}
        style={{ border: "none", borderRadius: 10, padding: "9px 13px", background: C.amber, color: C.asphalt, fontWeight: 800, fontSize: 12, cursor: "pointer", width: "100%" }}
      >
        {ar ? "+ ضيف جراجك مجانًا" : "+ Add Your Garage Free"}
      </button>
    </div>
  );
}
