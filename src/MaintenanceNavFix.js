export function startMaintenanceNavFix() {
  if (typeof document === "undefined") return () => {};

  const openExistingPlanner = (event) => {
    const serviceButton = Array.from(document.querySelectorAll("button, [role='button']")).find((el) => {
      const label = (el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      return (label === "service" || label === "services" || label === "خدمة" || label === "الخدمات") &&
        !el.closest("[data-karaji-bottom-nav='true']") &&
        el.getAttribute("data-karaji-unwanted-service-button") === "true";
    });

    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();

    if (serviceButton) serviceButton.click();
    else window.dispatchEvent(new CustomEvent("karaji-open-maintenance-planner"));
  };

  const wire = () => {
    const button = document.querySelector("button[data-karaji-nav-action='/maintenance']");
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
