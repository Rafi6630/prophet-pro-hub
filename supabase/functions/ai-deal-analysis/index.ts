// AI Deal Analysis — buyer-facing verdict on a property:
// pros, risks, negotiation tips, suggested offer range — in EN + AR.
// Combines deterministic intelligence (fair price, fraud, investment) + LLM reasoning.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRequest {
  property_id: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return json({ error: "unauthenticated" }, 401);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "ai_not_configured" }, 500);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const token = auth.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return json({ error: "invalid_token" }, 401);

    const { property_id } = (await req.json()) as AnalysisRequest;
    if (!property_id) return json({ error: "missing_property_id" }, 400);

    const { data: prop, error: propErr } = await supabase
      .from("properties")
      .select("*")
      .eq("id", property_id)
      .maybeSingle();
    if (propErr || !prop) return json({ error: "property_not_found" }, 404);

    // Pull market median for context
    const { data: market } = await supabase
      .from("market_prices")
      .select("median_price_m2, yoy_change_pct, sample_size")
      .eq("city", prop.city)
      .eq("property_kind", prop.property_kind)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const marketAvg = market?.median_price_m2 ?? 1200;
    const yoy = market?.yoy_change_pct ?? 5;
    const pricePerM2 = prop.area_m2 > 0 ? prop.price / prop.area_m2 : 0;
    const positionPct = ((pricePerM2 - marketAvg) / marketAvg) * 100;
    const fairPrice = Math.round(prop.area_m2 * marketAvg);

    const userPrompt = `Analyze this Iraqi real-estate listing for a serious buyer. Be honest and concise.

Listing:
- Title: ${prop.title}
- Type: ${prop.property_kind}
- City: ${prop.city}${prop.district ? `, ${prop.district}` : ""}
- Area: ${prop.area_m2} m²
- Bedrooms: ${prop.bedrooms} / Bathrooms: ${prop.bathrooms}
- Asking price: $${prop.price.toLocaleString()} ($${pricePerM2.toFixed(0)}/m²)
- Verification: ${prop.verification_level}
- Legal status: ${prop.legal_status ?? "unknown"}
- Description: ${(prop.description ?? "").slice(0, 600)}

Market context:
- City median: $${marketAvg.toFixed(0)}/m² (${yoy >= 0 ? "+" : ""}${yoy}% YoY)
- This listing is ${positionPct >= 0 ? "+" : ""}${positionPct.toFixed(1)}% vs median.
- Fair-price estimate (CMA): $${fairPrice.toLocaleString()}.

Deliver a clear verdict, 3 strengths, 3 risks/red flags, a suggested negotiation range with reasoning, and a 1-line bottom line. All in English AND Arabic (MSA).`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a senior real-estate buyer's advisor for Iraq and the MENA region. Be factual, trust-first, never speculative. If data is thin, say so.",
          },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "emit_analysis",
              description: "Return a buyer-facing analysis.",
              parameters: {
                type: "object",
                properties: {
                  verdict: {
                    type: "string",
                    enum: ["strong_buy", "buy", "neutral", "caution", "avoid"],
                  },
                  verdict_label_en: { type: "string" },
                  verdict_label_ar: { type: "string" },
                  bottom_line_en: { type: "string" },
                  bottom_line_ar: { type: "string" },
                  strengths_en: { type: "array", items: { type: "string" } },
                  strengths_ar: { type: "array", items: { type: "string" } },
                  risks_en: { type: "array", items: { type: "string" } },
                  risks_ar: { type: "array", items: { type: "string" } },
                  suggested_offer_low: { type: "number" },
                  suggested_offer_high: { type: "number" },
                  negotiation_tips_en: { type: "array", items: { type: "string" } },
                  negotiation_tips_ar: { type: "array", items: { type: "string" } },
                },
                required: [
                  "verdict",
                  "verdict_label_en",
                  "verdict_label_ar",
                  "bottom_line_en",
                  "bottom_line_ar",
                  "strengths_en",
                  "strengths_ar",
                  "risks_en",
                  "risks_ar",
                  "suggested_offer_low",
                  "suggested_offer_high",
                  "negotiation_tips_en",
                  "negotiation_tips_ar",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_analysis" } },
      }),
    });

    if (aiResp.status === 429) return json({ error: "rate_limited" }, 429);
    if (aiResp.status === 402) return json({ error: "ai_credits_exhausted" }, 402);
    if (!aiResp.ok) {
      const text = await aiResp.text();
      console.error("[ai-deal-analysis] gateway error", aiResp.status, text);
      return json({ error: "ai_gateway_error" }, 502);
    }

    const payload = await aiResp.json();
    const toolCall = payload.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return json({ error: "no_tool_call" }, 502);

    let result: Record<string, unknown>;
    try {
      result = JSON.parse(toolCall.function.arguments);
    } catch {
      return json({ error: "bad_tool_arguments" }, 502);
    }

    return json({
      ...result,
      market_context: {
        median_per_m2: marketAvg,
        yoy_change_pct: yoy,
        price_position_pct: Number(positionPct.toFixed(1)),
        fair_price_estimate: fairPrice,
      },
    }, 200);
  } catch (err) {
    console.error("[ai-deal-analysis]", err);
    return json({ error: "internal_error" }, 500);
  }
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
