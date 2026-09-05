import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const SITE_URL = "https://www.sayyarti.online";
const dist = path.join(root, "dist");
const source = fs.readFileSync(path.join(root, "src", "App.jsx"), "utf8");
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractTitles(blockName) {
  const start = source.indexOf(`const ${blockName} = {`);
  const endMarker = blockName === "ISSUES" ? "const OBD_CODES = {" : "const GARAGES = {";
  const end = source.indexOf(endMarker, start);
  const block = source.slice(start, end === -1 ? source.length : end);
  const out = [];
  const re = blockName === "ISSUES"
    ? /^\s{2}([A-Za-z0-9_]+): \{\s*\n\s*en: \{\s*\n\s*title: "([^"]+)"/gm
    : /^\s{2}(P\d{4}): \{[\s\S]*?\n\s*en: \{ title: "([^"]+)"/gm;
  let m;
  while ((m = re.exec(block))) out.push({ id: m[1], title: m[2] });
  return out;
}

function extractCategories() {
  const start = source.indexOf("const CATEGORIES = [");
  const end = source.indexOf("const ISSUES = {", start);
  const block = source.slice(start, end);
  const re = /id: "([^"]+)"/g;
  const out = [];
  let m;
  while ((m = re.exec(block))) out.push(m[1]);
  return out;
}

const issues = extractTitles("ISSUES");
const obdCodes = extractTitles("OBD_CODES");
const categories = extractCategories();

const issuePaths = issues.map((x) => ({
  path: `/fault/${slugify(x.title)}`,
  title: `${x.title} | Sayyarti`,
  description: `${x.title}: symptoms, common causes and practical diagnostic steps on Sayyarti.`,
  heading: x.title,
  text: `Learn the common symptoms, possible causes and practical next diagnostic steps for ${x.title}.`,
}));

const obdPaths = obdCodes.map((x) => ({
  path: `/obd/${x.id}`,
  title: `${x.id} — ${x.title} | Sayyarti`,
  description: `${x.id}: ${x.title}. Understand what the code means and what to check next with Sayyarti.`,
  heading: `${x.id} — ${x.title}`,
  text: `Understand what ${x.id} means, the system involved, and the next diagnostic step.`,
}));

const categoryPaths = categories.map((id) => ({
  path: `/fix/${id}`,
  title: `${id} car problems and fixes | Sayyarti`,
  description: `Browse ${id} car problems, symptoms, causes and repair guidance on Sayyarti.`,
  heading: `${id} car problems and fixes`,
  text: `Browse common ${id} problems, symptoms, causes and practical repair guidance.`,
}));

const sectionPaths = [
  { path: "/fix", title: "Car Fault Diagnosis | Sayyarti", description: "Search car problems, check OBD-II codes and browse practical repair guides.", heading: "Car Fault Diagnosis", text: "Search common car faults and OBD-II codes and open a dedicated guide." },
  { path: "/guide", title: "Car Warning Lights Guide | Sayyarti", description: "Understand dashboard warning lights and know what to check next.", heading: "Car Warning Lights Guide", text: "Understand dashboard warning lights and the next checks to perform." },
  { path: "/garages", title: "Car Garages & Workshops | Sayyarti", description: "Find car garages and workshops by country and location.", heading: "Car Garages & Workshops", text: "Find garage listings by country and location." },
  { path: "/maintenance", title: "Car Maintenance Guide | Sayyarti", description: "Browse practical car maintenance information on Sayyarti.", heading: "Car Maintenance Guide", text: "Browse maintenance information for common vehicle needs." },
  { path: "/parts", title: "Car Spare Parts | Sayyarti", description: "Browse car spare parts information on Sayyarti.", heading: "Car Spare Parts", text: "Explore spare-parts information available through Sayyarti." },
  { path: "/diagnosis", title: "Car Photo Diagnosis | Sayyarti", description: "Use Sayyarti to explore photo-based car diagnosis.", heading: "Car Photo Diagnosis", text: "Use the diagnosis feature to investigate a car problem from a photo." },
  { path: "/cars", title: "My Cars | Sayyarti", description: "Manage your cars in Sayyarti.", heading: "My Cars", text: "Manage vehicles and keep your car information available in Sayyarti." },
];

const pages = [...sectionPaths, ...categoryPaths, ...issuePaths, ...obdPaths];

function renderPage(page) {
  const canonical = `${SITE_URL}${page.path}`;
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: "Sayyarti", url: `${SITE_URL}/` },
    inLanguage: "en",
  }).replace(/</g, "\\u003c");

  let html = template;
  html = html.replace(/<html[^>]*>/i, '<html lang="en">');
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/>/i, `<meta name="description" content="${escapeHtml(page.description)}" />`);
  html = html.replace(/<\/head>/i, `<link rel="canonical" href="${canonical}" />\n    <script type="application/ld+json">${jsonLd}</script>\n  </head>`);
  const fallback = `<main style="max-width:760px;margin:0 auto;padding:24px;font-family:Arial,sans-serif"><h1>${escapeHtml(page.heading)}</h1><p>${escapeHtml(page.text)}</p><p>Sayyarti provides bilingual Arabic/English car fault guides, OBD-II code explanations, maintenance information and garage discovery.</p></main>`;
  html = html.replace('<div id="root"></div>', `<div id="root">${fallback}</div>`);
  return html;
}

for (const page of pages) {
  const relative = page.path.replace(/^\//, "");
  const outDir = path.join(dist, relative);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), renderPage(page));
}


const sitemapUrls = pages.map((page) => `  <url><loc>${SITE_URL}${page.path}</loc></url>`).join("\n");
fs.writeFileSync(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE_URL}/</loc></url>\n${sitemapUrls}\n</urlset>\n`);
fs.writeFileSync(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`Generated ${pages.length} SEO route pages.`);
