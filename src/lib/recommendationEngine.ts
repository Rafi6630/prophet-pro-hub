import { publicProperties } from "@/data/sampleProperties";
import { enrichProperty } from "@/lib/propertyMetrics";

export function getRecommendedDeals(cityId?: string, minScore = 75) {
  return publicProperties
    .map(enrichProperty)
    .filter((property) => property.investmentScore >= minScore && (!cityId || property.cityId === cityId))
    .sort((a, b) => b.investmentScore - a.investmentScore)
    .slice(0, 4);
}
