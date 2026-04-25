export interface InvestmentPropertyInput {
  pricePerSqm: number;
  marketAverage: number;
  locationGrowth: number;
  liquidity: number;
  condition: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function calculateInvestmentScore(property: InvestmentPropertyInput): number {
  const priceAdvantage =
    property.marketAverage > 0
      ? clamp(
          ((property.marketAverage - property.pricePerSqm) / property.marketAverage) * 100,
          -20,
          20
        ) + 20
      : 20;

  const growthScore = clamp(property.locationGrowth, 0, 100);
  const liquidityScore = clamp(property.liquidity, 0, 100);
  const conditionScore = clamp(property.condition, 0, 100);
  const pricingScore = clamp((priceAdvantage / 40) * 100, 0, 100);

  const total =
    pricingScore * 0.35 +
    growthScore * 0.25 +
    liquidityScore * 0.2 +
    conditionScore * 0.2;

  return Math.round(clamp(total, 0, 100));
}
