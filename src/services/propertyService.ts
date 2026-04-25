import { supabase } from "@/integrations/supabase/client";
import type { DbProperty, DbPropertyImage } from "@/types/database";
import type { Property, PropertyImage } from "@/core/types/property";

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapImage(raw: DbPropertyImage): PropertyImage {
  return { id: raw.id, url: raw.url, sortOrder: raw.sort_order };
}

export function mapProperty(raw: DbProperty): Property {
  return {
    id:           raw.id,
    userId:       raw.user_id,
    title:        raw.title,
    titleAr:      raw.title_ar,
    description:  raw.description,
    price:        raw.price,
    currency:     raw.currency,
    type:         raw.type as Property["type"],
    propertyType: raw.property_type,
    city:         raw.city,
    district:     raw.district,
    bedrooms:     raw.bedrooms,
    bathrooms:    raw.bathrooms,
    area:         raw.area,
    latitude:     raw.latitude,
    longitude:    raw.longitude,
    terraScore:   raw.terra_score,
    aiValuation:  raw.ai_valuation,
    verified:     raw.verified,
    agentName:    raw.agent_name,
    features:     raw.features ?? [],
    status:       raw.status,
    views:        raw.views,
    images:       (raw.property_images ?? []).map(mapImage),
    createdAt:    raw.created_at,
    updatedAt:    raw.updated_at,
  };
}

// ── Query helpers ──────────────────────────────────────────────────────────────

export interface PropertyFilters {
  city?:     string;
  type?:     string;
  minPrice?: number;
  maxPrice?: number;
  limit?:    number;
}

export async function fetchProperties(filters?: PropertyFilters): Promise<Property[]> {
  let query = supabase
    .from("properties")
    .select("*, property_images(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(filters?.limit ?? 50);

  if (filters?.city)     query = query.eq("city", filters.city);
  if (filters?.type)     query = query.eq("type", filters.type);
  if (filters?.minPrice) query = query.gte("price", filters.minPrice);
  if (filters?.maxPrice) query = query.lte("price", filters.maxPrice);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(row => mapProperty(row as unknown as DbProperty));
}

export async function fetchPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return mapProperty(data as unknown as DbProperty);
}

export async function fetchUserProperties(userId: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(row => mapProperty(row as unknown as DbProperty));
}
