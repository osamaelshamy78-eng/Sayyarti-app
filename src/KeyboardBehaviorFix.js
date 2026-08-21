const FOCUSABLE_INPUT = 'input, textarea, select, [contenteditable="true"]';

function getViewport() {
  return window.visualViewport || null;
}

function isKeyboardOpen() {
  const viewport = getViewport();
  if (!viewport) return false;
  return viewport.height < window.innerHeight * 0.9;
}

function keepFocusedFieldVisible() {
  const active = document.activeElement;
  const viewport = getViewport();
  if (!active || !active.matches?.(FOCUSABLE_INPUT) || !viewport || !isKeyboardOpen()) return;

  window.requestAnimationFrame(() => {
    try {
      const rect = active.getBoundingClientRect();
      const topSafe = 16;
      const bottomSafe = 110;
      const viewportTop = viewport.offsetTop + topSafe;
      const viewportBottom = viewport.offsetTop + viewport.height - bottomSafe;

      let delta = 0;
      if (rect.top < viewportTop) delta = rect.top - viewportTop;
      else if (rect.bottom > viewportBottom) delta = rect.bottom - viewportBottom;

      if (Math.abs(delta) > 2) {
        window.scrollBy({ top: delta, left: 0, behavior: "smooth" });
      }
    } catch (_) {
      try {
        active.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
      } catch (__) {}
    }
  });
}

function syncKeyboardHeight() {
  const viewport = getViewport();
  if (!viewport) return;

  const keyboardHeight = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
  document.documentElement.style.setProperty("--karaji-keyboard-height", `${keyboardHeight}px`);
}

export function startKeyboardBehaviorFix() {
  if (window.__karajiKeyboardBehaviorFixStarted) return;
  window.__karajiKeyboardBehaviorFixStarted = true;

  const run = () => {
    syncKeyboardHeight();
    keepFocusedFieldVisible();
  };

  const onFocusIn = () => {
    [60, 160, 300, 500, 800].forEach((delay) => window.setTimeout(run, delay));
  };

  const onViewportChange = () => {
    syncKeyboardHeight();
    if (isKeyboardOpen()) {
      [0, 80, 220].forEach((delay) => window.setTimeout(keepFocusedFieldVisible, delay));
    }
  };

  const onFocusOut = () => {
    window.setTimeout(() => {
      if (!isKeyboardOpen()) syncKeyboardHeight();
    }, 120);
  };

  document.addEventListener("focusin", onFocusIn, true);
  document.addEventListener("focusout", onFocusOut, true);

  const viewport = getViewport();
  if (viewport) {
    viewport.addEventListener("resize", onViewportChange, { passive: true });
    viewport.addEventListener("scroll", onViewportChange, { passive: true });
  }

  window.addEventListener("resize", onViewportChange, { passive: true });
  run();
}
