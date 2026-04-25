import { supabase } from "@/integrations/supabase/client";
import type { AIAnalysis, AIDecision, AIConfidence } from "@/core/types/deal";
import type { Property } from "@/core/types/property";
import { scoreDeal } from "./dealDiscovery";
import { calculateInvestmentPrediction } from "./investmentEngine";

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreToDecision(score: number): AIDecision {
  if (score >= 72) return "BUY";
  if (score >= 48) return "HOLD";
  return "REJECT";
}

function scoreToConfidence(score: number, verified: boolean): AIConfidence {
  if (score >= 80 && verified) return "high";
  if (score >= 55)             return "medium";
  return "low";
}

// ── Local analysis — instant, no network ──────────────────────────────────────

export function analyzePropertyLocally(property: Property): AIAnalysis {
  const dealResult = scoreDeal({
    id:           property.id,
    title:        property.title,
    price:        property.price,
    aiValuation:  property.aiValuation ?? property.price,
    area:         property.area,
    city:         property.city,
    district:     property.district ?? property.city,
    propertyType: property.propertyType,
    bedrooms:     property.bedrooms,
    verified:     property.verified,
    terraScore:   property.terraScore,
  });

  const prediction = calculateInvestmentPrediction({
    price:        property.price,
    aiValuation:  property.aiValuation ?? property.price,
    area:         property.area,
    city:         property.city,
    district:     property.district ?? property.city,
    propertyType: property.propertyType,
    verified:     property.verified,
  });

  const score    = Math.round(dealResult.dealScore * 0.6 + prediction.score * 0.4);
  const decision = scoreToDecision(score);
  const conf     = scoreToConfidence(score, property.verified);

  const suggestedPrice  = property.aiValuation ?? Math.round(property.price * 1.08);
  const expectedProfit  = Math.round(property.price * (dealResult.expectedROI / 100));

  const reasons: string[] = [
    dealResult.dealThesis,
    ...dealResult.signals.slice(0, 2).map(s => s.description),
    prediction.thesis,
  ].filter(Boolean).slice(0, 5);

  return {
    score,
    confidence:       conf,
    decision,
    reasons,
    risks:            [...dealResult.riskFlags, ...prediction.risks].slice(0, 4),
    suggested_price:  suggestedPrice,
    expected_profit:  expectedProfit,
    expected_roi_pct: dealResult.expectedROI,
    rental_yield:     dealResult.rentalYield,
    deal_thesis:      dealResult.dealThesis,
    swot: {
      strengths:     prediction.catalysts,
      weaknesses:    dealResult.riskFlags.slice(0, 2),
      opportunities: [
        `${dealResult.discountToMarket.toFixed(1)}% below AI valuation`,
        ...prediction.catalysts.slice(0, 1),
      ],
      threats: prediction.risks,
    },
    generated_at:  new Date().toISOString(),
    model_version: "terra-v2-local",
  };
}

// ── Edge function analysis — full LLM pass with cache ────────────────────────

export async function analyzePropertyWithAI(property: Property): Promise<AIAnalysis> {
  // 1. Check cache
  const { data: cached } = await supabase
    .from("ai_analysis_cache")
    .select("analysis, expires_at")
    .eq("property_id", property.id)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (cached?.analysis) {
    return cached.analysis as AIAnalysis;
  }

  // 2. Try edge function
  try {
    const { data, error } = await supabase.functions.invoke("ai-property-analysis", {
      body: { propertyId: property.id, property },
    });

    if (error) throw error;

    const analysis: AIAnalysis = {
      score:            data.investmentScore ?? data.score ?? 50,
      confidence:       (data.confidence ?? "medium") as AIConfidence,
      decision:         scoreToDecision(data.investmentScore ?? data.score ?? 50),
      reasons:          data.reasons ?? data.swot?.strengths ?? [],
      risks:            data.risks ?? data.swot?.threats ?? [],
      suggested_price:  data.suggestedPrice ?? data.financials?.fairValue ?? property.price,
      expected_profit:  data.expectedProfit ?? 0,
      expected_roi_pct: data.expectedROI ?? 0,
      rental_yield:     data.rentalYield ?? 0,
      deal_thesis:      data.thesis ?? data.dealThesis ?? "",
      swot:             data.swot,
      generated_at:     new Date().toISOString(),
      model_version:    "terra-v2-edge",
    };

    // Cache for 7 days
    await supabase.from("ai_analysis_cache").upsert({
      property_id:   property.id,
      analysis:      analysis as never,
      model_version: analysis.model_version,
    });

    return analysis;
  } catch {
    // Always return something — never block the UI
    return analyzePropertyLocally(property);
  }
}
