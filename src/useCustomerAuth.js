import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// Lightweight session hook for regular (non-admin) users signing in with
// Google to use the free-trial-then-credits features (photo diagnosis,
// car valuation). Independent from the admin email/password login in
// App.jsx — different concern, different audience.
export function useCustomerAuth() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return undefined;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data?.session || null);
        setChecking(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (active) setSession(newSession || null);
    });
    return () => {
      active = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
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
