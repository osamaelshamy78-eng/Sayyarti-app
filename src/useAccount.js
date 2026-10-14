import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useCustomerAuth } from "./useCustomerAuth";

// The signed-in user's credits, latest purchase requests and admin flag, for the ☰ menu.
// Reloaded each time `active` turns true (the menu opens), so a new purchase shows up.
export function useAccount(active) {
  const { user, signOut } = useCustomerAuth();
  const [credits, setCredits] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!active || !user || !supabase) return undefined;
    let live = true;
    (async () => {
      try {
        const [creditsRes, requestsRes, adminRes] = await Promise.all([
          supabase
            .from("user_credits")
            .select("credits_remaining, free_diagnosis_used, free_valuation_used")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("credit_purchase_requests")
            .select("id, credits_requested, status, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(3),
          supabase.rpc("is_car_admin"),
        ]);
        if (!live) return;
        setCredits(creditsRes.data || { credits_remaining: 0, free_diagnosis_used: false, free_valuation_used: false });
        setRequests(requestsRes.data || []);
        setIsAdmin(adminRes.data === true);
      } catch (e) {
        console.error("account load failed", e);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [active, user]);

  return { user, signOut, credits, requests, isAdmin, loading };
}
