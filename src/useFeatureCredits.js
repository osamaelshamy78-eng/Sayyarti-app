import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { PAID_RETURN } from "./StripeReturnNotice";

// feature: "diagnosis" | "valuation"
export function useFeatureCredits(feature, userId) {
  const [creditsRemaining, setCreditsRemaining] = useState(null);
  const [freeUsed, setFreeUsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [creditsRes, adminRes] = await Promise.all([
      supabase
        .from("user_credits")
        .select("credits_remaining, free_diagnosis_used, free_valuation_used")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase.rpc("is_car_admin"),
    ]);
    const data = creditsRes.data;
    if (data) {
      setCreditsRemaining(data.credits_remaining ?? 0);
      setFreeUsed(feature === "diagnosis" ? !!data.free_diagnosis_used : !!data.free_valuation_used);
    } else {
      // no row yet -> brand new user, free trial still available
      setCreditsRemaining(0);
      setFreeUsed(false);
    }
    setIsAdmin(adminRes.data === true);
    setLoading(false);
  }, [feature, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Just paid by card: the Stripe webhook usually adds the credits within seconds, so look again a few times.
  useEffect(() => {
    if (PAID_RETURN !== "1" || !userId) return;
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      refresh();
      if (tries >= 6) clearInterval(timer);
    }, 2500);
    return () => clearInterval(timer);
  }, [refresh, userId]);

  return { creditsRemaining, freeUsed, isAdmin, loading, refresh };
}
