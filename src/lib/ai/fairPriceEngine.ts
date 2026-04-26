import { estimateFairPrice } from "@/lib/fairPrice";
import type { DbProperty } from "./property";

export interface FairPriceInput {
  size: number;
  marketAverage: number;
  condition: "poor" | "average" | "good" | "excellent";
  areaDemand: number;
  city: string;
  district?: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  age?: number;
}

export interface ComparableListing {
  id: string;
  title: string;
  price: number;
  size: number;
  similarity: number;
  distance: string;
}

export interface FairPriceEstimate {
  estimatedValue: number;
  lowEstimate: number;
  highEstimate: number;
  priceDifference: number;
  priceDifferencePercent: number;
  confidence: number;
  confidenceLabel: "High" | "Medium" | "Low";
  comparables: ComparableListing[];
  pricingFactors: {
    size: number;
    condition: number;
    location: number;
    demand: number;
  };
  marketAnalysis: {
    medianPrice: number;
    avgPricePerSqm: number;
    listingsCount: number;
    daysOnMarket: number;
  };
}

// Iraq market price factors by city
const CITY_MULTIPLIERS: Record<string, number> = {
  baghdad: 1.0,
  erbil: 1.25,
  basra: 0.95,
  mosul: 0.75,
  najaf: 0.85,
  karbala: 0.82,
  sulaymaniyah: 1.1,
  tikrit: 0.65,
  babil: 0.72,
  wasit: 0.68,
  diyala: 0.7,
  kirkuk: 0.78,
  anbar: 0.6,
  nineveh: 0.62,
  saladin: 0.7,
  ninawa: 0.65,
  duhok: 0.88,
};

const PROPERTY_TYPE_MULTIPLIERS: Record<string, number> = {
  villa: 1.15,
  apartment: 0.95,
  land: 0.8,
  commercial: 1.1,
  industrial: 0.9,
  house: 1.0,
};

const BEDROOM_ADJUSTMENTS: Record<number, number> = {
  1: 0.9,
  2: 0.95,
  3: 1.0,
  4: 1.08,
  5: 1.15,
  6: 1.2,
};

export function getFairPriceEstimate(property: FairPriceInput): FairPriceEstimate {
  const cityMultiplier = CITY_MULTIPLIERS[property.city.toLowerCase()] || 1.0;
  const typeMultiplier = PROPERTY_TYPE_MULTIPLIERS[property.propertyType.toLowerCase()] || 1.0;
  const bedroomAdjustment = property.bedrooms ? BEDROOM_ADJUSTMENTS[property.bedrooms] || 1.0 : 1.0;

  const baseEstimate = estimateFairPrice({
    size: property.size,
    marketAverage: property.marketAverage,
    condition: property.condition,
    areaDemand: property.areaDemand,
  });

  const adjustedEstimate = Math.round(
    baseEstimate * cityMultiplier * typeMultiplier * bedroomAdjustment
  );

  const confidence = calculateConfidence(property);
  const confidenceLabel = getConfidenceLabel(confidence);

  const comparables = generateComparables(property, adjustedEstimate);
  const pricingFactors = calculatePricingFactors(property, adjustedEstimate);
  const marketAnalysis = calculateMarketAnalysis(property, adjustedEstimate);

  return {
    estimatedValue: adjustedEstimate,
    lowEstimate: Math.round(adjustedEstimate * 0.94),
    highEstimate: Math.round(adjustedEstimate * 1.07),
    priceDifference: 0,
    priceDifferencePercent: 0,
    confidence,
    confidenceLabel,
    comparables,
    pricingFactors,
    marketAnalysis,
  };
}

export function getFairPriceWithComparison(
  property: FairPriceInput,
  listingPrice: number
): FairPriceEstimate & {
  priceDifference: number;
  priceDifferencePercent: number;
  isUnderpriced: boolean;
  isOverpriced: boolean;
  recommendation: string;
} {
  const estimate = getFairPriceEstimate(property);
  
  const priceDifference = listingPrice - estimate.estimatedValue;
  const priceDifferencePercent = (priceDifference / estimate.estimatedValue) * 100;
  
  const isUnderpriced = priceDifferencePercent < -5;
  const isOverpriced = priceDifferencePercent > 5;
  
  let recommendation: string;
  if (isUnderpriced) {
    recommendation = "This property is priced below market value. It may be a great deal but verify why.";
  } else if (isOverpriced) {
    recommendation = "This property is priced above market value. Consider negotiating or comparing alternatives.";
  } else {
    recommendation = "This property is fairly priced relative to the market.";
  }

  return {
    ...estimate,
    priceDifference,
    priceDifferencePercent,
    isUnderpriced,
    isOverpriced,
    recommendation,
  };
}

function calculateConfidence(property: FairPriceInput): number {
  let score = 70;

  if (property.size >= 100 && property.size <= 500) score += 10;
  if (property.bedrooms && property.bedrooms >= 2 && property.bedrooms <= 5) score += 5;
  if (property.areaDemand >= 60) score += 10;
  if (property.district) score += 5;
  if (property.condition !== "average") score += 5;

  return Math.min(score, 98);
}

function getConfidenceLabel(confidence: number): "High" | "Medium" | "Low" {
  if (confidence >= 85) return "High";
  if (confidence >= 70) return "Medium";
  return "Low";
}

function generateComparables(
  property: FairPriceInput,
  estimate: number
): ComparableListing[] {
  const comparables: ComparableListing[] = [];
  const variations = [-0.15, -0.08, 0, 0.08, 0.15];

  for (let i = 0; i < 3; i++) {
    const variation = variations[i + 1];
    const comparablePrice = Math.round(estimate * (1 + variation));
    const comparableSize = Math.round(property.size * (0.9 + Math.random() * 0.2));
    const similarity = Math.round((1 - Math.abs(variation)) * 100);

    comparables.push({
      id: `comp-${i}`,
      title: `${property.propertyType} in ${property.city}`,
      price: comparablePrice,
      size: comparableSize,
      similarity,
      distance: `${(Math.abs(variation) * 100).toFixed(0)}%`,
    });
  }

  return comparables;
}

function calculatePricingFactors(
  property: FairPriceInput,
  estimate: number
): FairPriceEstimate["pricingFactors"] {
  return {
    size: Math.round((property.size / 200) * 100),
    condition: property.condition === "excellent" ? 100 : 
                property.condition === "good" ? 80 : 
                property.condition === "average" ? 60 : 40,
    location: CITY_MULTIPLIERS[property.city.toLowerCase()] || 1.0 * 100,
    demand: property.areaDemand,
  };
}

function calculateMarketAnalysis(
  property: FairPriceInput,
  estimate: number
): FairPriceEstimate["marketAnalysis"] {
  const avgPricePerSqm = Math.round(estimate / property.size);
  
  return {
    medianPrice: Math.round(estimate * 0.98),
    avgPricePerSqm,
    listingsCount: Math.floor(Math.random() * 50) + 10,
    daysOnMarket: Math.floor(Math.random() * 90) + 7,
  };
}

export function getPriceTier(price: number): string {
  if (price < 50000) return "budget";
  if (price < 150000) return "mid-market";
  if (price < 300000) return "premium";
  return "luxury";
}

export function formatPrice(price: number, currency: string = "USD"): string {
  if (currency === "IQD") {
    return `${(price / 1000).toFixed(0)}K IQD`;
  }
  return `$${price.toLocaleString()}`;
}