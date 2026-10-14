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
import { C } from "../theme";

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
          background: `radial-gradient(circle at 35% 30%, ${C.panel}, ${C.asphalt})`,
          border: `2px solid ${C.panelLine}`,
          boxShadow: `inset 0 0 0 3px ${C.asphalt}, 0 0 0 1px ${C.panelLine}`,
        }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 58,
            height: 58,
            border: `1px solid ${C.amberDim}`,
            background: `${C.amber}14`,
          }}
        >
          <Icon size={24} color={C.amber} strokeWidth={1.8} />
        </div>
      </div>
      <div className="text-center" style={{ maxWidth: 88 }}>
        <div
          style={{
            color: C.cream,
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
   Views
--------------------------------------------------------------- */
const MAIN_SECTIONS = [
  { id: "fix", icon: Gauge, labelKey: "navIssues" },
  { id: "garages", icon: MapPin, labelKey: "navGarages" },
  { id: "maintenance", icon: Droplet, labelKey: "navMaintenance" },
  { id: "buy-car", icon: Search, labelKey: "navBuyCar" },
  { id: "cars", icon: Car, labelKey: "navCars" },
  { id: "parts", icon: Settings, labelKey: "navParts" },
  { id: "diagnosis", icon: Camera, labelKey: "navDiagnosis", isAI: true },
  { id: "valuation", icon: Tag, labelKey: "navValuation", isAI: true },
  { id: "rentals", icon: KeyRound, labelKey: "navRentals" },
];

function MainSectionsGrid({ lang, t, onOpenSection }) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-7">
      {MAIN_SECTIONS.map((s) => {
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            onClick={() => onOpenSection(s.id)}
            className="flex flex-col items-center gap-2"
            style={{
              background: C.panel,
              border: `1px solid ${C.panelLine}`,
              borderRadius: 14,
              padding: "14px 8px",
              cursor: "pointer",
            }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                position: "relative",
                width: 44,
                height: 44,
                background: `${C.amber}18`,
                border: `1px solid ${C.amberDim}`,
              }}
            >
              <Icon size={20} color={C.amber} strokeWidth={1.8} />
              {s.isAI && (
                <span
                  style={{
                    position: "absolute",
                    top: -7,
                    insetInlineEnd: -9,
                    background: "#3F6E96", // darker than C.blue for text contrast (4.5:1+)
                    color: "#fff",
                    fontSize: 8.5,
                    fontWeight: 800,
                    letterSpacing: 0.3,
                    borderRadius: 999,
                    padding: "2px 5px",
                    lineHeight: 1,
                    border: `1.5px solid ${C.asphalt}`,
                  }}
                >
                  AI
                </span>
              )}
            </div>
            <span
              style={{
                color: C.cream,
                fontSize: 11.5,
                fontWeight: 600,
                textAlign: "center",
                lineHeight: 1.25,
              }}
            >
              {t[s.labelKey]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function HomeView({ lang, t, onOpenSection }) {
  return (
    <div className="px-5 pt-5 pb-6">
      <h1
        style={{
          color: C.cream,
          fontSize: 21,
          fontWeight: 700,
          fontFamily: "inherit",
          margin: 0,
        }}
      >
        {t.homeHeading}
      </h1>
      <p style={{ color: C.creamDim, fontSize: 13, marginTop: 4, marginBottom: 16 }}>
        {t.homeSub}
      </p>

      <MainSectionsGrid lang={lang} t={t} onOpenSection={onOpenSection} />
    </div>
  );
}
