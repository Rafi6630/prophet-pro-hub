export interface FairPricePropertyInput {
  size: number;
  marketAverage: number;
  condition: "poor" | "average" | "good" | "excellent";
  areaDemand: number;
}

const conditionAdjustments: Record<FairPricePropertyInput["condition"], number> = {
  poor: 0.85,
  average: 1,
  good: 1.08,
  excellent: 1.16,
};

export function estimateFairPrice(property: FairPricePropertyInput): number {
  const basePrice = property.size * property.marketAverage;
  const demandMultiplier = 0.9 + Math.min(Math.max(property.areaDemand, 0), 100) / 500;
  const conditionMultiplier = conditionAdjustments[property.condition];

  return Math.round(basePrice * demandMultiplier * conditionMultiplier);
}
