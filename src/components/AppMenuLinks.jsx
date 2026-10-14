import React, { useState } from "react";
import { Plus, Car, MessageCircle, Phone, Scale, Info } from "lucide-react";
import { useCloseOnBack } from "../backButton";

const C = { asphalt: "#14171C", panel: "#1D2129", line: "#2A2F38", cream: "#F2ECDD", dim: "#B9B2A0", amber: "#F5B942" };
const PHONE = "971558875606";

// One row of the ☰ menu: icon then label, in reading order (right-to-left in Arabic).
export const MENU_ROW_STYLE = {
  display: "flex", alignItems: "center", width: "100%", padding: "12px 16px", background: "none", border: "none",
  borderTop: `1px solid ${C.line}`, color: C.cream, fontSize: 13, fontWeight: 600,
  textAlign: "start", cursor: "pointer", gap: 10, boxSizing: "border-box",
};

// The links at the bottom of the header menu, and the About dialog one of them opens.
export default function AppMenuLinks({ lang, onNavigate, onDone }) {
  const ar = lang === "ar";
  const [aboutOpen, setAboutOpen] = useState(false);
  const links = [
    { key: "garage", Icon: Plus, label: ar ? "أضف جراجك مجانًا" : "Add Your Garage Free", go: () => { window.location.href = "/free-garage/"; } },
    { key: "sell", Icon: Car, label: ar ? "عرض السيارة للبيع" : "List Your Car for Sale", go: () => onNavigate("/cars/add") },
    { key: "whatsapp", Icon: MessageCircle, label: ar ? "تواصل عبر واتساب" : "WhatsApp Us", go: () => window.open(`https://wa.me/${PHONE}`, "_blank") },
    { key: "call", Icon: Phone, label: ar ? "اتصل بينا" : "Call Us", go: () => { window.location.href = `tel:+${PHONE}`; } },
    { key: "legal", Icon: Scale, label: ar ? "قانوني" : "Legal", go: () => { window.location.href = `/legal/?lang=${ar ? "ar" : "en"}`; } },
    { key: "about", Icon: Info, label: ar ? "عن التطبيق" : "About the App", go: () => setAboutOpen(true), keepMenu: true },
  ];
  return (
    <>
      {links.map((l) => (
        <button key={l.key} type="button" onClick={() => { l.go(); if (!l.keepMenu) onDone(); }} style={MENU_ROW_STYLE}>
          <l.Icon size={16} color={C.amber} strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{l.label}</span>
        </button>
      ))}
      {aboutOpen && <AboutDialog ar={ar} onClose={() => { setAboutOpen(false); onDone(); }} />}
    </>
  );
}

function AboutDialog({ ar, onClose }) {
  useCloseOnBack(true, onClose);
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      dir={ar ? "rtl" : "ltr"}
      style={{ position: "fixed", inset: 0, zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", padding: 18, background: "rgba(0,0,0,.68)" }}
    >
      <div style={{ width: "min(520px, 100%)", maxHeight: "82vh", overflow: "auto", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 18, padding: 22, color: C.cream, boxShadow: "0 18px 60px rgba(0,0,0,.4)", position: "relative", textAlign: "start" }}>
        <button
          type="button"
          onClick={onClose}
          aria-label={ar ? "إغلاق" : "Close"}
          style={{ position: "absolute", top: 10, [ar ? "left" : "right"]: 10, width: 34, height: 34, borderRadius: "50%", border: `1px solid ${C.line}`, background: C.asphalt, color: C.cream, fontSize: 22, cursor: "pointer" }}
        >×</button>
        <h2 style={{ margin: ar ? "0 0 10px 42px" : "0 42px 10px 0", color: C.amber, fontSize: 24 }}>{ar ? "عن سيارتي" : "About Sayyarti"}</h2>
        <p style={{ color: C.dim, lineHeight: 1.8 }}>
          {ar
            ? "سيارتي منصة رقمية ثنائية اللغة تساعد أصحاب السيارات على فهم مشاكل السيارة، استكشاف الأعطال، وتحويل نتيجة البحث إلى خطوة عملية مثل مشاهدة فيديو مناسب أو الوصول إلى جراج قريب."
            : "Sayyarti is a bilingual digital platform that helps car owners understand vehicle problems, explore common faults, and turn the result into a practical next step such as watching a relevant video or finding a nearby garage."}
        </p>
        <p style={{ color: C.dim, lineHeight: 1.8 }}>
          {ar
            ? "يوفر سيارتي أيضًا دليلًا للجراجات، وميزات لإضافة الجراجات، وإعلانات السيارات، ومحتوى إرشادي عن أعطال السيارات."
            : "Sayyarti also provides a garage directory, garage listing tools, vehicle listings, and educational car-fault guidance."}
        </p>
        <div style={{ marginTop: 16, padding: "12px 14px", background: `${C.amber}12`, borderInlineStart: `3px solid ${C.amber}`, borderRadius: 10, color: C.cream, lineHeight: 1.7 }}>
          {ar
            ? "الهدف: جمع معلومات السيارة والخطوة التالية في مكان واحد، مع إبقاء المستخدم صاحب القرار النهائي."
            : "Goal: put the car information and the next step in one place while keeping the user in control of the final decision."}
        </div>
      </div>
    </div>
  );
}
