import { cityById, publicProperties, sampleProperties, type SampleProperty, type PropertyVisibility, type OwnershipReviewStatus } from "@/data/sampleProperties";
import type { PropertyKind, PropertyWithMedia } from "@/lib/property";

type ReviewOverride = {
  visibility?: PropertyVisibility;
  approved?: boolean;
  ownershipStatus?: OwnershipReviewStatus;
  sellerVerified?: boolean;
  sellerVerification?: SampleProperty["seller"]["verification"];
  hasMissingDocuments?: boolean;
  hasLegalIssues?: boolean;
  suspiciouslyLowPrice?: boolean;
  extraReports?: SampleProperty["reports"];
};

const REVIEW_KEY = "iraqproperty_seeded_review_overrides";

const KIND_MAP: Record<string, PropertyKind> = {
  house: "house",
  apartment: "apartment",
  villa: "villa",
  land: "land",
  commercial: "commercial",
  "commercial-shop": "shop",
  shop: "shop",
  office: "office",
  farm: "land",
  building: "commercial",
};

function readOverrides(): Record<string, ReviewOverride> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(REVIEW_KEY);
  return raw ? (JSON.parse(raw) as Record<string, ReviewOverride>) : {};
}

function writeOverrides(next: Record<string, ReviewOverride>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REVIEW_KEY, JSON.stringify(next));
}

export function updateSeededReviewOverride(propertyId: string, patch: ReviewOverride) {
  const next = {
    ...readOverrides(),
    [propertyId]: {
      ...(readOverrides()[propertyId] ?? {}),
      ...patch,
    },
  };
  writeOverrides(next);
  return next[propertyId];
}

export function getSeededSampleProperties() {
  const overrides = readOverrides();
  return sampleProperties.map((property) => {
    const override = overrides[property.id];
    if (!override) return property;
    return {
      ...property,
      visibility: override.visibility ?? property.visibility,
      approved: override.approved ?? property.approved,
      ownershipStatus: override.ownershipStatus ?? property.ownershipStatus,
      hasMissingDocuments: override.hasMissingDocuments ?? property.hasMissingDocuments,
      hasLegalIssues: override.hasLegalIssues ?? property.hasLegalIssues,
      suspiciouslyLowPrice: override.suspiciouslyLowPrice ?? property.suspiciouslyLowPrice,
      reports: override.extraReports ?? property.reports,
      seller: {
        ...property.seller,
        verified: override.sellerVerified ?? property.seller.verified,
        verification: override.sellerVerification ?? property.seller.verification,
      },
    };
  });
}

function toPropertyKind(kind: string): PropertyKind {
  return KIND_MAP[kind] ?? "house";
}

function verificationLevel(property: SampleProperty): PropertyWithMedia["verification_level"] {
  if (!property.seller.verified) return property.ownershipStatus === "pending" ? "pending" : "unverified";
  return property.seller.verification === "agency" ? "premium" : "verified";
}

function riskLevel(property: SampleProperty): PropertyWithMedia["fraud_risk"] {
  if (property.hasLegalIssues || property.hasMissingDocuments || property.suspiciouslyLowPrice) return "high";
  if (property.ownershipStatus === "pending") return "medium";
  return "low";
}

export function samplePropertyToDbProperty(property: SampleProperty): PropertyWithMedia {
  return {
    id: property.id,
    address: property.address,
    area_growth_pct: property.locationGrowth / 10,
    area_m2: property.sizeSqm,
    bathrooms: property.bathrooms,
    bedrooms: property.bedrooms,
    city: cityById[property.cityId]?.nameEn ?? property.cityId,
    created_at: property.listedAt,
    currency: "USD",
    description: property.description,
    description_ar: property.titleAr ? `${property.titleAr} - ${property.description}` : property.description,
    district: property.area,
    electricity_score: Math.max(2, Math.min(5, Math.round(property.areaDemand / 20))),
    fair_price_estimate: Math.round(property.marketAverage * property.sizeSqm),
    featured: property.featured,
    features: property.highlights,
    fraud_risk: riskLevel(property),
    hospitals_score: Math.max(2, Math.min(5, Math.round((property.areaDemand + 6) / 20))),
    income_potential: property.liquidity >= 80 ? "Strong" : property.liquidity >= 65 ? "Balanced" : "Selective",
    investment_deal: property.locationGrowth >= 85 || property.pricePerSqm < property.marketAverage,
    investment_score: Math.max(
      50,
      Math.min(
        99,
        Math.round(property.locationGrowth * 0.35 + property.liquidity * 0.35 + property.conditionScore * 0.3),
      ),
    ),
    latitude: property.lat,
    legal_status: property.hasLegalIssues ? "disputed" : property.hasMissingDocuments ? "pending" : "clear",
    longitude: property.lng,
    ownership_reviewed: property.ownershipStatus === "verified",
    price: property.priceUsd,
    price_iqd: null,
    property_kind: toPropertyKind(property.propertyTypeId),
    roads_score: Math.max(2, Math.min(5, Math.round((property.locationGrowth + property.liquidity) / 40))),
    safety_score: property.seller.verified ? 4 : 3,
    schools_score: Math.max(2, Math.min(5, Math.round(property.areaDemand / 18))),
    status: property.approved ? "active" : "draft",
    title: property.title,
    title_ar: property.titleAr,
    updated_at: property.listedAt,
    user_id: property.seller.id,
    verification_level: verificationLevel(property),
    views: Math.round(property.locationGrowth * 14 + property.liquidity * 9),
    water_score: Math.max(2, Math.min(5, Math.round((property.conditionScore + property.areaDemand) / 40))),
    property_images: [property.image, ...property.gallery].map((url, index) => ({
      created_at: property.listedAt,
      id: `${property.id}-img-${index}`,
      is_video: false,
      property_id: property.id,
      sort_order: index,
      url,
    })),
    seller: {
      user_id: property.seller.id,
      display_name: property.seller.name,
      avatar_url: null,
      phone: property.seller.phone,
      whatsapp: property.seller.whatsapp,
    },
  };
}

export function getSeededProperties() {
  return getSeededSampleProperties().map(samplePropertyToDbProperty);
}

export function getSeededPublicProperties() {
  return getSeededSampleProperties()
    .filter((property) => property.visibility === "public" && property.approved)
    .map(samplePropertyToDbProperty);
}

export function seededPropertyById(id: string) {
  return getSeededProperties().find((property) => property.id === id);
}

export function featuredSeededProperties(limit = 6) {
  return getSeededPublicProperties().filter((property) => property.featured).slice(0, limit);
}

export function investmentSeededProperties(limit = 6) {
  return getSeededPublicProperties()
    .filter((property) => property.investment_deal || (property.investment_score ?? 0) >= 75)
    .slice(0, limit);
}

export function getSeededModerationInventory() {
  return getSeededSampleProperties();
}

export const defaultPublicSeededProperties = publicProperties;
