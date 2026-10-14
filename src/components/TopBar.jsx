import ProfileMenuCard from "./ProfileMenuCard";
import AppMenuLinks from "./AppMenuLinks";
import { useRef, useEffect } from "react";
import { Wrench, Menu, ShieldCheck } from "lucide-react";
import { C } from "../theme";

/* ---------------------------------------------------------------
   Small building blocks
--------------------------------------------------------------- */
export function TopBar({ lang, setLang, t, onLogoTap, menuOpen, onToggleMenu, onCloseMenu, onNavigate, onOpenAdmin }) {
  const isRTL = lang === "ar";
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  // a tap anywhere outside the open menu (and its toggle) closes it
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointer = (e) => {
      if (menuRef.current?.contains(e.target) || toggleRef.current?.contains(e.target)) return;
      onCloseMenu();
    };
    document.addEventListener("pointerdown", onPointer, true);
    return () => document.removeEventListener("pointerdown", onPointer, true);
  }, [menuOpen, onCloseMenu]);
  return (
    <div
      className="flex items-center justify-between px-5 pt-3 pb-4"
      style={{ borderBottom: `1px solid ${C.panelLine}`, position: "relative" }}
    >
      <button
        onClick={onLogoTap}
        className="flex items-center gap-2"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 30,
            height: 30,
            background: C.amber,
            boxShadow: `0 0 14px ${C.amber}66`,
          }}
        >
          <Wrench size={16} color={C.asphalt} strokeWidth={2.5} />
        </div>
        <span
          style={{
            color: C.cream,
            fontFamily: "'Oswald', sans-serif",
            fontSize: 19,
            letterSpacing: isRTL ? 0 : "0.02em",
            fontWeight: 600,
          }}
        >
          {t.wordmark}
        </span>
      </button>

      <div className="flex items-center gap-2">
        <div
          className="flex items-center rounded-full p-0.5"
          style={{ background: C.panel, border: `1px solid ${C.panelLine}` }}
        >
          {["en", "ar"].map((code) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "5px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                background: lang === code ? C.amber : "transparent",
                color: lang === code ? C.asphalt : C.creamDim,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {code === "en" ? "EN" : "AR"}
            </button>
          ))}
        </div>

        <button
          ref={toggleRef}
          onClick={onToggleMenu}
          aria-label={isRTL ? "القائمة" : "Menu"}
          aria-expanded={menuOpen}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 32,
            height: 32,
            background: C.panel,
            border: `1px solid ${C.panelLine}`,
            cursor: "pointer",
          }}
        >
          <Menu size={16} color={C.cream} strokeWidth={2} />
        </button>
      </div>

      {menuOpen && (
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            top: 54,
            insetInlineEnd: 20,
            background: C.panel,
            border: `1px solid ${C.panelLine}`,
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            overflow: "hidden",
            zIndex: 50,
            minWidth: 190,
            width: 280,
            maxWidth: "calc(100vw - 40px)",
          }}
        >
          <ProfileMenuCard lang={lang} />

          <button
            onClick={onOpenAdmin}
            className="w-full flex items-center gap-2"
            style={{
              display: "flex",
              width: "100%",
              padding: "12px 16px",
              background: "none",
              border: "none",
              color: C.cream,
              fontSize: 13,
              fontWeight: 600,
              textAlign: isRTL ? "right" : "left",
              cursor: "pointer",
              flexDirection: isRTL ? "row-reverse" : "row",
            }}
          >
            <ShieldCheck size={16} color={C.amber} strokeWidth={2} />
            <span style={{ flex: 1 }}>{t.adminMenuLabel}</span>
          </button>

          <AppMenuLinks lang={lang} onNavigate={onNavigate} onDone={onCloseMenu} />
        </div>
      )}
    </div>
  );
}
