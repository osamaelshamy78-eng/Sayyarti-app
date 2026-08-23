export function startMaintenanceNavFix() {
  if (typeof document === "undefined") return () => {};

  const openExistingPlanner = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    window.dispatchEvent(new CustomEvent("karaji-open-maintenance-planner"));
  };

  const wire = () => {
    const candidates = Array.from(document.querySelectorAll("button, [role='button']"));
    const button = candidates.find((el) => {
      const label = (el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      const aria = (el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().toLowerCase();
      const title = (el.getAttribute("title") || "").replace(/\s+/g, " ").trim().toLowerCase();
      const haystack = `${label} ${aria} ${title}`;
      return /(^|\s)(maintenance|الصيانة)(\s|$)/i.test(haystack) && el.closest("[data-karaji-bottom-nav='true']");
    });
    if (!button || button.getAttribute("data-karaji-maintenance-fixed") === "true") return;
    button.setAttribute("data-karaji-maintenance-fixed", "true");
    button.addEventListener("pointerdown", openExistingPlanner, true);
    button.addEventListener("touchstart", openExistingPlanner, true);
    button.addEventListener("click", openExistingPlanner, true);
  };

  wire();
  const observer = new MutationObserver(wire);
  observer.observe(document.body, { subtree: true, childList: true });
  return () => observer.disconnect();
}
