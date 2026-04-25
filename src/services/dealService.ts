import { supabase } from "@/integrations/supabase/client";
import { scoreDeal } from "./dealDiscovery";
import { mapProperty } from "./propertyService";
import type { Deal, DealAction, DealFilters, DealStatus, AIAnalysis } from "@/core/types/deal";
import type { Property } from "@/core/types/property";
import type { DbProperty } from "@/types/database";

// ── Row mapper ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDeal(raw: Record<string, any>, property?: Property): Deal {
  return {
    id:                 raw.id as string,
    property_id:        raw.property_id as string,
    user_id:            raw.user_id as string,
    status:             raw.status as DealStatus,
    deal_score:         raw.deal_score as number,
    deal_grade:         raw.deal_grade as Deal["deal_grade"],
    primary_deal_type:  raw.primary_deal_type as string,
    risk_level:         raw.risk_level as Deal["risk_level"],
    expected_roi:       raw.expected_roi as number,
    discount_to_market: raw.discount_to_market as number,
    ai_analysis:        (raw.ai_analysis as AIAnalysis) ?? null,
    notes:              (raw.notes as string) ?? null,
    created_at:         raw.created_at as string,
    updated_at:         raw.updated_at as string,
    viewed_at:          (raw.viewed_at as string) ?? null,
    contacted_at:       (raw.contacted_at as string) ?? null,
    property,
  };
}

// ── Create or retrieve deal for a property ────────────────────────────────────

export async function createDeal(property: Property): Promise<Deal> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const scored = scoreDeal({
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

  const { data, error } = await supabase
    .from("deals")
    .upsert(
      {
        property_id:        property.id,
        user_id:            user.id,
        status:             "NEW",
        deal_score:         scored.dealScore,
        deal_grade:         scored.dealGrade,
        primary_deal_type:  scored.primaryDealType,
        risk_level:         scored.riskLevel,
        expected_roi:       scored.expectedROI,
        discount_to_market: scored.discountToMarket,
      },
      { onConflict: "property_id,user_id" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapDeal(data, property);
}

// ── Fetch user's deals ────────────────────────────────────────────────────────

export async function fetchDeals(filters?: DealFilters): Promise<Deal[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from("deals")
    .select("*, properties(*, property_images(*))")
    .eq("user_id", user.id)
    .order("deal_score", { ascending: false });

  if (filters?.status?.length) {
    query = query.in("status", filters.status);
  }
  if (filters?.minScore !== undefined) {
    query = query.gte("deal_score", filters.minScore);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map(row => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prop = (row as any).properties
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? mapProperty((row as any).properties as DbProperty)
      : undefined;
    return mapDeal(row as Record<string, unknown>, prop);
  });
}

// ── Fetch single deal ─────────────────────────────────────────────────────────

export async function fetchDealById(dealId: string): Promise<Deal | null> {
  const { data, error } = await supabase
    .from("deals")
    .select("*, properties(*, property_images(*)), deal_actions(*)")
    .eq("id", dealId)
    .single();

  if (error) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;
  const prop = row.properties ? mapProperty(row.properties as DbProperty) : undefined;
  const deal = mapDeal(row, prop);
  deal.actions = (row.deal_actions ?? []) as DealAction[];
  return deal;
}

// ── Advance deal status ───────────────────────────────────────────────────────

export async function advanceDealStatus(
  dealId:   string,
  toStatus: DealStatus,
  note?:    string,
): Promise<Deal> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Read current status for the action log
  const { data: current } = await supabase
    .from("deals")
    .select("status")
    .eq("id", dealId)
    .single();

  // Build update patch
  const patch: Record<string, unknown> = { status: toStatus };
  if (toStatus === "VIEWED")    patch.viewed_at    = new Date().toISOString();
  if (toStatus === "CONTACTED") patch.contacted_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("deals")
    .update(patch)
    .eq("id", dealId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Log the transition
  await supabase.from("deal_actions").insert({
    deal_id:     dealId,
    user_id:     user.id,
    from_status: current?.status ?? null,
    to_status:   toStatus,
    note:        note ?? null,
  });

  return mapDeal(data as Record<string, unknown>);
}

// ── Persist AI analysis onto the deal row ─────────────────────────────────────

export async function saveDealAIAnalysis(
  dealId:   string,
  analysis: AIAnalysis,
): Promise<void> {
  const { error } = await supabase
    .from("deals")
    .update({ ai_analysis: analysis as never })
    .eq("id", dealId);

  if (error) throw new Error(error.message);
}

// ── Update user notes ─────────────────────────────────────────────────────────

export async function updateDealNotes(dealId: string, notes: string): Promise<void> {
  const { error } = await supabase
    .from("deals")
    .update({ notes })
    .eq("id", dealId);

  if (error) throw new Error(error.message);
}
