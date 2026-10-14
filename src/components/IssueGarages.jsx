import React from "react";
import { C } from "../theme";

// From an issue page, "Find a garage for this issue" opens the garage directory filtered to
// garages whose name / area / note mention the issue's specialty.
const WORDS = {
  engine: ["engine", "motor", "mechanical", "diagnostic"],
  battery: ["battery", "electrical", "electric", "alternator", "diagnostic"],
  brakes: ["brake", "brakes"],
  ac: ["ac", "air conditioning", "cooling", "radiator"],
  tires: ["tire", "tyre", "tires", "tyres", "wheel", "alignment"],
  oil: ["oil", "fluid", "lubrication", "engine"],
  transmission: ["transmission", "gearbox", "clutch"],
  suspension: ["suspension", "steering", "shock", "strut"],
  general: ["diagnostic", "mechanical", "auto repair", "workshop"],
};

const LABELS = {
  engine: { en: "Engine specialists", ar: "متخصصون في المحرك" },
  battery: { en: "Electrical & battery specialists", ar: "متخصصون في الكهرباء والبطارية" },
  brakes: { en: "Brake specialists", ar: "متخصصون في الفرامل" },
  ac: { en: "AC & cooling specialists", ar: "متخصصون في التكييف والتبريد" },
  tires: { en: "Tire & wheel specialists", ar: "متخصصون في الإطارات والعجلات" },
  oil: { en: "Oil & fluid specialists", ar: "متخصصون في الزيوت والسوائل" },
  transmission: { en: "Transmission specialists", ar: "متخصصون في ناقل الحركة" },
  suspension: { en: "Steering & suspension specialists", ar: "متخصصون في التوجيه والتعليق" },
  general: { en: "Recommended garages", ar: "الجراجات المقترحة" },
};

// The issue's specialty, guessed from its /fault/<slug> address.
function issueKeyFromPath(path) {
  const m = /^\/fault\/([^/]+)$/.exec(path || "");
  if (!m) return null;
  const s = decodeURIComponent(m[1]).toLowerCase();
  for (const k of Object.keys(WORDS)) if (s.includes(k)) return k;
  const pairs = [
    [/brake|فرامل/, "brakes"], [/battery|بطارية|electrical|كهرب/, "battery"],
    [/ac|air|cool|تكييف|تبريد/, "ac"], [/tire|tyre|wheel|إطار/, "tires"],
    [/oil|زيت/, "oil"], [/trans|gear|clutch|ناقل/, "transmission"],
    [/steer|suspension|shock|تعليق|توجيه/, "suspension"], [/engine|motor|محرك/, "engine"],
  ];
  return pairs.find(([r]) => r.test(s))?.[1] || "general";
}

// The issue filter the garage directory was opened with (?issue=brakes), if any.
export function issueFilterFromUrl() {
  try {
    const key = new URLSearchParams(window.location.search).get("issue");
    return key && WORDS[key] ? key : null;
  } catch (_) {
    return null;
  }
}

// whole words only, so "ac" doesn't match inside "replace"
export function garageMatchesIssue(text, key) {
  const lower = (text || "").toLowerCase();
  return WORDS[key].some((w) => new RegExp(`\\b${w}\\b`).test(lower));
}

export function FindGarageButton({ lang, issuePath }) {
  const key = issueKeyFromPath(issuePath);
  if (!key) return null;
  return (
    <button
      type="button"
      onClick={() => { window.location.href = `/garages?issue=${encodeURIComponent(key)}`; }}
      style={{ width: "100%", marginTop: 12, marginBottom: 16, padding: "12px 14px", borderRadius: 12, border: 0, background: C.accent, color: C.onAccent, fontWeight: 800, cursor: "pointer", display: "block" }}
    >
      {lang === "ar" ? "ابحث عن جراج مناسب للعطل" : "Find a garage for this issue"}
    </button>
  );
}

function searchNearby(key) {
  const base = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${LABELS[key].en} car garage`);
  if (!navigator.geolocation) { window.location.href = base; return; }
  navigator.geolocation.getCurrentPosition(
    (p) => { window.location.href = `${base}&query_place_id=&center=${p.coords.latitude},${p.coords.longitude}`; },
    () => { window.location.href = base; }
  );
}

// noMatch: no listed garage does this kind of work, so the whole directory is shown instead
export function IssueGarageBanner({ lang, issueKey, noMatch }) {
  const ar = lang === "ar";
  return (
    <div style={{ background: `${C.blue}14`, border: `1px solid ${C.blue}44`, borderRadius: 12, padding: "11px 12px", marginBottom: 10, color: C.text, fontSize: 12, lineHeight: 1.5 }}>
      <strong>{LABELS[issueKey][ar ? "ar" : "en"]}</strong>
      <br />
      {noMatch
        ? (ar ? "مفيش جراج متخصص في القائمة لسه، فدي كل الجراجات. أو دوّر على متخصص قريب منك:" : "No specialist is listed for this yet, so here are all garages. Or look for one near you:")
        : (ar ? "تم تصفية القائمة حسب العطل الذي اخترته." : "The list is filtered for the issue you selected.")}
      <button
        type="button"
        onClick={() => searchNearby(issueKey)}
        style={{ marginTop: 8, width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${C.accent}`, background: C.accent, color: C.onAccent, fontWeight: 800, cursor: "pointer" }}
      >
        {ar ? "ابحث عن متخصص قريب مني" : "Find a nearby specialist"}
      </button>
    </div>
  );
}
