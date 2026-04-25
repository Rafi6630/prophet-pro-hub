import type { EnrichedProperty } from "@/lib/propertyMetrics";

export type PropertySort =
  | "newest"
  | "lowest-price"
  | "highest-price"
  | "best-investment"
  | "verified-first";

export interface PropertySearchFilters {
  cityId?: string;
  district?: string;
  priceMin?: number;
  priceMax?: number;
  sizeMin?: number;
  sizeMax?: number;
  propertyTypeId?: string;
  bedrooms?: number;
  verifiedOnly?: boolean;
  investmentScoreMin?: number;
  mapBounds?: "all" | "north" | "central" | "south";
}

export function filterProperties(
  properties: EnrichedProperty[],
  filters: PropertySearchFilters
) {
  return properties.filter((property) => {
    const inCity = !filters.cityId || filters.cityId === "all" || property.cityId === filters.cityId;
    const inDistrict = !filters.district || property.area.toLowerCase().includes(filters.district.toLowerCase());
    const inPriceMin = !filters.priceMin || property.priceUsd >= filters.priceMin;
    const inPriceMax = !filters.priceMax || property.priceUsd <= filters.priceMax;
    const inSizeMin = !filters.sizeMin || property.sizeSqm >= filters.sizeMin;
    const inSizeMax = !filters.sizeMax || property.sizeSqm <= filters.sizeMax;
    const inType = !filters.propertyTypeId || filters.propertyTypeId === "all" || property.propertyTypeId === filters.propertyTypeId;
    const inBedrooms = !filters.bedrooms || property.bedrooms >= filters.bedrooms;
    const isVerified = !filters.verifiedOnly || property.seller.verified;
    const inScore = !filters.investmentScoreMin || property.investmentScore >= filters.investmentScoreMin;
    const inBounds =
      !filters.mapBounds ||
      filters.mapBounds === "all" ||
      (filters.mapBounds === "north" && property.lat >= 35.4) ||
      (filters.mapBounds === "central" && property.lat >= 32.5 && property.lat < 35.4) ||
      (filters.mapBounds === "south" && property.lat < 32.5);

    return (
      inCity &&
      inDistrict &&
      inPriceMin &&
      inPriceMax &&
      inSizeMin &&
      inSizeMax &&
      inType &&
      inBedrooms &&
      isVerified &&
      inScore &&
      inBounds
    );
  });
}

export function sortProperties(properties: EnrichedProperty[], sort: PropertySort) {
  const next = [...properties];
  switch (sort) {
    case "lowest-price":
      return next.sort((a, b) => a.priceUsd - b.priceUsd);
    case "highest-price":
      return next.sort((a, b) => b.priceUsd - a.priceUsd);
    case "best-investment":
      return next.sort((a, b) => b.investmentScore - a.investmentScore);
    case "verified-first":
      return next.sort((a, b) => Number(b.seller.verified) - Number(a.seller.verified));
    case "newest":
    default:
      return next.sort((a, b) => Date.parse(b.listedAt) - Date.parse(a.listedAt));
  }
}
