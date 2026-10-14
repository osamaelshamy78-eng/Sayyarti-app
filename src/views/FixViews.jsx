import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, PlayCircle, MapPin } from "lucide-react";
import { supabase } from "../supabaseClient";
import { FindGarageButton } from "../components/IssueGarages";
import { OBD_CODES } from "../data/obdCodes";
import { C } from "../theme";
import { EngineLightIcon } from "../data/warningLights";
import { CATEGORIES, ISSUES } from "../data/issues";
import { Dial } from "./HomeView";
import { BackHeader } from "../components/BackHeader";
import { routePathForIssue } from "../routes";

export function FixView({ lang, t, onOpenCategory, onOpenGuide, onOpenIssue, onOpenObdCode }) {
  const [query, setQuery] = useState("");
  const [expandedCode, setExpandedCode] = useState(null);

  const norm = query.trim().toUpperCase();
  const matches =
    norm.length >= 2
      ? Object.keys(OBD_CODES)
          .filter((code) => {
            const entry = OBD_CODES[code];
            return (
              code.includes(norm) ||
              entry.en.title.toUpperCase().includes(norm) ||
              entry.ar.title.includes(query.trim())
            );
          })
          .slice(0, 6)
      : [];

  return (
    <div className="px-5 pt-5 pb-6">
      <div className="mb-2">
        <label
          style={{
            color: C.creamDim,
            fontSize: 12,
            fontWeight: 600,
            display: "block",
            marginBottom: 6,
          }}
        >
          {t.faultCodeSearchLabel}
        </label>
        <div
          className="flex items-center gap-2"
          style={{
            background: "#ffffff0d",
            border: `1px solid #ffffff1f`,
            borderRadius: 12,
            padding: "10px 12px",
          }}
        >
          <Search size={16} color={C.creamDim} strokeWidth={2} style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setExpandedCode(null);
            }}
            placeholder={t.faultCodeSearchPlaceholder}
            dir={lang === "ar" ? "rtl" : "ltr"}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: C.cream,
              fontSize: 13.5,
              width: "100%",
              fontFamily: "inherit",
            }}
          />
        </div>
        <p style={{ color: C.creamDim, fontSize: 10.5, marginTop: 5, opacity: 0.75 }}>
          {t.faultCodeSearchHint}
        </p>
      </div>

      {norm.length >= 2 && (
        <div className="mb-6">
          {matches.length === 0 ? (
            <p style={{ color: C.creamDim, fontSize: 12, padding: "10px 2px" }}>
              {t.faultCodeNoResults}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {matches.map((code) => {
                const entry = OBD_CODES[code];
                const info = entry[lang];
                const isOpen = expandedCode === code;
                return (
                  <div
                    key={code}
                    style={{
                      background: "#ffffff0a",
                      border: `1px solid #ffffff1a`,
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => onOpenObdCode(code)}
                      className="w-full flex items-center gap-3"
                      style={{
                        padding: "11px 13px",
                        textAlign: lang === "ar" ? "right" : "left",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          color: C.amber,
                          fontSize: 12.5,
                          fontWeight: 700,
                          flexShrink: 0,
                          fontFamily: "monospace",
                        }}
                      >
                        {code}
                      </span>
                      <span style={{ color: C.cream, fontSize: 12.5, fontWeight: 600, flex: 1 }}>
                        {info.title}
                      </span>
                      {lang === "ar" ? (
                        <ChevronLeft size={14} color={C.creamDim} />
                      ) : (
                        <ChevronRight size={14} color={C.creamDim} />
                      )}
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 13px 13px" }}>
                        <p
                          style={{
                            color: C.creamDim,
                            fontSize: 11.5,
                            lineHeight: 1.6,
                            marginBottom: entry.relatedIssue ? 10 : 0,
                          }}
                        >
                          <span style={{ fontWeight: 700, color: C.cream }}>
                            {t.faultCodeMeaning}:{" "}
                          </span>
                          {info.meaning}
                        </p>
                        {entry.relatedIssue && (
                          <button
                            onClick={() => onOpenIssue(entry.relatedIssue)}
                            style={{
                              color: C.blue,
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {t.faultCodeViewGuide}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <button
        onClick={onOpenGuide}
        className="w-full flex items-center gap-3 mb-6"
        style={{
          background: `${C.blue}14`,
          border: `1px solid ${C.blue}55`,
          borderRadius: 14,
          padding: "13px 16px",
          cursor: "pointer",
          textAlign: lang === "ar" ? "right" : "left",
        }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 38, height: 38, background: `${C.blue}22`, flexShrink: 0 }}
        >
          <EngineLightIcon size={19} color={C.blue} strokeWidth={1.6} />
        </div>
        <span style={{ color: C.cream, fontSize: 13.5, fontWeight: 600, flex: 1 }}>
          {t.lightsGuideTile}
        </span>
        {lang === "ar" ? (
          <ChevronLeft size={16} color={C.blue} />
        ) : (
          <ChevronRight size={16} color={C.blue} />
        )}
      </button>

      <div className="grid grid-cols-2 gap-y-7 gap-x-3">
        {CATEGORIES.filter((cat) => cat.id !== "general").map((cat) => (
          <Dial
            key={cat.id}
            Icon={cat.icon}
            label={cat[lang]}
            count={cat.issues.length}
            unitLabel={cat.issues.length === 1 ? t.issuesCount : t.issuesCountPlural}
            onClick={() => onOpenCategory(cat)}
          />
        ))}
      </div>
    </div>
  );
}

export function ObdCodeView({ lang, t, code, onOpenIssue, onBack, isRTL }) {
  const entry = OBD_CODES[code];
  if (!entry) return null;
  const info = entry[lang];
  const related = entry.relatedIssue ? ISSUES[entry.relatedIssue]?.[lang] : null;

  return (
    <div className="pb-6">
      <BackHeader label={t.navIssues} onBack={onBack} isRTL={isRTL} />
      <div className="px-5">
        <div style={{ color: C.amber, fontFamily: "monospace", fontWeight: 800, fontSize: 22, marginBottom: 5 }}>
          {code}
        </div>
        <h1 style={{ color: C.cream, fontSize: 19, fontWeight: 700, margin: "0 0 8px" }}>
          {info.title}
        </h1>
        <div
          style={{
            background: C.panel,
            border: `1px solid ${C.panelLine}`,
            borderRadius: 14,
            padding: "14px 15px",
            marginBottom: 14,
          }}
        >
          <div style={{ color: C.creamDim, fontSize: 11.5, fontWeight: 700, marginBottom: 5 }}>
            {t.faultCodeMeaning}
          </div>
          <p style={{ color: C.cream, fontSize: 13, lineHeight: 1.65, margin: 0 }}>{info.meaning}</p>
        </div>

        {related && (
          <button
            onClick={() => onOpenIssue(entry.relatedIssue)}
            style={{
              width: "100%",
              background: `${C.blue}14`,
              border: `1px solid ${C.blue}55`,
              borderRadius: 14,
              padding: "13px 15px",
              color: C.blue,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              textAlign: lang === "ar" ? "right" : "left",
            }}
          >
            {t.faultCodeViewGuide}: {related.title}
          </button>
        )}
      </div>
    </div>
  );
}

export function LightsGuideView({ lang, t, onOpenCategory, onBack, isRTL }) {
  return (
    <div className="pb-6">
      <BackHeader label={t.navIssues} onBack={onBack} isRTL={isRTL} />
      <div className="px-5">
        <h1 style={{ color: C.cream, fontSize: 19, fontWeight: 700, margin: "0 0 4px 0" }}>
          {t.lightsGuideHeading}
        </h1>
        <p style={{ color: C.creamDim, fontSize: 13, marginBottom: 18 }}>{t.lightsGuideSub}</p>

        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onOpenCategory(cat)}
                className="flex flex-col items-center gap-2"
                style={{
                  background: C.panel,
                  border: `1px solid ${C.panelLine}`,
                  borderRadius: 14,
                  padding: "16px 10px",
                  cursor: "pointer",
                }}
              >
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 56,
                    height: 56,
                    background: `radial-gradient(circle, ${C.amber}22, ${C.amber}08 70%)`,
                    border: `1px solid ${C.amber}`,
                  }}
                >
                  <Icon size={26} color={C.amber} strokeWidth={1.5} />
                </div>
                <span
                  style={{
                    color: C.cream,
                    fontSize: 12.5,
                    fontWeight: 600,
                    textAlign: "center",
                    lineHeight: 1.3,
                  }}
                >
                  {lang === "ar" ? cat.guideAr : cat.guideEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CategoryView({ lang, t, category, onOpenIssue, onBack, isRTL }) {
  const Icon = category.icon;
  return (
    <div className="pb-6">
      <BackHeader label={t.navIssues} onBack={onBack} isRTL={isRTL} />
      <div className="px-5 flex items-center gap-3 mb-4">
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 42, height: 42, background: `${C.amber}18`, border: `1px solid ${C.amberDim}` }}
        >
          <Icon size={20} color={C.amber} />
        </div>
        <h2 style={{ color: C.cream, fontSize: 18, fontWeight: 700, margin: 0 }}>
          {category[lang]}
        </h2>
      </div>
      <div className="px-5 flex flex-col gap-2.5">
        {category.issues.map((issueId) => {
          const issue = ISSUES[issueId][lang];
          return (
            <button
              key={issueId}
              onClick={() => onOpenIssue(issueId)}
              className="text-start"
              style={{
                background: C.panel,
                border: `1px solid ${C.panelLine}`,
                borderRadius: 14,
                padding: "14px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: C.cream, fontSize: 14, fontWeight: 600, textAlign: isRTL ? "right" : "left" }}>
                {issue.title}
              </span>
              {isRTL ? (
                <ChevronLeft size={16} color={C.grey} />
              ) : (
                <ChevronRight size={16} color={C.grey} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Section({ label, color, children }) {
  return (
    <div className="mb-5">
      <div
        style={{
          color,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.06em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

export function IssueView({ lang, t, issueId, onBack, categoryLabel, CategoryIcon, isRTL, onRequestQuote }) {
  const issue = ISSUES[issueId][lang];
  const [media, setMedia] = useState([]);

  useEffect(() => {
    let active = true;
    async function loadIssueMedia() {
      if (!supabase) return;
      const { data } = await supabase
        .from("issue_media")
        .select("id,media_type,url,title,sort_order,created_at")
        .eq("issue_id", issueId)
        .eq("lang", lang)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (active) setMedia(data || []);
    }
    loadIssueMedia();
    return () => { active = false; };
  }, [issueId, lang]);

  return (
    <div className="pb-6" style={{ paddingBottom: "calc(90px + env(safe-area-inset-bottom))" }}>
      <BackHeader label={categoryLabel} onBack={onBack} isRTL={isRTL} />
      <div className="px-5">
        {CategoryIcon && (
          <div className="flex justify-center mb-4">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 84,
                height: 84,
                background: `radial-gradient(circle, ${C.amber}33, ${C.amber}08 70%)`,
                border: `1.5px solid ${C.amber}`,
                boxShadow: `0 0 22px ${C.amber}55, inset 0 0 12px ${C.amber}22`,
              }}
            >
              <CategoryIcon size={38} color={C.amber} strokeWidth={1.5} />
            </div>
          </div>
        )}
        <h2 style={{ color: C.cream, fontSize: 19, fontWeight: 700, margin: "0 0 16px 0", lineHeight: 1.3, textAlign: "center" }}>
          {issue.title}
        </h2>
        <FindGarageButton lang={lang} issuePath={routePathForIssue(issueId)} />

        <Section label={t.symptoms} color={C.blue}>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {issue.symptoms.map((s, i) => (
              <li
                key={i}
                style={{
                  color: C.creamDim,
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  display: "flex",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <span style={{ color: C.blue, flexShrink: 0 }}>●</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section label={t.causes} color={C.amber}>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {issue.causes.map((s, i) => (
              <li
                key={i}
                style={{
                  color: C.creamDim,
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  display: "flex",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <span style={{ color: C.amber, flexShrink: 0 }}>●</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section label={t.steps} color={C.red}>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", counterReset: "step" }}>
            {issue.steps.map((s, i) => (
              <li
                key={i}
                style={{
                  color: C.cream,
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  display: "flex",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: `${C.red}22`,
                    color: C.red,
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </Section>

        {media.length > 0 && (
          <Section label={lang === "ar" ? "فيديو وصور الإصلاح" : "Repair photos & videos"} color={C.blue}>
            <div className="flex flex-col gap-3">
              {media.map((m) => (
                <div key={m.id} style={{ background: C.panel, border: `1px solid ${C.panelLine}`, borderRadius: 12, overflow: "hidden" }}>
                  {m.media_type === "video" ? (
                    <video src={m.url} controls playsInline preload="metadata" style={{ width: "100%", maxHeight: 230, background: "#000", display: "block" }} />
                  ) : (
                    <img src={m.url} alt={m.title || issue.title} loading="lazy" style={{ width: "100%", maxHeight: 230, objectFit: "cover", display: "block" }} />
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        <button
          onClick={() =>
            window.open(
              `https://www.youtube.com/results?search_query=${encodeURIComponent(issue.video)}`,
              "_blank"
            )
          }
          className="w-full flex items-center justify-center gap-2"
          style={{
            background: C.amber,
            border: "none",
            borderRadius: 12,
            padding: "13px 16px",
            cursor: "pointer",
            marginTop: 4,
          }}
        >
          <PlayCircle size={18} color={C.asphalt} />
          <span style={{ color: C.asphalt, fontSize: 14, fontWeight: 700 }}>{t.watchVideo}</span>
        </button>

        {onRequestQuote && (
          <button
            onClick={() => onRequestQuote(issue)}
            className="w-full flex items-center justify-center gap-2"
            style={{
              background: "transparent",
              border: `1.5px solid ${C.blue}`,
              borderRadius: 12,
              padding: "13px 16px",
              cursor: "pointer",
              marginTop: 10,
            }}
          >
            <MapPin size={18} color={C.blue} />
            <span style={{ color: C.blue, fontSize: 14, fontWeight: 700 }}>{t.requestQuoteBtn}</span>
          </button>
        )}
      </div>
    </div>
  );
}
