/**
 * useIntelligence
 *
 * Calls the /functions/v1/intelligence Edge Function to get server-computed
 * fair price, fraud risk, and investment score for a property.
 *
 * Replaces client-side calls to lib/fairPrice, lib/fraudRisk, lib/investmentScore.
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface IntelligenceInput {
  price:         number;
  area_m2:       number;
  city:          string;
  property_kind: string;
  description?:  string;
  legal_status?: string;
  seller_id?:    string;
}

export interface IntelligenceResult {
  fair_price_estimate:  number;
  price_position_pct:   number;
  fraud_risk:           "low" | "medium" | "high";
  fraud_risk_score:     number;
  fraud_signals:        string[];
  investment_score:     number;
  investment_breakdown: {
    price_score:  number;
    growth_score: number;
    liquidity:    number;
    condition:    number;
  };
  market_median_m2:     number;
  comparables_count:    number;
}

export function useIntelligence() {
  const [result,  setResult]  = useState<IntelligenceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const compute = useCallback(async (input: IntelligenceInput) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await supabase.functions.invoke("intelligence", {
        body: input,
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
      });

      if (response.error) throw new Error(response.error.message);

      setResult(response.data as IntelligenceResult);
      return response.data as IntelligenceResult;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "intelligence_error";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { compute, result, loading, error };
}
