import { useEffect, useRef } from "react";

// The phone's Back button closes the dialog on top instead of leaving the screen.
// Each open dialog adds one tagged history entry. Back pops it: App's popstate handler calls
// closeTopDialogOnBack() first, which closes that dialog and keeps App from re-routing.
// A dialog closed some other way (its × button, a tap outside) steps back over its own entry,
// unless the app navigated on top of it meanwhile; then the entry just stays behind.
const open = [];
let nextId = 1;
let ownBacks = 0; // history.back() calls made here, whose popstate is ours to swallow

export function useCloseOnBack(isOpen, close) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!isOpen) return undefined;
    const entry = { id: nextId++, close: () => closeRef.current(), poppedByBack: false };
    open.push(entry);
    try { window.history.pushState({ ...window.history.state, karajiDialog: entry.id }, "", window.location.href); } catch (_) {}
    return () => {
      const i = open.indexOf(entry);
      if (i >= 0) open.splice(i, 1);
      if (!entry.poppedByBack && window.history.state?.karajiDialog === entry.id) {
        ownBacks += 1;
        try { window.history.back(); } catch (_) { ownBacks -= 1; }
      }
    };
  }, [isOpen]);
}

// Called first thing on popstate; true means the event belonged to a dialog. The app's own
// navigation fires synthetic popstate events (not isTrusted), which are never a Back press.
export function closeTopDialogOnBack(event) {
  if (event && !event.isTrusted) return false;
  if (ownBacks > 0) { ownBacks -= 1; return true; }
  const top = open.pop();
  if (!top) return false;
  top.poppedByBack = true;
  top.close();
  return true;
}
