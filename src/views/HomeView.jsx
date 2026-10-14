import {
  Gauge,
  MapPin,
  Droplet,
  Search,
  Car,
  Settings,
  Camera,
  Tag,
  KeyRound,
} from "lucide-react";
import { C, FONT_SIGN } from "../theme";
import { T } from "../i18n/strings";

export function Dial({ Icon, label, count, unitLabel, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2"
      style={{ border: "none", background: "none", cursor: "pointer" }}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 76,
          height: 76,
          background: `radial-gradient(circle at 35% 30%, ${C.surface}, ${C.bg})`,
          border: `2px solid ${C.line}`,
          boxShadow: `inset 0 0 0 3px ${C.bg}, 0 0 0 1px ${C.line}`,
        }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 58,
            height: 58,
            border: `1px solid ${C.accentDim}`,
            background: `${C.accent}14`,
          }}
        >
          <Icon size={24} color={C.accent} strokeWidth={1.8} />
        </div>
      </div>
      <div className="text-center" style={{ maxWidth: 88 }}>
        <div
          style={{
            color: C.text,
            fontSize: 12.5,
            fontWeight: 600,
            lineHeight: 1.25,
            fontFamily: "inherit",
          }}
        >
          {label}
        </div>
        <div style={{ color: C.grey, fontSize: 10.5, marginTop: 2 }}>
          {count} {unitLabel}
        </div>
      </div>
    </button>
  );
}

/* ---------------------------------------------------------------
   Home: the sections laid out like road signs. Blue for services,
   green for buying and selling, yellow only for warnings. Each blue
   row carries its name in the other language, as signs here do.
--------------------------------------------------------------- */
const SERVICE_SIGN = [
  { id: "fix", icon: Gauge, labelKey: "navIssues" },
  { id: "garages", icon: MapPin, labelKey: "navGarages" },
  { id: "maintenance", icon: Droplet, labelKey: "navMaintenance" },
  { id: "diagnosis", icon: Camera, labelKey: "navDiagnosis", isAI: true },
  { id: "valuation", icon: Tag, labelKey: "navValuation", isAI: true },
];
const MARKET_SIGN = [
  { id: "buy-car", icon: Search, labelKey: "navBuyCar" },
  { id: "cars", icon: Car, labelKey: "navCars" },
  { id: "rentals", icon: KeyRound, labelKey: "navRentals" },
  { id: "parts", icon: Settings, labelKey: "navParts" },
];

const SIGN_DIVIDER = "1px solid rgba(255,255,255,0.35)";

function Sign({ color, children }) {
  return (
    <div style={{ background: color, borderRadius: 12, padding: 5, marginBottom: 12 }}>
      <div style={{ border: `2px solid ${C.onAccent}`, borderRadius: 9 }}>{children}</div>
    </div>
  );
}

function ServiceSign({ lang, t, onOpenSection }) {
  const other = T[lang === "ar" ? "en" : "ar"];
  return (
    <Sign color={C.accent}>
      {SERVICE_SIGN.map((s, i) => {
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            onClick={() => onOpenSection(s.id)}
            className="w-full flex items-center"
            style={{
              gap: 12,
              padding: "11px 12px",
              background: "none",
              border: "none",
              borderTop: i ? SIGN_DIVIDER : "none",
              color: C.onAccent,
              cursor: "pointer",
              textAlign: "start",
            }}
          >
            <Icon size={22} color={C.onAccent} strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0 }} />
            <span className="flex-1 flex flex-col" style={{ lineHeight: 1.3, minWidth: 0 }}>
              <span style={{ fontFamily: FONT_SIGN, fontSize: 15.5, fontWeight: 700 }}>{t[s.labelKey]}</span>
              <span dir={lang === "ar" ? "ltr" : "rtl"} style={{ fontSize: 11, opacity: 0.85, textAlign: lang === "ar" ? "right" : "left" }}>
                {other[s.labelKey]}
              </span>
            </span>
            {s.isAI && (
              <span style={{ fontSize: 10, fontWeight: 700, border: `1.5px solid ${C.onAccent}`, borderRadius: 6, padding: "2px 6px", flexShrink: 0 }}>
                AI
              </span>
            )}
          </button>
        );
      })}
    </Sign>
  );
}

function MarketSign({ t, onOpenSection }) {
  return (
    <Sign color={C.green}>
      <div className="grid grid-cols-2">
        {MARKET_SIGN.map((s, i) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => onOpenSection(s.id)}
              className="flex items-center"
              style={{
                gap: 8,
                padding: "13px 12px",
                background: "none",
                border: "none",
                borderTop: i > 1 ? SIGN_DIVIDER : "none",
                borderInlineStart: i % 2 ? SIGN_DIVIDER : "none",
                color: C.onAccent,
                cursor: "pointer",
                textAlign: "start",
                fontFamily: FONT_SIGN,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              <Icon size={18} color={C.onAccent} strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0 }} />
              {t[s.labelKey]}
            </button>
          );
        })}
      </div>
    </Sign>
  );
}

function WarningLightsSign({ t, onOpenSection }) {
  return (
    <button
      onClick={() => onOpenSection("guide")}
      className="w-full flex items-center"
      style={{
        gap: 14,
        padding: "12px 14px",
        background: C.surface,
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        color: C.text,
        cursor: "pointer",
        textAlign: "start",
      }}
    >
      {/* a yellow diamond warning sign */}
      <span
        aria-hidden="true"
        style={{
          width: 26,
          height: 26,
          margin: "0 4px",
          flexShrink: 0,
          background: C.yellow,
          border: `2px solid ${C.text}`,
          borderRadius: 4,
          transform: "rotate(45deg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ transform: "rotate(-45deg)", fontWeight: 700, fontSize: 14, lineHeight: 1 }}>!</span>
      </span>
      <span style={{ fontFamily: FONT_SIGN, fontSize: 14.5, fontWeight: 700 }}>{t.lightsGuideTile}</span>
    </button>
  );
}

export function HomeView({ lang, t, onOpenSection }) {
  return (
    <div className="px-5 pt-5 pb-6">
      <h1 style={{ color: C.text, fontFamily: FONT_SIGN, fontSize: 22, fontWeight: 700, lineHeight: 1.5, margin: 0 }}>
        {t.homeHeading}
      </h1>
      <p style={{ color: C.textDim, fontSize: 13, marginTop: 2, marginBottom: 14 }}>{t.homeSub}</p>

      <ServiceSign lang={lang} t={t} onOpenSection={onOpenSection} />
      <MarketSign t={t} onOpenSection={onOpenSection} />
      <WarningLightsSign t={t} onOpenSection={onOpenSection} />
    </div>
  );
}
