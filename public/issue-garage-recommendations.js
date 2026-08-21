(() => {
  const MAP = {
    engine: ["engine", "motor", "mechanical", "diagnostic"],
    battery: ["battery", "electrical", "electric", "alternator", "diagnostic"],
    brakes: ["brake", "brakes"],
    ac: ["ac", "air conditioning", "cooling", "radiator"],
    tires: ["tire", "tyre", "tires", "tyres", "wheel", "alignment"],
    oil: ["oil", "fluid", "lubrication", "engine"],
    transmission: ["transmission", "gearbox", "clutch"],
    suspension: ["suspension", "steering", "shock", "strut"],
    general: ["diagnostic", "mechanical", "auto repair", "workshop"]
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
    general: { en: "Recommended garages", ar: "الجراجات المقترحة" }
  };

  function issueId() {
    const m = location.pathname.match(/^\/fault\/([^/]+)$/);
    if (!m) return null;
    const s = decodeURIComponent(m[1]).toLowerCase();
    for (const k of Object.keys(MAP)) if (s.includes(k)) return k;
    const pairs = [
      [/brake|فرامل/, "brakes"], [/battery|بطارية|electrical|كهرب/, "battery"],
      [/ac|air|cool|تكييف|تبريد/, "ac"], [/tire|tyre|wheel|إطار/, "tires"],
      [/oil|زيت/, "oil"], [/trans|gear|clutch|ناقل/, "transmission"],
      [/steer|suspension|shock|تعليق|توجيه/, "suspension"], [/engine|motor|محرك/, "engine"]
    ];
    return pairs.find(([r]) => r.test(s))?.[1] || "general";
  }

  function lang() { return document.documentElement.dir === "rtl" ? "ar" : "en"; }
  function textOf(el) { return (el?.innerText || "").toLowerCase(); }

  function addIssueButton() {
    const id = issueId(); if (!id) return;
    if (document.querySelector("[data-karaji-issue-garages]")) return;
    const h1 = document.querySelector("h1");
    if (!h1) return;
    const b = document.createElement("button");
    b.dataset.karajiIssueGarages = "1";
    b.type = "button";
    const ar = lang() === "ar";
    b.textContent = ar ? "ابحث عن جراج مناسب للعطل" : "Find a garage for this issue";
    Object.assign(b.style, {width:"100%",marginTop:"12px",padding:"12px 14px",borderRadius:"12px",border:"0",background:"#F5B942",color:"#14171C",fontWeight:"800",cursor:"pointer"});
    b.onclick = () => { location.href = `/garages?issue=${encodeURIComponent(id)}`; };
    h1.parentElement?.appendChild(b);
  }

  function filterGarages() {
    if (!location.pathname.replace(/\/+$/, "").endsWith("/garages")) return;
    const issue = new URLSearchParams(location.search).get("issue");
    if (!issue || !MAP[issue]) return;
    const words = MAP[issue];
    const cards = Array.from(document.querySelectorAll("button")).filter(b => {
      const t = textOf(b);
      return t.includes("open in maps") || t.includes("فتح في الخريطة") || t.includes("open in map") || t.includes("الخريطة");
    });
    let matches = 0;
    cards.forEach(card => {
      const t = textOf(card);
      const ok = words.some(w => t.includes(w));
      card.style.display = ok ? "block" : "none";
      if (ok) matches++;
    });

    const markerId = "karaji-issue-garage-banner";
    let banner = document.getElementById(markerId);
    if (!banner) {
      banner = document.createElement("div"); banner.id = markerId;
      const parent = cards[0]?.parentElement;
      if (parent) parent.prepend(banner);
    }
    if (!banner) return;
    const ar = lang() === "ar";
    banner.innerHTML = `<div style="background:#4C7EA814;border:1px solid #4C7EA844;border-radius:12px;padding:11px 12px;margin-bottom:10px;color:#F2ECDD;font-size:12px;line-height:1.5"><strong>${(LABELS[issue]||LABELS.general)[ar?"ar":"en"]}</strong><br>${ar?"تم تصفية القائمة حسب العطل الذي اخترته.":"The list is filtered for the issue you selected."}${matches?"":"<br>"}<button data-karaji-nearby style="margin-top:8px;width:100%;padding:9px;border-radius:9px;border:1px solid #F5B942;background:#F5B942;color:#14171C;font-weight:800;cursor:pointer">${ar?"ابحث عن متخصص قريب مني":"Find a nearby specialist"}</button></div>`;
    const near=banner.querySelector("[data-karaji-nearby]");
    near.onclick=()=>{
      const q=encodeURIComponent(`${(LABELS[issue]||LABELS.general).en} car garage`);
      if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p=>{location.href=`https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=&center=${p.coords.latitude},${p.coords.longitude}`},()=>{location.href=`https://www.google.com/maps/search/?api=1&query=${q}`});
      else location.href=`https://www.google.com/maps/search/?api=1&query=${q}`;
    };
  }

  let timer;
  function run(){ clearTimeout(timer); timer=setTimeout(()=>{addIssueButton();filterGarages();},150); }
  new MutationObserver(run).observe(document.documentElement,{subtree:true,childList:true});
  window.addEventListener("popstate",run);
  run();
})();
