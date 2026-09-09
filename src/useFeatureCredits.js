import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// feature: "diagnosis" | "valuation"
export function useFeatureCredits(feature, userId) {
  const [creditsRemaining, setCreditsRemaining] = useState(null);
  const [freeUsed, setFreeUsed] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("user_credits")
      .select("credits_remaining, free_diagnosis_used, free_valuation_used")
      .eq("user_id", userId)
      .maybeSingle();
    if (data) {
      setCreditsRemaining(data.credits_remaining ?? 0);
      setFreeUsed(feature === "diagnosis" ? !!data.free_diagnosis_used : !!data.free_valuation_used);
    } else {
      // no row yet -> brand new user, free trial still available
      setCreditsRemaining(0);
      setFreeUsed(false);
    }
    setLoading(false);
  }, [feature, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { creditsRemaining, freeUsed, loading, refresh };
}
