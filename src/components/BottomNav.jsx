import React, { useEffect, useState } from "react";
import { useAppLang } from "../appLanguage";
import { Home, Wrench } from "lucide-react";
import { C } from "../theme";

// Fixed bar at the bottom of every screen: Home, Maintenance, and a slot the AI assistant's
// button sits on (KarajiAIAssistant draws that button itself, over the empty third slot).
// The button for what's on screen is highlighted: App announces its view, the planner its state.
export const NAV_BUTTON_STYLE = {
  height: 58,
  border: `1px solid ${C.line}`,
  borderRadius: 12,
  background: C.surface,
  color: C.textDim,
  padding: "8px 5px",
  fontSize: 11,
  fontWeight: 800,
  lineHeight: 1.2,
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  WebkitTapHighlightColor: "transparent",
  touchAction: "manipulation",
  userSelect: "none",
  boxSizing: "border-box",
};

// added on top of NAV_BUTTON_STYLE for the screen that's showing
export const NAV_ACTIVE_STYLE = { color: C.accent, border: `1px solid ${C.accent}66`, background: `${C.accent}14` };

function useWindowEvent(name, initial, read) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    const on = (e) => setValue(read(e));
    window.addEventListener(name, on);
    return () => window.removeEventListener(name, on);
  }, [name]);
  return value;
}

function goHome() {
  if (window.location.pathname === "/") return;
  window.history.pushState({}, "", "/");
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function openMaintenance() {
  window.dispatchEvent(new CustomEvent("karaji-open-maintenance-planner"));
}

export default function BottomNav() {
  const isAr = useAppLang() === "ar";
  const view = useWindowEvent("karaji-view-change", window.location.pathname === "/" ? "home" : "", (e) => e.detail.view);
  const plannerOpen = useWindowEvent("karaji-planner-change", false, (e) => e.detail.open);
  const items = [
    { id: "home", label: isAr ? "الرئيسية" : "Home", Icon: Home, onClick: goHome, active: view === "home" && !plannerOpen },
    { id: "maintenance", label: isAr ? "الصيانة" : "Maintenance", Icon: Wrench, onClick: openMaintenance, active: plannerOpen },
  ];
  return (
    <nav
      dir={isAr ? "rtl" : "ltr"}
      style={{
        position: "fixed",
        left: "var(--app-gutter)",
        right: "var(--app-gutter)",
        bottom: 0,
        zIndex: 9990,
        display: "flex",
        alignItems: "stretch",
        justifyContent: "space-around",
        gap: 6,
        padding: "8px 10px calc(8px + env(safe-area-inset-bottom))",
        background: C.surface,
        borderTop: `1px solid ${C.line}`,
        boxSizing: "border-box",
        boxShadow: "0 -6px 18px rgba(14,27,44,.08)",
      }}
    >
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={it.onClick}
          aria-current={it.active ? "page" : undefined}
          style={{ ...NAV_BUTTON_STYLE, ...(it.active ? NAV_ACTIVE_STYLE : null), flex: 1, minWidth: 0 }}
        >
          <it.Icon size={20} strokeWidth={2} aria-hidden="true" />
          <span>{it.label}</span>
        </button>
      ))}
      {/* same box as a button (padding + border), so the three slots come out equal */}
      <div aria-hidden="true" style={{ flex: 1, minWidth: 0, height: 58, padding: NAV_BUTTON_STYLE.padding, border: "1px solid transparent", boxSizing: "border-box" }} />
    </nav>
  );
}
