export function startMaintenanceNavFix() {
  if (typeof document === "undefined") return () => {};

  const activateExistingPlanner = (event) => {
    const button = event.target?.closest?.("button[data-karaji-nav-action='/maintenance']");
    if (!button) return;

    // This button must open the existing planner that was previously
    // opened by the floating Service button. Do not navigate to /maintenance.
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();

    const serviceButton = Array.from(document.querySelectorAll("button, [role='button']")).find((el) => {
      const label = (el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      return (label === "service" || label === "services" || label === "خدمة" || label === "الخدمات") &&
        !el.closest("[data-karaji-bottom-nav='true']") &&
        el.getAttribute("data-karaji-unwanted-service-button") === "true";
    });

    if (serviceButton) {
      serviceButton.click();
      return;
    }

    // Fallback: open the planner directly through its public DOM event.
    window.dispatchEvent(new CustomEvent("karaji-open-maintenance-planner"));
  };

  document.addEventListener("pointerdown", activateExistingPlanner, true);
  document.addEventListener("touchstart", activateExistingPlanner, true);
  document.addEventListener("click", activateExistingPlanner, true);

  return () => {
    document.removeEventListener("pointerdown", activateExistingPlanner, true);
    document.removeEventListener("touchstart", activateExistingPlanner, true);
    document.removeEventListener("click", activateExistingPlanner, true);
  };
}
