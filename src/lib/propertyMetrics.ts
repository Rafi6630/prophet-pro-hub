import { cityById, propertyTypeById, type SampleProperty } from "@/data/sampleProperties";
import { estimateFairPrice } from "@/lib/fairPrice";
import { calculateInvestmentScore } from "@/lib/investmentScore";
import { calculateRiskScore } from "@/lib/riskScore";

export function getPropertyFairPrice(property: SampleProperty) {
  return estimateFairPrice({
    size: property.sizeSqm,
    marketAverage: property.marketAverage,
    condition: property.condition,
    areaDemand: property.areaDemand,
  });
}

export function getPropertyInvestmentScore(property: SampleProperty) {
  return calculateInvestmentScore({
    pricePerSqm: property.pricePerSqm,
    marketAverage: property.marketAverage,
    locationGrowth: property.locationGrowth,
    liquidity: property.liquidity,
    condition: property.conditionScore,
  });
}

export function getPropertyRiskLevel(property: SampleProperty) {
  return calculateRiskScore({
    hasMissingDocuments: property.hasMissingDocuments,
    sellerVerified: property.seller.verified,
    suspiciouslyLowPrice: property.suspiciouslyLowPrice,
    hasLegalIssues: property.hasLegalIssues,
  });
}

export function enrichProperty(property: SampleProperty) {
  const city = cityById[property.cityId];
  const propertyType = propertyTypeById[property.propertyTypeId];
  const fairPrice = getPropertyFairPrice(property);
  const investmentScore = getPropertyInvestmentScore(property);
  const riskLevel = getPropertyRiskLevel(property);

  return {
    ...property,
    city,
    propertyType,
    fairPrice,
    investmentScore,
    riskLevel,
    priceDelta: property.priceUsd - fairPrice,
  };
}

export type EnrichedProperty = ReturnType<typeof enrichProperty>;
