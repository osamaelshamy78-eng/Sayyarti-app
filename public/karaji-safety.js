(function () {
  "use strict";

  function replaceText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach((textNode) => {
      const value = textNode.nodeValue || "";
      const next = value
        .replace(/Trusted garages/g, "Garage directory")
        .replace(/trusted garages/g, "garage directory")
        .replace(/ورش موثوقة/g, "دليل الورش")
        .replace(/اعثر على ورش موثوقة/g, "اعثر على ورش قريبة")
        .replace(/Diagnose car issues & find trusted garages/g, "Diagnose car issues & find nearby garages")
        .replace(/شخّص مشاكل سيارتك واعثر على ورش موثوقة/g, "شخّص مشاكل سيارتك واعثر على ورش قريبة");
      if (next !== value) textNode.nodeValue = next;
    });
  }

  function addLegalLink() {
    if (document.getElementById("karaji-legal-entry")) return;
    const link = document.createElement("a");
    link.id = "karaji-legal-entry";
    link.href = "/legal/";
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "Legal / قانوني";
    Object.assign(link.style, {
      position: "fixed",
      left: "10px",
      bottom: "72px",
      zIndex: "99999",
      background: "#1D2129",
      color: "#F2ECDD",
      border: "1px solid #2A2F38",
      borderRadius: "8px",
      padding: "5px 9px",
      font: "11px Arial, sans-serif",
      textDecoration: "none",
      opacity: "0.78"
    });
    document.body.appendChild(link);
  }

  function run() {
    if (document.body) {
      replaceText(document.body);
      addLegalLink();
    }
  }

  new MutationObserver(run).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
