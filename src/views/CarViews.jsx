import { useRef, useState, useEffect } from "react";
import { formatPrice, formatMileage } from "../carFormat";
import { CheckCircle2, MessageCircle, Car, Info } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useCloseOnBack } from "../backButton";
import { CAR_COUNTRIES } from "../countries";
import CarMedia from "../components/CarMedia";
import CarForm, { CAR_MODELS, CAR_MAKES } from "../components/CarForm";
import { BackHeader } from "../components/BackHeader";
import { C } from "../theme";

/* Full-screen photo viewer: swipe between photos, X or phone Back closes it */
function FullscreenGallery({ photos, startIndex, onClose, lang }) {
  const scrollerRef = useRef(null);
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    // Jump to the tapped photo
    const el = scrollerRef.current;
    if (el) el.scrollLeft = el.clientWidth * startIndex * (lang === "ar" ? -1 : 1);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && closeViewer();
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phone Back button closes the viewer instead of leaving the page
  useCloseOnBack(true, onClose);
  function closeViewer() {
    onClose();
  }

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el || !el.clientWidth) return;
    setCurrent(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={lang === "ar" ? "عرض الصور" : "Photo viewer"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ padding: "calc(env(safe-area-inset-top, 0px) + 12px) 16px 12px" }}
      >
        <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
          {photos.length > 1 ? `${current + 1} / ${photos.length}` : ""}
        </span>
        <button
          onClick={closeViewer}
          aria-label={lang === "ar" ? "إغلاق" : "Close"}
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            border: "none",
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            fontSize: 22,
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
        }}
      >
        {photos.map((url, i) => (
          <div
            key={i}
            style={{
              flex: "0 0 100%",
              scrollSnapAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CarMedia
              src={url}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CarDetailView({ lang, t, isRTL, car, onBack }) {
  const [viewerIndex, setViewerIndex] = useState(null);
  const photos =
    car.photo_urls && car.photo_urls.length
      ? car.photo_urls
      : car.photo_url
      ? [car.photo_url]
      : [];
  const countryLabel = CAR_COUNTRIES.find((x) => x.code === car.country)?.[lang];

  return (
    <div className="pb-6">
      <BackHeader label={t.navCars} onBack={onBack} isRTL={isRTL} />

      {viewerIndex !== null && (
        <FullscreenGallery
          photos={photos}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          lang={lang}
        />
      )}

      {photos.length > 0 ? (
        <div
          className="flex gap-2 px-5 mb-4"
          style={{ overflowX: "auto", scrollSnapType: "x mandatory" }}
        >
          {photos.map((url, i) => (
            <CarMedia
              key={i}
              src={url}
              onClick={() => setViewerIndex(i)}
              style={{
                width: "85%",
                height: 220,
                objectFit: "cover",
                borderRadius: 14,
                flexShrink: 0,
                scrollSnapAlign: "start",
                cursor: "zoom-in",
              }}
              onError={(e) => (e.target.style.opacity = 0.3)}
            />
          ))}
        </div>
      ) : null}

      <div className="px-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 style={{ color: C.text, fontSize: 19, fontWeight: 700, margin: 0 }}>
            {car.make_model} {car.year ? `· ${car.year}` : ""}
          </h2>
          <span style={{ color: C.accent, fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
            {formatPrice(car.price, car.country, lang)}
          </span>
        </div>

        <div style={{ color: C.textDim, fontSize: 12.5, marginBottom: 14 }}>
          {[car.city, countryLabel].filter(Boolean).join(" · ")}
          {formatMileage(car.mileage, lang) ? ` · ${formatMileage(car.mileage, lang)}` : ""}
          {car.specs === "gulf" ? ` · ${t.carSpecsGulf}` : ""}
          {car.specs === "american" ? ` · ${t.carSpecsAmerican}` : ""}
        </div>

        {car.description && (
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.line}`,
              borderRadius: 12,
              padding: "12px 14px",
              marginBottom: 16,
            }}
          >
            <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              {car.description}
            </p>
          </div>
        )}

        {car.status === "sold" ? (
          <div
            className="w-full flex items-center justify-center gap-2"
            style={{
              background: `${C.red}18`,
              border: `1px solid ${C.red}66`,
              borderRadius: 12,
              padding: "13px 16px",
              boxSizing: "border-box",
            }}
          >
            <CheckCircle2 size={18} color={C.red} />
            <span style={{ color: C.red, fontSize: 14, fontWeight: 800 }}>{t.soldBadge}</span>
          </div>
        ) : (
          <button
            onClick={() =>
              window.open(`https://wa.me/${car.phone.replace(/[^0-9]/g, "")}`, "_blank")
            }
            className="w-full flex items-center justify-center gap-2"
            style={{
              background: C.accent,
              border: "none",
              borderRadius: 12,
              padding: "13px 16px",
              cursor: "pointer",
            }}
          >
            <MessageCircle size={18} color={C.onAccent} />
            <span style={{ color: C.onAccent, fontSize: 14, fontWeight: 700 }}>{t.carContact}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function CarsView({ lang, t, isRTL, mode, onSubmitted, onBack }) {
  if (mode === "submitted") {
    return (
      <div className="px-5 pt-8 pb-6 text-center">
        <div
          className="flex items-center justify-center rounded-full mb-4"
          style={{
            width: 60,
            height: 60,
            background: `${C.accent}18`,
            border: `1px solid ${C.accentDim}`,
            margin: "0 auto 16px",
          }}
        >
          <Car size={26} color={C.accent} />
        </div>
        <p style={{ color: C.text, fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>
          {t.carSubmitted}
        </p>
        <button
          onClick={onBack}
          style={{
            background: C.accent,
            border: "none",
            borderRadius: 12,
            padding: "12px 20px",
            color: C.onAccent,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {t.navCars}
        </button>
      </div>
    );
  }

  return (
    <CarForm
      lang={lang}
      t={t}
      isRTL={isRTL}
      onClose={onBack}
      onSubmitted={onSubmitted}
    />
  );
}

/* ---------------------------------------------------------------
   Buy a car — browse & filter approved listings
--------------------------------------------------------------- */
const PRICE_RANGES = [
  { id: "u20k", min: 0, max: 20000 },
  { id: "20-50k", min: 20000, max: 50000 },
  { id: "50-100k", min: 50000, max: 100000 },
  { id: "100-200k", min: 100000, max: 200000 },
  { id: "o200k", min: 200000, max: null },
];
const YEAR_RANGES = [
  { id: "pre2015", min: null, max: 2014 },
  { id: "2015-2019", min: 2015, max: 2019 },
  { id: "2020-2022", min: 2020, max: 2022 },
  { id: "2023plus", min: 2023, max: null },
];
const MILEAGE_RANGES = [
  { id: "u20k", min: 0, max: 20000 },
  { id: "20-60k", min: 20000, max: 60000 },
  { id: "60-120k", min: 60000, max: 120000 },
  { id: "o120k", min: 120000, max: null },
];

function rangeLabel(r, lang, unit) {
  if (r.min == null) return lang === "ar" ? `أقل من ${r.max.toLocaleString()}${unit}` : `Under ${r.max.toLocaleString()}${unit}`;
  if (r.max == null) return lang === "ar" ? `أكتر من ${r.min.toLocaleString()}${unit}` : `Over ${r.min.toLocaleString()}${unit}`;
  return `${r.min.toLocaleString()} – ${r.max.toLocaleString()}${unit}`;
}

function inRange(value, range) {
  if (!range) return true;
  const n = Number(value);
  if (!Number.isFinite(n)) return false;
  if (range.min != null && n < range.min) return false;
  if (range.max != null && n > range.max) return false;
  return true;
}

export function BuyCarView({ lang, t, isRTL }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ country: "", make: "", model: "", price: "", year: "", mileage: "" });

  useEffect(() => {
    let active = true;
    let timer;
    async function load() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError("");
      const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Car listings request timed out")), 10000);
      });
      try {
        const query = supabase
          .from("car_listings")
          .select("*")
          .in("status", ["approved", "sold"])
          .order("created_at", { ascending: false });
        const { data, error } = await Promise.race([query, timeout]);
        if (!active) return;
        if (error) throw error;
        setListings(data || []);
      } catch (err) {
        if (active) {
          setListings([]);
          setLoadError(err?.message || "Could not load car listings.");
        }
      } finally {
        clearTimeout(timer);
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  if (selected) {
    return <CarDetailView lang={lang} t={t} isRTL={isRTL} car={selected} onBack={() => setSelected(null)} />;
  }

  const modelOptions = filters.make && filters.make !== "Other" ? CAR_MODELS[filters.make] || [] : [];
  const priceRange = PRICE_RANGES.find((r) => r.id === filters.price);
  const yearRange = YEAR_RANGES.find((r) => r.id === filters.year);
  const mileageRange = MILEAGE_RANGES.find((r) => r.id === filters.mileage);

  const filtered = listings.filter((c) => {
    if (filters.country && c.country !== filters.country) return false;
    if (filters.make && !(c.make_model || "").toLowerCase().startsWith(filters.make.toLowerCase())) return false;
    if (filters.model && !(c.make_model || "").toLowerCase().includes(filters.model.toLowerCase())) return false;
    if (priceRange && !inRange(c.price, priceRange)) return false;
    if (yearRange && !inRange(c.year, yearRange)) return false;
    if (mileageRange && !inRange(c.mileage, mileageRange)) return false;
    return true;
  });

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const selectStyle = {
    background: C.surface,
    border: `1px solid ${C.line}`,
    borderRadius: 10,
    padding: "9px 10px",
    color: C.text,
    fontSize: 12.5,
    width: "100%",
  };

  return (
    <div className="px-5 pt-5 pb-6">
      <div className="flex items-center justify-between mb-1">
        <h1 style={{ color: C.text, fontSize: 21, fontWeight: 700, margin: 0 }}>{t.buyCarHeading}</h1>
      </div>
      <p style={{ color: C.textDim, fontSize: 13, marginTop: 4, marginBottom: 14 }}>{t.buyCarSub}</p>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <span style={{ color: C.textDim, fontSize: 10.5, fontWeight: 700, display: "block", marginBottom: 3 }}>{t.filterCountry}</span>
          <select
            style={selectStyle}
            value={filters.country}
            onChange={(e) => setFilters((f) => ({ ...f, country: e.target.value }))}
          >
            <option value="">{t.filterAll}</option>
            {CAR_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c[lang]}</option>
            ))}
          </select>
        </div>
        <div>
          <span style={{ color: C.textDim, fontSize: 10.5, fontWeight: 700, display: "block", marginBottom: 3 }}>{t.filterMake}</span>
          <select
            style={selectStyle}
            value={filters.make}
            onChange={(e) => setFilters((f) => ({ ...f, make: e.target.value, model: "" }))}
          >
            <option value="">{t.filterAll}</option>
            {CAR_MAKES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <span style={{ color: C.textDim, fontSize: 10.5, fontWeight: 700, display: "block", marginBottom: 3 }}>{t.filterModel}</span>
          <select
            style={selectStyle}
            value={filters.model}
            disabled={!modelOptions.length}
            onChange={(e) => setFilters((f) => ({ ...f, model: e.target.value }))}
          >
            <option value="">{t.filterAll}</option>
            {modelOptions.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <span style={{ color: C.textDim, fontSize: 10.5, fontWeight: 700, display: "block", marginBottom: 3 }}>{t.filterPrice}</span>
          <select
            style={selectStyle}
            value={filters.price}
            onChange={(e) => setFilters((f) => ({ ...f, price: e.target.value }))}
          >
            <option value="">{t.filterAll}</option>
            {PRICE_RANGES.map((r) => (
              <option key={r.id} value={r.id}>{rangeLabel(r, lang, "")}</option>
            ))}
          </select>
        </div>
        <div>
          <span style={{ color: C.textDim, fontSize: 10.5, fontWeight: 700, display: "block", marginBottom: 3 }}>{t.filterYear}</span>
          <select
            style={selectStyle}
            value={filters.year}
            onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
          >
            <option value="">{t.filterAll}</option>
            {YEAR_RANGES.map((r) => (
              <option key={r.id} value={r.id}>{rangeLabel(r, lang, "")}</option>
            ))}
          </select>
        </div>
        <div>
          <span style={{ color: C.textDim, fontSize: 10.5, fontWeight: 700, display: "block", marginBottom: 3 }}>{t.filterMileage}</span>
          <select
            style={selectStyle}
            value={filters.mileage}
            onChange={(e) => setFilters((f) => ({ ...f, mileage: e.target.value }))}
          >
            <option value="">{t.filterAll}</option>
            {MILEAGE_RANGES.map((r) => (
              <option key={r.id} value={r.id}>{rangeLabel(r, lang, " km")}</option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => setFilters({ country: "", make: "", model: "", price: "", year: "", mileage: "" })}
          style={{ background: "none", border: "none", color: C.blue, fontSize: 11.5, fontWeight: 700, cursor: "pointer", padding: "4px 0", marginBottom: 10 }}
        >
          {t.filterClear}
        </button>
      )}

      {!supabase ? (
        <div
          className="flex items-start gap-2"
          style={{ background: `${C.blue}14`, border: `1px solid ${C.blue}44`, borderRadius: 10, padding: "10px 12px", marginTop: 8 }}
        >
          <Info size={14} color={C.blue} style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ color: C.textDim, fontSize: 11.5, lineHeight: 1.5 }}>{t.carNoDb}</span>
        </div>
      ) : loading ? (
        <p style={{ color: C.textDim, fontSize: 13, textAlign: "center", marginTop: 20 }}>{t.carLoading}</p>
      ) : loadError ? (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <p style={{ color: C.red, fontSize: 13, marginBottom: 10 }}>
            {lang === "ar" ? "تعذر تحميل السيارات حاليًا." : "Could not load car listings right now."}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: C.accent, border: "none", borderRadius: 10, padding: "9px 14px", color: C.onAccent, fontWeight: 700, cursor: "pointer" }}
          >
            {lang === "ar" ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ color: C.textDim, fontSize: 13, textAlign: "center", marginTop: 20 }}>
          {listings.length === 0 ? t.carEmpty : t.filterNoResults}
        </p>
      ) : (
        <div className="flex flex-col gap-2.5" style={{ marginTop: 6 }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelected(c)}
              style={{
                background: C.surface,
                border: `1px solid ${C.line}`,
                borderRadius: 14,
                overflow: "hidden",
                cursor: "pointer",
              }}
            >
              {(c.photo_url || (c.photo_urls && c.photo_urls[0])) && (
                <div style={{ position: "relative" }}>
                  <CarMedia
                    src={c.photo_url || c.photo_urls[0]}
                    alt={c.make_model}
                    style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  {c.status === "sold" && (
                    <div
                      aria-label={t.soldBadge}
                      style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%) rotate(-12deg)",
                        border: `3px solid ${C.red}`, color: C.red,
                        background: "rgba(10,11,13,0.78)", borderRadius: 10,
                        padding: "7px 18px", fontSize: 21, fontWeight: 900,
                        letterSpacing: 2, textTransform: lang === "en" ? "uppercase" : "none",
                        whiteSpace: "nowrap", zIndex: 3, pointerEvents: "none",
                      }}
                    >
                      {t.soldBadge}
                    </div>
                  )}
                  {c.photo_urls && c.photo_urls.length > 1 && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 8,
                        insetInlineEnd: 8,
                        background: "rgba(0,0,0,0.6)",
                        color: C.text,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 999,
                      }}
                    >
                      +{c.photo_urls.length - 1}
                    </span>
                  )}
                </div>
              )}
              <div style={{ padding: "12px 14px" }}>
                {c.status === "sold" && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: `${C.red}18`,
                      border: `1px solid ${C.red}66`,
                      color: C.red,
                      borderRadius: 999,
                      padding: "3px 8px",
                      fontSize: 10.5,
                      fontWeight: 800,
                      marginBottom: 7,
                    }}
                  >
                    <CheckCircle2 size={12} />
                    {t.soldBadge}
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <span style={{ color: C.text, fontSize: 14.5, fontWeight: 700 }}>
                    {c.make_model} {c.year ? `· ${c.year}` : ""}
                  </span>
                  <span style={{ color: C.accent, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                    {formatPrice(c.price, c.country, lang)}
                  </span>
                </div>
                <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 3 }}>
                  {[c.city, CAR_COUNTRIES.find((x) => x.code === c.country)?.[lang]]
                    .filter(Boolean)
                    .join(" · ")}
                  {formatMileage(c.mileage, lang) ? ` · ${formatMileage(c.mileage, lang)}` : ""}
                  {c.specs === "gulf" ? ` · ${t.carSpecsGulf}` : ""}
                  {c.specs === "american" ? ` · ${t.carSpecsAmerican}` : ""}
                </div>
                {c.description && (
                  <p style={{ color: C.textDim, fontSize: 12.5, marginTop: 6, lineHeight: 1.5 }}>
                    {c.description}
                  </p>
                )}
                {c.status === "sold" ? (
                  <div
                    className="flex items-center justify-center gap-2 mt-3"
                    style={{
                      width: "100%",
                      background: `${C.red}12`,
                      border: `1px solid ${C.red}55`,
                      borderRadius: 10,
                      padding: "8px 12px",
                    }}
                  >
                    <CheckCircle2 size={14} color={C.red} />
                    <span style={{ color: C.red, fontSize: 12.5, fontWeight: 700 }}>
                      {t.soldBadge}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`, "_blank");
                    }}
                    className="flex items-center justify-center gap-2 mt-3"
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: `1px solid ${C.accentDim}`,
                      borderRadius: 10,
                      padding: "8px 12px",
                      cursor: "pointer",
                    }}
                  >
                    <MessageCircle size={14} color={C.accent} />
                    <span style={{ color: C.accent, fontSize: 12.5, fontWeight: 600 }}>
                      {t.carContact}
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
