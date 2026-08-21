const FOCUSABLE_INPUT = 'input, textarea, select, [contenteditable="true"]';

function isKeyboardOpen() {
  const viewport = window.visualViewport;
  if (!viewport) return false;
  return viewport.height < window.innerHeight * 0.82;
}

function keepFocusedFieldVisible() {
  const active = document.activeElement;
  if (!active || !active.matches?.(FOCUSABLE_INPUT)) return;
  if (!isKeyboardOpen()) return;

  window.requestAnimationFrame(() => {
    try {
      active.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "auto",
      });
    } catch (_) {
      active.scrollIntoView();
    }
  });
}

export function startKeyboardBehaviorFix() {
  if (window.__karajiKeyboardBehaviorFixStarted) return;
  window.__karajiKeyboardBehaviorFixStarted = true;

  const onFocusIn = () => {
    // Let the browser open the keyboard first, then bring the field into view.
    window.setTimeout(keepFocusedFieldVisible, 180);
    window.setTimeout(keepFocusedFieldVisible, 360);
  };

  const onViewportChange = () => {
    if (isKeyboardOpen()) keepFocusedFieldVisible();
  };

  document.addEventListener("focusin", onFocusIn, true);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", onViewportChange, { passive: true });
    window.visualViewport.addEventListener("scroll", onViewportChange, { passive: true });
  }
}
