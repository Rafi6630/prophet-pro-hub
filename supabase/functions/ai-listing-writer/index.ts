// AI Listing Writer — generates bilingual (EN/AR) title + description
// from raw seller inputs using Lovable AI gateway (tool-calling for structured output).

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WriterInput {
  property_kind: string;
  city: string;
  district?: string;
  area_m2: number;
  bedrooms?: number;
  bathrooms?: number;
  price: number;
  features?: string[];
  notes?: string;
  audience?: "buyer" | "investor" | "family";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return json({ error: "unauthenticated" }, 401);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "ai_not_configured" }, 500);

    const body = (await req.json()) as WriterInput;
    if (!body.property_kind || !body.city || !body.area_m2 || !body.price) {
      return json({ error: "missing_required_fields" }, 400);
    }

    const userPrompt = `Generate a high-converting bilingual (English + Arabic) real-estate listing for an Iraqi property.

Inputs:
- Property type: ${body.property_kind}
- City: ${body.city}${body.district ? ` (district: ${body.district})` : ""}
- Area: ${body.area_m2} m²
- Bedrooms: ${body.bedrooms ?? "n/a"}
- Bathrooms: ${body.bathrooms ?? "n/a"}
- Asking price: $${body.price.toLocaleString()} USD
- Features: ${(body.features ?? []).join(", ") || "none specified"}
- Seller notes: ${body.notes ?? "none"}
- Target audience: ${body.audience ?? "buyer"}

Rules:
- Title: max 80 chars, no emojis, no all-caps.
- Description: 90–160 words, factual, trust-first tone, mention city + key amenities.
- Arabic must be natural Modern Standard Arabic (MSA) suitable for Iraqi readers, no transliteration.
- 5 short bullet highlights in EN and AR.
- 3 SEO keywords in EN and AR.
- Never invent features that weren't provided.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "You are a senior MENA real-estate copywriter. You write trust-first, factual, bilingual listings. You never exaggerate.",
          },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "emit_listing",
              description: "Return a structured bilingual property listing.",
              parameters: {
                type: "object",
                properties: {
                  title_en: { type: "string" },
                  title_ar: { type: "string" },
                  description_en: { type: "string" },
                  description_ar: { type: "string" },
                  highlights_en: { type: "array", items: { type: "string" } },
                  highlights_ar: { type: "array", items: { type: "string" } },
                  seo_keywords_en: { type: "array", items: { type: "string" } },
                  seo_keywords_ar: { type: "array", items: { type: "string" } },
                },
                required: [
                  "title_en",
                  "title_ar",
                  "description_en",
                  "description_ar",
                  "highlights_en",
                  "highlights_ar",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_listing" } },
      }),
    });

    if (response.status === 429) return json({ error: "rate_limited" }, 429);
    if (response.status === 402) return json({ error: "ai_credits_exhausted" }, 402);
    if (!response.ok) {
      const text = await response.text();
      console.error("[ai-listing-writer] gateway error", response.status, text);
      return json({ error: "ai_gateway_error" }, 502);
    }

    const payload = await response.json();
    const toolCall = payload.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return json({ error: "no_tool_call" }, 502);

    let result: Record<string, unknown>;
    try {
      result = JSON.parse(toolCall.function.arguments);
    } catch {
      return json({ error: "bad_tool_arguments" }, 502);
    }

    return json(result, 200);
  } catch (err) {
    console.error("[ai-listing-writer]", err);
    return json({ error: "internal_error" }, 500);
  }
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
