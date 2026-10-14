import { Info, MapPin } from "lucide-react";
import { SPARE_PARTS } from "../data/directory";
import { C } from "../theme";

export function SparePartsView({ lang, t, country, setCountry, isRTL }) {
  const data = SPARE_PARTS[country] || SPARE_PARTS.uae;
  const partsCountryCode = SPARE_PARTS[country] ? country : "uae";
  return (
    <div className="px-5 pt-5 pb-6">
      <h1 style={{ color: C.cream, fontSize: 21, fontWeight: 700, margin: 0 }}>
        {t.partsHeading}
      </h1>
      <p style={{ color: C.creamDim, fontSize: 13, marginTop: 4, marginBottom: 14 }}>{t.partsSub}</p>

      <div className="flex gap-2 mb-4">
        {Object.keys(SPARE_PARTS).map((code) => {
          const active = code === partsCountryCode;
          return (
            <button
              key={code}
              onClick={() => setCountry(code)}
              style={{
                flex: 1,
                border: `1px solid ${active ? C.amber : C.panelLine}`,
                background: active ? `${C.amber}18` : C.panel,
                color: active ? C.amber : C.creamDim,
                borderRadius: 10,
                padding: "9px 6px",
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {SPARE_PARTS[code][lang]}
            </button>
          );
        })}
      </div>

      <div
        className="flex items-start gap-2 mb-4"
        style={{
          background: `${C.blue}14`,
          border: `1px solid ${C.blue}44`,
          borderRadius: 10,
          padding: "10px 12px",
        }}
      >
        <Info size={14} color={C.blue} style={{ marginTop: 2, flexShrink: 0 }} />
        <span style={{ color: C.creamDim, fontSize: 11.5, lineHeight: 1.5 }}>{t.partsNote}</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {data.list.map((p, i) => (
          <button
            key={i}
            onClick={() =>
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${p.name} ${p.area.en} ${data.en}`
                )}`,
                "_blank"
              )
            }
            className="w-full"
            style={{
              background: C.panel,
              border: `1px solid ${C.panelLine}`,
              borderRadius: 14,
              padding: "14px 16px",
              cursor: "pointer",
              textAlign: isRTL ? "right" : "left",
              display: "block",
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <span style={{ color: C.cream, fontSize: 14, fontWeight: 700 }}>{p.name}</span>
              <MapPin size={15} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} />
            </div>
            <div style={{ color: C.amberDim, fontSize: 11.5, marginTop: 3, fontWeight: 600 }}>
              {p.area[lang]}
            </div>
            <div style={{ color: C.creamDim, fontSize: 12.5, marginTop: 5, lineHeight: 1.5 }}>
              {p.note[lang]}
            </div>
            <div style={{ color: C.blue, fontSize: 11, marginTop: 7, fontWeight: 600 }}>
              {t.openInMaps}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

}
