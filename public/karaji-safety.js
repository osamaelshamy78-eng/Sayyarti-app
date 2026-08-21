(function () {
  "use strict";

  const C = {
    asphalt: "#14171C",
    panel: "#1D2129",
    line: "#2A2F38",
    cream: "#F2ECDD",
    dim: "#B9B2A0",
    amber: "#F5B942",
    blue: "#4C7EA8",
  };

  function isArabic() {
    return document.documentElement.dir === "rtl" || document.documentElement.lang === "ar";
  }

  function replaceText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach((textNode) => {
      const value = textNode.nodeValue || "";
      const next = value
        .replace(/Diagnose car issues & find trusted garages/g, "Diagnose car issues & find nearby garages")
        .replace(/Trusted garages/g, "Garage directory")
        .replace(/trusted garages/g, "nearby garages")
        .replace(/شخّص مشاكل سيارتك واعثر على ورش موثوقة/g, "شخّص مشاكل سيارتك واعثر على ورش قريبة")
        .replace(/اعثر على ورش موثوقة/g, "اعثر على ورش قريبة")
        .replace(/ورش موثوقة/g, "دليل الورش");
      if (next !== value) textNode.nodeValue = next;
    });
  }

  function findGarageButton() {
    const candidates = Array.from(document.querySelectorAll("button, a"));
    return candidates.find((el) => {
      const text = (el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      return text.includes("add your garage") || text.includes("أضف جراجك") || text.includes("ضيف جراجك");
    });
  }

  function openAbout() {
    let modal = document.getElementById("karaji-about-modal");
    if (modal) {
      modal.style.display = "flex";
      return;
    }

    const ar = isArabic();
    modal = document.createElement("div");
    modal.id = "karaji-about-modal";
    Object.assign(modal.style, {
      position: "fixed",
      inset: "0",
      zIndex: "100000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "18px",
      background: "rgba(0,0,0,.68)",
      direction: ar ? "rtl" : "ltr",
    });

    const card = document.createElement("div");
    Object.assign(card.style, {
      width: "min(520px, 100%)",
      maxHeight: "82vh",
      overflow: "auto",
      background: C.panel,
      border: `1px solid ${C.line}`,
      borderRadius: "18px",
      padding: "22px",
      color: C.cream,
      boxShadow: "0 18px 60px rgba(0,0,0,.4)",
      position: "relative",
    });

    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    Object.assign(close.style, {
      position: "absolute",
      top: "10px",
      [ar ? "left" : "right"]: "10px",
      width: "34px",
      height: "34px",
      borderRadius: "50%",
      border: `1px solid ${C.line}`,
      background: C.asphalt,
      color: C.cream,
      fontSize: "22px",
      cursor: "pointer",
    });
    close.onclick = () => { modal.style.display = "none"; };

    const title = document.createElement("h2");
    title.textContent = ar ? "عن كراجي" : "About Karaji";
    Object.assign(title.style, { margin: "0 42px 10px 0", color: C.amber, fontSize: "24px" });
    if (ar) title.style.margin = "0 0 10px 42px";

    const p1 = document.createElement("p");
    p1.textContent = ar
      ? "كراجي منصة رقمية ثنائية اللغة تساعد أصحاب السيارات على فهم مشاكل السيارة، استكشاف الأعطال، وتحويل نتيجة البحث إلى خطوة عملية مثل مشاهدة فيديو مناسب أو الوصول إلى جراج قريب."
      : "Karaji is a bilingual digital platform that helps car owners understand vehicle problems, explore common faults, and turn the result into a practical next step such as watching a relevant video or finding a nearby garage.";
    p1.style.color = C.dim;
    p1.style.lineHeight = "1.8";

    const p2 = document.createElement("p");
    p2.textContent = ar
      ? "يوفر كراجي أيضًا دليلًا للجراجات، وميزات لإضافة الجراجات، وإعلانات السيارات، ومحتوى إرشادي عن أعطال السيارات."
      : "Karaji also provides a garage directory, garage listing tools, vehicle listings, and educational car-fault guidance.";
    p2.style.color = C.dim;
    p2.style.lineHeight = "1.8";

    const note = document.createElement("div");
    note.textContent = ar
      ? "الهدف: جمع معلومات السيارة والخطوة التالية في مكان واحد، مع إبقاء المستخدم صاحب القرار النهائي."
      : "Goal: put the car information and the next step in one place while keeping the user in control of the final decision.";
    Object.assign(note.style, {
      marginTop: "16px",
      padding: "12px 14px",
      background: `${C.amber}12`,
      borderRight: ar ? `3px solid ${C.amber}` : "none",
      borderLeft: ar ? "none" : `3px solid ${C.amber}`,
      borderRadius: "10px",
      color: C.cream,
      lineHeight: "1.7",
    });

    card.append(close, title, p1, p2, note);
    modal.appendChild(card);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.style.display = "none";
    });
    document.body.appendChild(modal);
  }

  function navigateHome() {
    if (window.location.pathname !== "/") window.location.href = "/";
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openGarageAdd() {
    const button = findGarageButton();
    if (button) {
      button.click();
      return;
    }
    window.location.href = "/garages";
  }

  function addMenu() {
    if (document.getElementById("karaji-top-menu")) return;

    const existingHeaderButton = Array.from(document.querySelectorAll("button")).find((button) => {
      const r = button.getBoundingClientRect();
      return r.top >= 0 && r.top < 380 && r.right > window.innerWidth * 0.72 && r.width >= 34 && r.width <= 90 && r.height >= 34 && r.height <= 90;
    });

    const wrap = document.createElement("div");
    wrap.id = "karaji-top-menu";
    Object.assign(wrap.style, {
      position: existingHeaderButton ? "relative" : "fixed",
      zIndex: "100001",
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "flex-end",
      ...(existingHeaderButton ? {} : { top: "92px", right: "16px" }),
    });

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.setAttribute("aria-label", "More / المزيد");
    trigger.textContent = "⋮";
    Object.assign(trigger.style, {
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      border: `1px solid ${C.line}`,
      background: C.panel,
      color: C.amber,
      fontSize: "24px",
      fontWeight: "800",
      cursor: "pointer",
      boxShadow: "0 8px 26px rgba(0,0,0,.18)",
    });

    const panel = document.createElement("div");
    Object.assign(panel.style, {
      display: "none",
      marginTop: "8px",
      width: "210px",
      background: C.panel,
      border: `1px solid ${C.line}`,
      borderRadius: "14px",
      padding: "7px",
      boxShadow: "0 16px 45px rgba(0,0,0,.38)",
    });

    const menuItems = [
      {
        ar: "الداشبورد",
        en: "Dashboard",
        action: navigateHome,
      },
      {
        ar: "ضيف جراجك",
        en: "Add Your Garage",
        action: openGarageAdd,
      },
      {
        ar: "قانوني",
        en: "Legal",
        action: () => { window.location.href = "/legal/"; },
      },
      {
        ar: "عن التطبيق",
        en: "About the App",
        action: openAbout,
      },
    ];

    menuItems.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      const ar = isArabic();
      btn.textContent = ar ? item.ar : item.en;
      Object.assign(btn.style, {
        width: "100%",
        textAlign: ar ? "right" : "left",
        padding: "11px 12px",
        border: "0",
        borderRadius: "10px",
        background: "transparent",
        color: C.cream,
        fontSize: "13px",
        cursor: "pointer",
      });
      btn.onmouseenter = () => { btn.style.background = `${C.amber}12`; btn.style.color = C.amber; };
      btn.onmouseleave = () => { btn.style.background = "transparent"; btn.style.color = C.cream; };
      btn.onclick = () => {
        panel.style.display = "none";
        item.action();
      };
      panel.appendChild(btn);
    });

    trigger.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      panel.style.display = panel.style.display === "none" ? "block" : "none";
    };

    wrap.append(trigger, panel);

    if (existingHeaderButton && existingHeaderButton.parentElement) {
      existingHeaderButton.parentElement.insertBefore(wrap, existingHeaderButton);
    } else {
      document.body.appendChild(wrap);
    }

    document.addEventListener("click", (event) => {
      if (!wrap.contains(event.target)) panel.style.display = "none";
    });
  }

  function removeOldLegalBadge() {
    const old = document.getElementById("karaji-legal-entry");
    if (old) old.remove();
  }

  function run() {
    if (!document.body) return;
    replaceText(document.body);
    removeOldLegalBadge();
    addMenu();
  }

  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
