let started = false;

function getCloseButtons() {
  return Array.from(document.querySelectorAll("button")).filter((button) => {
    const text = (button.textContent || "").trim();
    const label = (button.getAttribute("aria-label") || "").toLowerCase();
    return text === "×" || label === "close" || label === "إغلاق";
  });
}

export function startOverlayBackHandler() {
  if (started || typeof window === "undefined" || typeof document === "undefined") return;
  started = true;

  let historyArmed = false;
  let closingFromBack = false;

  const closeOpenOverlays = () => {
    const buttons = getCloseButtons();
    buttons.forEach((button) => button.click());
  };

  const sync = () => {
    const hasOverlay = getCloseButtons().length > 0;

    if (hasOverlay && !historyArmed) {
      window.history.pushState({ karajiOverlay: true }, "", window.location.href);
      historyArmed = true;
      return;
    }

    if (!hasOverlay && historyArmed && !closingFromBack) {
      historyArmed = false;
      window.history.back();
    }
  };

  window.addEventListener("popstate", () => {
    if (!historyArmed) return;
    closingFromBack = true;
    historyArmed = false;
    closeOpenOverlays();
    window.setTimeout(() => {
      closingFromBack = false;
    }, 0);
  });

  const observer = new MutationObserver(sync);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
  });

  sync();
}
