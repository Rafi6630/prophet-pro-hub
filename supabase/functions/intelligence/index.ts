/**
 * IraqProperty — Intelligence Edge Function
 *
 * Endpoint: POST /functions/v1/intelligence
 *
 * Computes:
 *   • fair_price_estimate  — Comparable Market Analysis
 *   • fraud_risk           — Multi-signal risk scoring
 *   • investment_score     — Weighted ROI estimation
 *   • price_position       — % deviation from market median
 *
 * All calculations happen server-side. Clients MUST call this endpoint
 * instead of running lib/fairPrice.ts, lib/fraudRisk.ts, lib/investmentScore.ts.
 *
 * Authentication: Bearer JWT (Supabase anon or user token)
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Types ────────────────────────────────────────────────────────────────────

interface IntelligenceRequest {
  property_id?: string;       // existing property — enriches with DB context
  // OR provide raw data for pre-submission scoring:
  price:        number;
  area_m2:      number;
  city:         string;
  property_kind: string;
  description?: string;
  legal_status?: string;
  seller_id?:   string;
}

interface IntelligenceResponse {
  fair_price_estimate: number;
  price_position_pct:  number;   // + = above market, - = below market
  fraud_risk:          "low" | "medium" | "high";
  fraud_risk_score:    number;   // 0-100 raw score
  fraud_signals:       string[]; // human-readable signal descriptions
  investment_score:    number;   // 0-100
  investment_breakdown: {
    price_score:   number;
    growth_score:  number;
    liquidity:     number;
    condition:     number;
  };
  market_median_m2:    number;
  comparables_count:   number;
}

// ── CORS headers ─────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

// ── Fair Price: Comparable Market Analysis ────────────────────────────────────

function computeFairPrice(
  areaMm2:    number,
  marketAvg:  number,
  pricePerM2: number
): number {
  // Base CMA value = area × market median
  const base = areaMm2 * marketAvg;

  // Demand pressure: if listing is below median, fair value is slightly above base
  const demandPressure = pricePerM2 < marketAvg
    ? 1 + (marketAvg - pricePerM2) / marketAvg * 0.05
    : 1.0;

  return Math.round(base * demandPressure);
}

// ── Fraud Risk: Multi-signal ──────────────────────────────────────────────────

interface FraudInput {
  description?:     string;
  legal_status?:    string;
  pricePerM2:       number;
  marketAvg:        number;
  sellerVerified:   boolean;
  hasDuplicate:     boolean;
}

function computeFraudRisk(input: FraudInput): {
  score: number;
  level: "low" | "medium" | "high";
  signals: string[];
} {
  let score = 0;
  const signals: string[] = [];

  // Signal 1: Thin description
  if (!input.description || input.description.length < 20) {
    score += 15;
    signals.push("Missing or very short property description");
  }

  // Signal 2: Unverified seller
  if (!input.sellerVerified) {
    score += 20;
    signals.push("Seller identity not verified");
  }

  // Signal 3: Price anomaly — too cheap
  if (input.marketAvg > 0 && input.pricePerM2 < input.marketAvg * 0.50) {
    score += 25;
    signals.push(`Price is ${Math.round((1 - input.pricePerM2 / input.marketAvg) * 100)}% below market median`);
  }

  // Signal 4: Price anomaly — unrealistic ask
  if (input.marketAvg > 0 && input.pricePerM2 > input.marketAvg * 3.00) {
    score += 20;
    signals.push(`Price is ${Math.round((input.pricePerM2 / input.marketAvg - 1) * 100)}% above market median`);
  }

  // Signal 5: No legal status
  if (!input.legal_status) {
    score += 15;
    signals.push("Legal ownership status not declared");
  }

  // Signal 6: Disputed legal status
  if (input.legal_status === "disputed") {
    score += 40;
    signals.push("Property has active legal dispute");
  }

  // Signal 7: Duplicate listing
  if (input.hasDuplicate) {
    score += 20;
    signals.push("Similar listing already active from this seller");
  }

  const level: "low" | "medium" | "high" =
    score >= 55 ? "high" : score >= 25 ? "medium" : "low";

  return { score: clamp(score, 0, 100), level, signals };
}

// ── Investment Score ──────────────────────────────────────────────────────────

function computeInvestmentScore(
  pricePerM2:  number,
  marketAvg:   number,
  cityGrowth:  number,   // 0-100
  liquidity:   number,   // 0-100
  condition:   number    // 0-100
): {
  total:     number;
  breakdown: { price_score: number; growth_score: number; liquidity: number; condition: number };
} {
  const priceAdv = clamp(
    ((marketAvg - pricePerM2) / (marketAvg || 1)) * 100,
    -20, 20
  ) + 20;

  const priceScore  = clamp((priceAdv / 40) * 100, 0, 100);
  const growthScore = clamp(cityGrowth,             0, 100);
  const liqScore    = clamp(liquidity,              0, 100);
  const condScore   = clamp(condition,              0, 100);

  const total = Math.round(
    priceScore  * 0.35 +
    growthScore * 0.25 +
    liqScore    * 0.20 +
    condScore   * 0.20
  );

  return {
    total: clamp(total, 0, 100),
    breakdown: {
      price_score:  round2(priceScore),
      growth_score: round2(growthScore),
      liquidity:    round2(liqScore),
      condition:    round2(condScore),
    },
  };
}

// ── Main handler ─────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  try {
    // ── Auth ───────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Validate JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 401, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // ── Parse input ────────────────────────────────────────────────────────
    const body: IntelligenceRequest = await req.json();

    const { price, area_m2, city, property_kind, description, legal_status } = body;

    // Validate required fields
    if (!price || !area_m2 || !city || !property_kind) {
      return new Response(JSON.stringify({ error: "missing_required_fields" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    if (price < 1000 || price > 100_000_000) {
      return new Response(JSON.stringify({ error: "price_out_of_range" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    if (area_m2 < 10 || area_m2 > 100_000) {
      return new Response(JSON.stringify({ error: "area_out_of_range" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // ── Market data ────────────────────────────────────────────────────────
    const { data: marketRow } = await supabase
      .from("market_prices")
      .select("median_price_m2, yoy_change_pct, sample_size")
      .eq("city", city)
      .eq("property_kind", property_kind)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const marketAvg    = marketRow?.median_price_m2  ?? 1200;
    const yoyChange    = marketRow?.yoy_change_pct    ?? 5;
    const comparables  = marketRow?.sample_size       ?? 0;

    const pricePerM2 = price / area_m2;

    // ── Seller verification check ──────────────────────────────────────────
    const sellerId = body.seller_id ?? user.id;
    const { data: verif } = await supabase
      .from("verification_requests")
      .select("status")
      .eq("user_id", sellerId)
      .eq("status", "approved")
      .limit(1)
      .maybeSingle();

    const sellerVerified = !!verif;

    // ── Duplicate detection ────────────────────────────────────────────────
    const { count: dupCount } = await supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("user_id", sellerId)
      .eq("city", city)
      .eq("property_kind", property_kind)
      .gte("area_m2", area_m2 * 0.9)
      .lte("area_m2", area_m2 * 1.1)
      .eq("status", "active");

    const hasDuplicate = (dupCount ?? 0) > 0;

    // ── Compute scores ─────────────────────────────────────────────────────
    const fairPrice = computeFairPrice(area_m2, marketAvg, pricePerM2);

    const fraud = computeFraudRisk({
      description,
      legal_status,
      pricePerM2,
      marketAvg,
      sellerVerified,
      hasDuplicate,
    });

    // City growth: use yoy_change_pct scaled to 0-100
    const cityGrowth = clamp((yoyChange / 20) * 100, 0, 100);

    const invest = computeInvestmentScore(
      pricePerM2,
      marketAvg,
      cityGrowth,
      50,  // liquidity default — future: derive from days-on-market stats
      50   // condition default — future: derive from description analysis
    );

    const pricePositionPct = marketAvg > 0
      ? round2(((pricePerM2 - marketAvg) / marketAvg) * 100)
      : 0;

    // ── Response ───────────────────────────────────────────────────────────
    const result: IntelligenceResponse = {
      fair_price_estimate:  fairPrice,
      price_position_pct:   pricePositionPct,
      fraud_risk:           fraud.level,
      fraud_risk_score:     fraud.score,
      fraud_signals:        fraud.signals,
      investment_score:     invest.total,
      investment_breakdown: invest.breakdown,
      market_median_m2:     marketAvg,
      comparables_count:    comparables,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[intelligence]", err);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
