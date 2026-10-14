import { CATEGORIES, ISSUES } from "./data/issues";
import { OBD_CODES } from "./data/obdCodes";

/* ---------------------------------------------------------------
   SEO-friendly URL routing helpers
--------------------------------------------------------------- */
function seoSlug(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ISSUE_SLUGS = Object.fromEntries(
  Object.entries(ISSUES).map(([id, item]) => [id, seoSlug(item.en.title)])
);

function issueIdFromSlug(slug) {
  return Object.keys(ISSUE_SLUGS).find((id) => ISSUE_SLUGS[id] === slug) || null;
}

function categoryFromId(id) {
  return CATEGORIES.find((cat) => cat.id === id) || null;
}

function categoryForIssue(issueId) {
  return CATEGORIES.find((cat) => cat.issues.includes(issueId)) || null;
}

export function routeFromPath(pathname) {
  const path = (pathname || "/").replace(/\/+$/, "") || "/";
  if (path === "/") return { view: "home" };
  if (path === "/fix") return { view: "fix" };
  if (path === "/guide") return { view: "guide" };
  if (path === "/garages") return { view: "garages" };
  if (path === "/maintenance") return { view: "maintenance" };
  if (path === "/parts") return { view: "parts" };
  if (path === "/diagnosis") return { view: "diagnosis" };
  if (path === "/cars") return { view: "cars", carMode: "add" };
  if (path === "/cars/add") return { view: "cars", carMode: "add" };
  if (path === "/cars/submitted") return { view: "cars", carMode: "submitted" };
  if (path === "/buy-car") return { view: "buy-car" };
  if (path === "/valuation") return { view: "valuation" };
  if (path === "/rentals") return { view: "rentals" };
  if (path === "/admin") return { view: "admin" };

  const fixMatch = path.match(/^\/fix\/([^/]+)$/);
  if (fixMatch) {
    const category = categoryFromId(fixMatch[1]);
    if (category) return { view: "category", activeCategory: category };
  }

  const faultMatch = path.match(/^\/fault\/([^/]+)$/);
  if (faultMatch) {
    const issueId = issueIdFromSlug(faultMatch[1]);
    if (issueId) {
      return {
        view: "issue",
        activeIssueId: issueId,
        activeCategory: categoryForIssue(issueId),
      };
    }
  }

  const obdMatch = path.match(/^\/obd\/([^/]+)$/i);
  if (obdMatch) {
    const code = obdMatch[1].toUpperCase();
    if (OBD_CODES[code]) return { view: "obd", activeObdCode: code };
  }

  return { view: "home", fallback: true };
}

export function routePathForIssue(issueId) {
  return `/fault/${ISSUE_SLUGS[issueId] || seoSlug(issueId)}`;
}

export function routePathForCategory(category) {
  return `/fix/${category.id}`;
}

export function applySeoMeta({ lang, view, activeIssueId, activeCategory, activeObdCode }) {
  if (typeof document === "undefined") return;
  const isArabic = lang === "ar";
  let title = "Sayyarti — Car Issues & Trusted Garages";
  let description = isArabic
    ? "سيارتي يساعدك في تشخيص أعطال السيارات، معرفة أكواد OBD والعثور على الجراج المناسب."
    : "Sayyarti helps you diagnose car problems, understand OBD fault codes and find trusted garages.";

  if (view === "issue" && activeIssueId && ISSUES[activeIssueId]) {
    const item = ISSUES[activeIssueId][lang];
    title = `${item.title} | Sayyarti`;
    description = isArabic
      ? `${item.title}: الأعراض والأسباب وخطوات الفحص والإصلاح على سيارتي.`
      : `${item.title}: symptoms, common causes and practical diagnostic steps on Sayyarti.`;
  } else if (view === "obd" && activeObdCode && OBD_CODES[activeObdCode]) {
    const item = OBD_CODES[activeObdCode][lang];
    title = `${activeObdCode} — ${item.title} | Sayyarti`;
    description = `${item.title}. ${item.meaning}`;
  } else if (view === "category" && activeCategory) {
    title = `${activeCategory[lang]} — Car Problems & Fixes | Sayyarti`;
    description = isArabic
      ? `دليل أعطال ${activeCategory.ar}: الأعراض والأسباب وطرق الفحص والإصلاح.`
      : `${activeCategory.en} problems: symptoms, causes and practical repair guidance.`;
  } else if (view === "fix") {
    title = isArabic ? "تشخيص أعطال السيارات | سيارتي" : "Car Fault Diagnosis | Sayyarti";
    description = isArabic
      ? "ابحث عن عطل سيارتك، افحص أكواد OBD وشاهد دليل الأعطال والإصلاح."
      : "Search car problems, check OBD-II codes and browse practical repair guides.";
  } else if (view === "guide") {
    title = isArabic ? "دليل لمبات السيارة | سيارتي" : "Car Warning Lights Guide | Sayyarti";
    description = isArabic
      ? "افهم لمبات التحذير في لوحة القيادة واعرف الخطوة التالية."
      : "Understand dashboard warning lights and know what to check next.";
  } else if (view === "garages") {
    title = isArabic ? "جراجات وورش سيارات | سيارتي" : "Car Garages & Workshops | Sayyarti";
    description = isArabic
      ? "اعثر على جراجات وورش سيارات حسب الدولة والموقع."
      : "Find car garages and workshops by country and location.";
  }

  document.title = title;
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", description);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", window.location.origin + window.location.pathname);

  let jsonLd = document.getElementById("karaji-route-jsonld");
  if (!jsonLd) {
    jsonLd = document.createElement("script");
    jsonLd.type = "application/ld+json";
    jsonLd.id = "karaji-route-jsonld";
    document.head.appendChild(jsonLd);
  }
  jsonLd.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: window.location.href,
    inLanguage: lang,
    isPartOf: { "@type": "WebSite", name: "Sayyarti", url: window.location.origin },
  });
}
