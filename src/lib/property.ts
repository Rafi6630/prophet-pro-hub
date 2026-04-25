import type { Database } from "@/integrations/supabase/types";

export type PropertyKind = Database["public"]["Enums"]["property_kind"];
export type ListingStatus = Database["public"]["Enums"]["listing_status"];
export type VerificationLevel = Database["public"]["Enums"]["verification_level"];
export type RiskLevel = Database["public"]["Enums"]["risk_level"];
export type OfferStatus = Database["public"]["Enums"]["offer_status"];
export type AppRole = Database["public"]["Enums"]["app_role"];

export type DbProperty = Database["public"]["Tables"]["properties"]["Row"];
export type DbPropertyImage = Database["public"]["Tables"]["property_images"]["Row"];
export type DbProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type DbCity = Database["public"]["Tables"]["cities"]["Row"];
export type DbFavorite = Database["public"]["Tables"]["favorites"]["Row"];
export type DbOffer = Database["public"]["Tables"]["offers"]["Row"];
export type DbMessage = Database["public"]["Tables"]["messages"]["Row"];
export type DbAlert = Database["public"]["Tables"]["alerts"]["Row"];
export type DbInspection = Database["public"]["Tables"]["inspection_requests"]["Row"];
export type DbVerification = Database["public"]["Tables"]["verification_requests"]["Row"];
export type DbMarketPrice = Database["public"]["Tables"]["market_prices"]["Row"];

export type PropertyWithMedia = DbProperty & {
  property_images: DbPropertyImage[] | null;
  seller?: Pick<DbProfile, "display_name" | "avatar_url" | "phone" | "whatsapp" | "user_id"> | null;
};

// ── Computed fallbacks for trust/investment/area ──────────────────────────
const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80";

export function propertyImage(p: PropertyWithMedia, idx = 0): string {
  const imgs = p.property_images ?? [];
  return imgs[idx]?.url ?? PLACEHOLDER_IMG;
}

export function pricePerM2(p: Pick<DbProperty, "price" | "area_m2">): number {
  if (!p.area_m2) return 0;
  return Math.round(p.price / p.area_m2);
}

export function fairPrice(p: DbProperty): number {
  if (p.fair_price_estimate && p.fair_price_estimate > 0) return Number(p.fair_price_estimate);
  // Compute fallback: 5% above price as a baseline so most look fair
  return Math.round(p.price * 1.05);
}

export function discountToFair(p: DbProperty): number {
  const fp = fairPrice(p);
  if (!fp) return 0;
  return ((fp - p.price) / fp) * 100;
}

export function priceVerdict(p: DbProperty): "under" | "over" | "fair" {
  const d = discountToFair(p);
  if (d >= 4) return "under";
  if (d <= -4) return "over";
  return "fair";
}

export function investmentScore(p: DbProperty): number {
  if (typeof p.investment_score === "number") return p.investment_score;
  // Compute: blend of discount (0-50pts), verification (0-30), area scores (0-20)
  const disc = Math.max(0, Math.min(50, discountToFair(p) * 4));
  const vBoost =
    p.verification_level === "premium" ? 30 :
    p.verification_level === "verified" ? 22 :
    p.verification_level === "pending" ? 10 : 4;
  const areaAvg = avgArea(p);
  const aBoost = Math.round((areaAvg / 5) * 20);
  return Math.max(0, Math.min(100, Math.round(disc + vBoost + aBoost)));
}

export function avgArea(p: DbProperty): number {
  const vals = [
    p.schools_score, p.hospitals_score, p.roads_score,
    p.electricity_score, p.water_score, p.safety_score,
  ].filter((v): v is number => typeof v === "number");
  if (!vals.length) return 3.5; // sensible default
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function fraudRisk(p: DbProperty): RiskLevel {
  if (p.fraud_risk) return p.fraud_risk;
  if (p.verification_level === "premium" || p.verification_level === "verified") return "low";
  if (p.verification_level === "pending") return "medium";
  return "high";
}

export function legalStatus(p: DbProperty): string {
  return p.legal_status ?? (p.ownership_reviewed ? "clear" : "pending");
}

export function areaGrowthPct(p: DbProperty): number {
  return typeof p.area_growth_pct === "number" ? Number(p.area_growth_pct) : 6.5;
}

export function areaScore(p: DbProperty, key: keyof Pick<DbProperty,
  "schools_score" | "hospitals_score" | "roads_score" | "electricity_score" | "water_score" | "safety_score"
>): number {
  return typeof p[key] === "number" ? (p[key] as number) : 3;
}

export function formatPrice(price: number, currency = "USD"): string {
  if (price >= 1_000_000) return `${currency === "USD" ? "$" : ""}${(price / 1_000_000).toFixed(2)}M`;
  if (price >= 1_000) return `${currency === "USD" ? "$" : ""}${(price / 1_000).toFixed(0)}K`;
  return `${currency === "USD" ? "$" : ""}${price.toLocaleString()}`;
}
