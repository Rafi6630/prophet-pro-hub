import { estimateFairPrice } from "@/lib/fairPrice";

export function getFairPriceEstimate(input: Parameters<typeof estimateFairPrice>[0]) {
  const estimate = estimateFairPrice(input);

  return {
    estimate,
    confidenceBand: {
      low: Math.round(estimate * 0.94),
      high: Math.round(estimate * 1.07),
    },
  };
}
