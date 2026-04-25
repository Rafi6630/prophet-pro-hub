import { iraqCities } from "@/data/iraqCities";
import { marketInsights } from "@/data/marketInsights";

export function getAreaGrowthOutlook(cityId: string, areaDemand: number) {
  const city = iraqCities.find((item) => item.id === cityId);
  const market = marketInsights.find((item) => item.cityId === cityId);
  const demandTier = areaDemand >= 85 ? "High-conviction" : areaDemand >= 70 ? "Healthy" : "Selective";

  return {
    cityGrowthScore: city?.growthScore ?? 70,
    demandTier,
    summary:
      market?.growthOutlook ??
      "Area demand is supported by local buyer activity, but verified documentation remains the deciding factor.",
  };
}
