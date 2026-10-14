import ProfileMenuCard from "./ProfileMenuCard";
import AppMenuLinks, { MENU_ROW_STYLE } from "./AppMenuLinks";
import BuyCreditForm from "./BuyCreditForm";
import { useRef, useEffect, useState } from "react";
import { useAccount } from "../useAccount";
import { Menu, ShieldCheck } from "lucide-react";
import SignLogo from "./SignLogo";
import { C, FONT_BODY, FONT_SIGN } from "../theme";

/* ---------------------------------------------------------------
   Small building blocks
--------------------------------------------------------------- */
export function TopBar({ lang, setLang, t, onLogoTap, menuOpen, onToggleMenu, onCloseMenu, onNavigate, onOpenAdmin }) {
  const isRTL = lang === "ar";
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  const account = useAccount(menuOpen);
  const [buyOpen, setBuyOpen] = useState(false);
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
  // The header is the app's road sign: white-bordered panel on sign blue
  const onSign = { border: `1.5px solid ${C.onAccent}`, background: "transparent", color: C.onAccent, cursor: "pointer" };
  return (
    <div style={{ background: C.accent, padding: "10px 14px 12px", position: "relative" }}>
      <div
        className="flex items-center justify-between"
        style={{ border: `2px solid ${C.onAccent}`, borderRadius: 10, padding: "6px 10px" }}
      >
        <button
          onClick={onLogoTap}
          aria-label={isRTL ? "الصفحة الرئيسية" : "Home"}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <SignLogo framed={false} />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(isRTL ? "en" : "ar")}
            aria-label={isRTL ? "Switch to English" : "التبديل إلى العربية"}
            style={{ ...onSign, height: 34, minWidth: 44, padding: "0 10px", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: isRTL ? FONT_BODY : FONT_SIGN }}
          >
            {isRTL ? "EN" : "ع"}
          </button>

          <button
            ref={toggleRef}
            onClick={onToggleMenu}
            aria-label={isRTL ? "القائمة" : "Menu"}
            aria-expanded={menuOpen}
            className="flex items-center justify-center"
            style={{ ...onSign, width: 34, height: 34, borderRadius: 8 }}
          >
            <Menu size={18} color={C.onAccent} strokeWidth={2} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            top: 64,
            insetInlineEnd: 14,
            background: C.surface,
            border: `1px solid ${C.line}`,
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(14,27,44,0.18)",
            overflow: "hidden",
            zIndex: 50,
            minWidth: 190,
            width: 280,
            maxWidth: "calc(100vw - 40px)",
          }}
        >
          <ProfileMenuCard
            lang={lang}
            account={account}
            onBuyCredits={() => { onCloseMenu(); setBuyOpen(true); }}
          />

          {account.isAdmin && (
            <button type="button" onClick={onOpenAdmin} style={MENU_ROW_STYLE}>
              <ShieldCheck size={16} color={C.accent} strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{t.adminMenuLabel}</span>
            </button>
          )}

          <AppMenuLinks lang={lang} onNavigate={onNavigate} onDone={onCloseMenu} />
        </div>
      )}

      {/* outside the menu, so it stays open after the menu closes */}
      <BuyCreditForm isOpen={buyOpen} onClose={() => setBuyOpen(false)} lang={lang} userEmail={account.user?.email} />
    </div>
  );
}
