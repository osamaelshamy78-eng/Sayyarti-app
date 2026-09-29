import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// Lightweight session hook for regular (non-admin) users signing in with
// Google. Used by the app-wide login gate, the profile menu card, and the
// paid features (photo diagnosis, car valuation).
//
// Robustness for the installed app (PWA): Google sign-in may finish in a
// browser tab instead of the app window. The session is then saved to shared
// storage, but the app window doesn't notice by itself — so we re-check the
// session whenever the app comes back to the foreground or storage changes.
export function useCustomerAuth() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return undefined;
    }
    let active = true;

    const refresh = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (active && data?.session) setSession(data.session);
      } catch (_) {}
    };

    const init = async () => {
      try {
        let { data } = await supabase.auth.getSession();

        // Returning from Google with a ?code=... but no session yet:
        // finish the sign-in manually (PKCE flow).
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (!data?.session && code) {
          try {
            const res = await supabase.auth.exchangeCodeForSession(code);
            data = res.data;
          } catch (e) {
            console.error("exchangeCodeForSession failed", e);
          }
        }

        // Remove sign-in leftovers from the address bar
        if (data?.session && (code || window.location.hash.includes("access_token"))) {
          params.delete("code");
          const clean = window.location.pathname + (params.toString() ? `?${params}` : "");
          window.history.replaceState(window.history.state, "", clean);
        }

        if (active) setSession(data?.session || null);
      } finally {
        if (active) setChecking(false);
      }
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (active) setSession(newSession || null);
    });

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    window.addEventListener("storage", refresh);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      listener?.subscription?.unsubscribe?.();
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("storage", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    // Return to the app's clean address (no old ?code / #tokens)
    const redirectTo = window.location.origin + window.location.pathname;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return {
    session,
    user: session?.user || null,
    accessToken: session?.access_token || null,
    checking,
    signInWithGoogle,
    signOut,
  };
}
