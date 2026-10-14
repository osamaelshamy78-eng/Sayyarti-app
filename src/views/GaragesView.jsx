import { useState, useEffect } from "react";
import { Info, MapPin } from "lucide-react";
import { supabase } from "../supabaseClient";
import GarageNetworkCta from "../components/GarageNetworkCta";
import { issueFilterFromUrl, garageMatchesIssue, IssueGarageBanner } from "../components/IssueGarages";
import { GARAGES } from "../data/directory";
import { C } from "../theme";

function haversineKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => v == null)) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function GaragesView({ lang, t, country, setCountry, isRTL, quoteRequest, onClearQuote }) {
  const [dbGarages, setDbGarages] = useState([]);
  const [userLoc, setUserLoc] = useState(null);
  const [specialty] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("specialty") || null;
    } catch {
      return null;
    }
  });
  const [issueKey] = useState(issueFilterFromUrl);
  const data = GARAGES[country];
  useEffect(() => {
    let active = true;
    if (supabase) {
      supabase.from("garage_directory").select("*").eq("country", country).order("rank", { ascending: true }).order("created_at", { ascending: false })
        .then(({ data }) => { if (active) setDbGarages(data || []); });
    }
    return () => { active = false; };
  }, [country]);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 6000, maximumAge: 300000 }
    );
  }, []);

  const combinedGarages = [
    ...data.list.map((g, i) => ({
      key: `static-${i}`,
      name: g.name,
      area: g.area[lang],
      note: g.note[lang],
      specialty: g.specialty || "general",
      lat: g.lat,
      lng: g.lng,
      photoUrl: null,
      photoUrls: null,
      mapLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${g.name} ${g.area.en} ${data.en}`)}`,
    })),
    ...dbGarages.map((g) => ({
      key: g.id,
      name: g.garage_name,
      area: g.address,
      note: "",
      specialty: g.specialty || "general",
      lat: g.lat,
      lng: g.lng,
      photoUrl: g.photo_url,
      photoUrls: null,
      mapLink: g.map_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.garage_name + " " + g.address)}`,
    })),
  ].map((g) => ({
    ...g,
    distanceKm: userLoc ? haversineKm(userLoc.lat, userLoc.lng, g.lat, g.lng) : null,
  }));

  combinedGarages.sort((a, b) => {
    if (specialty) {
      const aMatch = a.specialty === specialty ? 0 : 1;
      const bMatch = b.specialty === specialty ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
    }
    if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm;
    if (a.distanceKm != null) return -1;
    if (b.distanceKm != null) return 1;
    return 0;
  });

  // opened from an issue page: only garages whose text mentions that kind of work,
  // or all of them when none does (rather than an empty list)
  const issueMatches = issueKey
    ? combinedGarages.filter((g) => garageMatchesIssue([g.name, g.area, g.note].join(" "), issueKey))
    : [];
  const noIssueMatch = !!issueKey && issueMatches.length === 0;
  const shownGarages = issueKey && !noIssueMatch ? issueMatches : combinedGarages;

  return (
    <div className="px-5 pt-5 pb-6">
      <GarageNetworkCta lang={lang} />
      <h1 style={{ color: C.text, fontSize: 21, fontWeight: 700, margin: 0 }}>
        {t.garagesHeading}
      </h1>
      <p style={{ color: C.textDim, fontSize: 13, marginTop: 4, marginBottom: 14 }}>{t.garagesSub}</p>

      <div className="flex gap-2 mb-4">
        {Object.keys(GARAGES).map((code) => {
          const active = code === country;
          return (
            <button
              key={code}
              onClick={() => setCountry(code)}
              style={{
                flex: 1,
                border: `1px solid ${active ? C.accent : C.line}`,
                background: active ? `${C.accent}18` : C.surface,
                color: active ? C.accent : C.textDim,
                borderRadius: 10,
                padding: "9px 6px",
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {GARAGES[code][lang]}
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
        <span style={{ color: C.textDim, fontSize: 11.5, lineHeight: 1.5 }}>{t.garagesNote}</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {issueKey && <IssueGarageBanner lang={lang} issueKey={issueKey} noMatch={noIssueMatch} />}
        {shownGarages.map((g) => (
          <button
            key={g.key}
            onClick={() => window.open(g.mapLink, "_blank")}
            className="w-full"
            style={{
              background: C.surface,
              border: `1px solid ${C.line}`,
              borderRadius: 14,
              overflow: "hidden",
              padding: 0,
              cursor: "pointer",
              textAlign: isRTL ? "right" : "left",
              display: "block",
            }}
          >
            {g.photoUrl && (
              <img src={g.photoUrl} alt={g.name} style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} onError={(e) => (e.currentTarget.style.display = "none")} />
            )}
            <div style={{ padding: "14px 16px" }}>
              <div className="flex items-start justify-between gap-2">
                <span style={{ color: C.text, fontSize: 14, fontWeight: 700 }}>{g.name}</span>
                <MapPin size={15} color={C.accent} style={{ flexShrink: 0, marginTop: 1 }} />
              </div>
              <div style={{ color: C.accentDim, fontSize: 11.5, marginTop: 3, fontWeight: 600 }}>
                {g.area}
                {g.distanceKm != null && ` · ${g.distanceKm.toFixed(1)} ${lang === "ar" ? "كم" : "km"}`}
              </div>
              {g.note && (
                <div style={{ color: C.textDim, fontSize: 12.5, marginTop: 5, lineHeight: 1.5 }}>
                  {g.note}
                </div>
              )}
              <div style={{ color: C.blue, fontSize: 11, marginTop: 7, fontWeight: 600 }}>
                {t.openInMaps}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
