import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { requireUser } from "../_shared/auth.ts";
import { consumeUsage, createAdminClient } from "../_shared/usage.ts";

type CreateOfferBody = {
  property_id: string;
  seller_id?: string | null;
  offer_price: number;
  currency?: string;
  asking_price?: number | null;
  offer_type?: string;
  financing_type?: string;
  closing_timeline_days?: number;
  deposit_percent?: number | null;
  message?: string | null;
  // client hint: if user selected a proof-of-funds file (the upload is done client-side)
  wants_proof_upload?: boolean;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { token, userId } = await requireUser(req);
    const body = (await req.json()) as CreateOfferBody;

    if (!body?.property_id) throw new Error("property_id is required");
    if (!body?.offer_price || body.offer_price <= 0) throw new Error("offer_price must be > 0");

    // 1) Enforce monthly offer creation limits (server-side)
    const usage = await consumeUsage(token, "offer_create", 1);

    // 2) Enforce elite-only features
    const isElite = usage.plan === "elite";
    if ((body.deposit_percent ?? null) !== null && !isElite) {
      throw new Error("Deposit commitment is an Elite feature. Upgrade to Elite to use it.");
    }
    if (body.wants_proof_upload && !isElite) {
      throw new Error("Proof of funds upload is an Elite feature. Upgrade to Elite to use it.");
    }

    const admin = createAdminClient();

    const insertPayload: any = {
      property_id: body.property_id,
      buyer_id: userId,
      seller_id: body.seller_id ?? null,
      offer_price: body.offer_price,
      currency: body.currency ?? "USD",
      asking_price: body.asking_price ?? null,
      offer_type: body.offer_type ?? "BUY",
      financing_type: body.financing_type ?? "CASH",
      closing_timeline_days: body.closing_timeline_days ?? 30,
      deposit_percent: body.deposit_percent ?? null,
      message: body.message ?? null,
      // proof_uploaded will be flipped to true after upload + offer_documents insert
      proof_uploaded: false,
    };

    const { data, error } = await admin
      .from("offers")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    return new Response(JSON.stringify({ offer: data, usage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
