/**
 * useDealAnalysis — calls /functions/v1/ai-deal-analysis to get
 * a buyer-facing AI verdict for a property.
 */

import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type DealVerdict = "strong_buy" | "buy" | "neutral" | "caution" | "avoid";

export interface DealAnalysisResult {
  verdict: DealVerdict;
  verdict_label_en: string;
  verdict_label_ar: string;
  bottom_line_en: string;
  bottom_line_ar: string;
  strengths_en: string[];
  strengths_ar: string[];
  risks_en: string[];
  risks_ar: string[];
  suggested_offer_low: number;
  suggested_offer_high: number;
  negotiation_tips_en: string[];
  negotiation_tips_ar: string[];
  market_context: {
    median_per_m2: number;
    yoy_change_pct: number;
    price_position_pct: number;
    fair_price_estimate: number;
  };
}

export function useDealAnalysis() {
  const [result, setResult] = useState<DealAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (propertyId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("auth_required");
        return null;
      }
      const response = await supabase.functions.invoke("ai-deal-analysis", {
        body: { property_id: propertyId },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (response.error) throw new Error(response.error.message);
      const data = response.data as DealAnalysisResult;
      setResult(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "analysis_error";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyze, result, loading, error, reset: () => setResult(null) };
}
