export interface AreaInsightInput {
  city: string;
  district?: string;
  propertyType?: string;
  size?: number;
}

export interface AreaInsightResult {
  city: string;
  district?: string;
  metrics: AreaMetrics;
  trends: AreaTrends;
  scores: AreaScores;
  recommendations: string[];
  recommendationsAr: string[];
  comparableAreas: ComparableArea[];
  marketData: MarketData;
}

export interface AreaMetrics {
  medianPrice: number;
  avgPricePerSqm: number;
  activeListings: number;
  monthlyTransactions: number;
  avgDaysOnMarket: number;
  priceChangePercent: number;
  inventoryLevel: "low" | "medium" | "high";
  demandLevel: "low" | "medium" | "high";
}

export interface AreaTrends {
  growthTrend: "rising" | "stable" | "declining";
  growthRate: number;
  demandTrend: "increasing" | "stable" | "decreasing";
  investmentTrend: "hot" | "active" | "slow";
  rentalYieldTrend: "improving" | "stable" | "declining";
  infrastructureTrend: "developing" | "mature" | "declining";
  lastUpdated: string;
}

export interface AreaScores {
  investorScore: number;
  familyScore: number;
  familyScoreAr: string;
  liquidityScore: number;
  liquidityLabel: string;
  growthOutlook: "Excellent" | "Strong" | "Average" | "Weak";
  growthOutlookAr: string;
  desirabilityScore: number;
  safetyScore: number;
  convenienceScore: number;
}

export interface ComparableArea {
  name: string;
  medianPrice: number;
  priceDifference: number;
  priceDifferencePercent: number;
  growthRate: number;
  distance: string;
}

export interface MarketData {
  priceRange: { min: number; max: number };
  popularPropertyTypes: string[];
  buyerProfile: string;
  investorProfile: string;
  seasonality: SeasonalityData;
}

export interface SeasonalityData {
  peakMonths: string[];
  lowMonths: string[];
  bestTimeToBuy: string;
  priceFluctuation: number;
}

const CITY_METRICS: Record<string, Partial<AreaMetrics>> = {
  baghdad: {
    medianPrice: 250000,
    avgPricePerSqm: 1250,
    activeListings: 450,
    monthlyTransactions: 85,
    avgDaysOnMarket: 45,
    priceChangePercent: 5,
  },
  erbil: {
    medianPrice: 320000,
    avgPricePerSqm: 1600,
    activeListings: 380,
    monthlyTransactions: 72,
    avgDaysOnMarket: 35,
    priceChangePercent: 8,
  },
  basra: {
    medianPrice: 180000,
    avgPricePerSqm: 900,
    activeListings: 220,
    monthlyTransactions: 38,
    avgDaysOnMarket: 60,
    priceChangePercent: 3,
  },
  mosul: {
    medianPrice: 95000,
    avgPricePerSqm: 550,
    activeListings: 150,
    monthlyTransactions: 25,
    avgDaysOnMarket: 90,
    priceChangePercent: 2,
  },
  najaf: {
    medianPrice: 140000,
    avgPricePerSqm: 750,
    activeListings: 180,
    monthlyTransactions: 32,
    avgDaysOnMarket: 50,
    priceChangePercent: 6,
  },
  karbala: {
    medianPrice: 130000,
    avgPricePerSqm: 700,
    activeListings: 165,
    monthlyTransactions: 30,
    avgDaysOnMarket: 55,
    priceChangePercent: 5,
  },
  sulaymaniyah: {
    medianPrice: 280000,
    avgPricePerSqm: 1400,
    activeListings: 200,
    monthlyTransactions: 40,
    avgDaysOnMarket: 40,
    priceChangePercent: 7,
  },
  kirkuk: {
    medianPrice: 120000,
    avgPricePerSqm: 650,
    activeListings: 130,
    monthlyTransactions: 22,
    avgDaysOnMarket: 70,
    priceChangePercent: 3,
  },
  Duhok: {
    medianPrice: 200000,
    avgPricePerSqm: 1000,
    activeListings: 140,
    monthlyTransactions: 28,
    avgDaysOnMarket: 45,
    priceChangePercent: 6,
  },
};

const GROWTH_OUTLOOK_CONFIG = [
  { max: 30, label: "Weak", labelAr: "ضعيف" },
  { max: 50, label: "Average", labelAr: "متوسط" },
  { max: 75, label: "Strong", labelAr: "قوي" },
  { max: 100, label: "Excellent", labelAr: "ممتاز" },
];

export function getAreaInsights(input: AreaInsightInput): AreaInsightResult {
  const cityMetrics = CITY_METRICS[input.city.toLowerCase()] || CITY_METRICS.baghdad;

  const metrics = calculateMetrics(input, cityMetrics);
  const trends = calculateTrends(input, metrics);
  const scores = calculateScores(input, metrics);
  const recommendations = generateRecommendations(input, metrics, scores);
  const recommendationsAr = translateRecommendations(recommendations);
  const comparableAreas = generateComparableAreas(input, cityMetrics);
  const marketData = generateMarketData(input, metrics);

  return {
    city: input.city,
    district: input.district,
    metrics,
    trends,
    scores,
    recommendations,
    recommendationsAr,
    comparableAreas,
    marketData,
  };
}

function calculateMetrics(input: AreaInsightInput, baseMetrics: Partial<AreaMetrics>): AreaMetrics {
  const sizeAdjustment = input.size ? (input.size > 300 ? 1.15 : input.size < 150 ? 0.9 : 1.0) : 1.0;

  const inventoryRatio = baseMetrics.activeListings && baseMetrics.monthlyTransactions
    ? baseMetrics.monthlyTransactions / baseMetrics.activeListings
    : 0.2;

  let inventoryLevel: "low" | "medium" | "high";
  if (inventoryRatio < 0.1) inventoryLevel = "low";
  else if (inventoryRatio < 0.2) inventoryLevel = "medium";
  else inventoryLevel = "high";

  const demandRatio = baseMetrics.monthlyTransactions ? baseMetrics.monthlyTransactions / 50 : 0.5;
  let demandLevel: "low" | "medium" | "high";
  if (demandRatio < 0.5) demandLevel = "low";
  else if (demandRatio < 1.0) demandLevel = "medium";
  else demandLevel = "high";

  return {
    medianPrice: Math.round((baseMetrics.medianPrice || 150000) * sizeAdjustment),
    avgPricePerSqm: Math.round((baseMetrics.avgPricePerSqm || 1000) * sizeAdjustment),
    activeListings: baseMetrics.activeListings || 200,
    monthlyTransactions: baseMetrics.monthlyTransactions || 40,
    avgDaysOnMarket: baseMetrics.avgDaysOnMarket || 50,
    priceChangePercent: baseMetrics.priceChangePercent || 4,
    inventoryLevel,
    demandLevel,
  };
}

function calculateTrends(input: AreaInsightInput, metrics: AreaMetrics): AreaTrends {
  let growthTrend: "rising" | "stable" | "declining";
  let growthRate: number;

  if (metrics.priceChangePercent >= 5) {
    growthTrend = "rising";
    growthRate = metrics.priceChangePercent;
  } else if (metrics.priceChangePercent >= 2) {
    growthTrend = "stable";
    growthRate = metrics.priceChangePercent;
  } else {
    growthTrend = "declining";
    growthRate = metrics.priceChangePercent;
  }

  let demandTrend: "increasing" | "stable" | "decreasing";
  if (metrics.demandLevel === "high") {
    demandTrend = "increasing";
  } else if (metrics.demandLevel === "medium") {
    demandTrend = "stable";
  } else {
    demandTrend = "decreasing";
  }

  const investmentTrend = growthTrend === "rising" ? "hot" : growthTrend === "stable" ? "active" : "slow";

  const rentalYieldTrend = metrics.priceChangePercent > 4 ? "improving" : metrics.priceChangePercent > 1 ? "stable" : "declining";

  const infrastructureTrend = ["erbil", "sulaymaniyah", "baghdad"].includes(input.city.toLowerCase()) 
    ? "developing" 
    : "mature";

  return {
    growthTrend,
    growthRate,
    demandTrend,
    investmentTrend,
    rentalYieldTrend,
    infrastructureTrend,
    lastUpdated: new Date().toISOString().split("T")[0],
  };
}

function calculateScores(input: AreaInsightInput, metrics: AreaMetrics): AreaScores {
  const investorScore = calculateInvestorScore(metrics);
  const familyScore = calculateFamilyScore(input);
  const liquidityScore = calculateLiquidityScore(metrics);
  const growthOutlook = getGrowthOutlook(investorScore);
  const desirabilityScore = calculateDesirabilityScore(input, metrics);
  const safetyScore = calculateSafetyScore(input.city);
  const convenienceScore = calculateConvenienceScore(input);

  return {
    investorScore,
    familyScore,
    familyScoreAr: getFamilyScoreLabelAr(familyScore),
    liquidityScore,
    liquidityLabel: getLiquidityLabel(liquidityScore),
    growthOutlook,
    growthOutlookAr: getGrowthOutlookAr(growthOutlook),
    desirabilityScore,
    safetyScore,
    convenienceScore,
  };
}

function calculateInvestorScore(metrics: AreaMetrics): number {
  let score = 50;

  score += Math.min(metrics.priceChangePercent * 5, 30);
  
  if (metrics.demandLevel === "high") score += 15;
  else if (metrics.demandLevel === "medium") score += 8;

  if (metrics.inventoryLevel === "low") score += 10;
  else if (metrics.inventoryLevel === "high") score -= 10;

  score += (30 - Math.min(metrics.avgDaysOnMarket, 30)) / 2;

  return Math.min(Math.max(Math.round(score), 0), 100);
}

function calculateFamilyScore(input: AreaInsightInput): number {
  let score = 60;

  const familyCities = ["erbil", "baghdad", "sulaymaniyah", "basra", "najaf"];
  if (familyCities.includes(input.city.toLowerCase())) {
    score += 15;
  }

  if (input.district) {
    const safeDistricts = ["al-mansour", "al-jadida", "kadhimiyah", "erbil-center", "gulan"];
    if (safeDistricts.some(d => input.district?.toLowerCase().includes(d))) {
      score += 10;
    }
  }

  return Math.min(score, 100);
}

function calculateLiquidityScore(metrics: AreaMetrics): number {
  let score = 50;

  if (metrics.avgDaysOnMarket < 30) score += 20;
  else if (metrics.avgDaysOnMarket < 60) score += 10;
  else if (metrics.avgDaysOnMarket > 90) score -= 15;

  if (metrics.inventoryLevel === "low") score += 15;
  else if (metrics.inventoryLevel === "high") score -= 10;

  score += Math.min(metrics.monthlyTransactions * 2, 20);

  return Math.min(Math.max(Math.round(score), 0), 100);
}

function getGrowthOutlook(investorScore: number): "Excellent" | "Strong" | "Average" | "Weak" {
  if (investorScore >= 75) return "Excellent";
  if (investorScore >= 50) return "Strong";
  if (investorScore >= 30) return "Average";
  return "Weak";
}

function getGrowthOutlookAr(outlook: "Excellent" | "Strong" | "Average" | "Weak"): string {
  const labels: Record<string, string> = {
    Excellent: "ممتاز",
    Strong: "قوي",
    Average: "متوسط",
    Weak: "ضعيف",
  };
  return labels[outlook];
}

function getFamilyScoreLabelAr(score: number): string {
  if (score >= 80) return "مثالي للعائلة";
  if (score >= 60) return "جيد للعائلة";
  if (score >= 40) return "مقبول للعائلة";
  return "غير مناسب للعائلة";
}

function getLiquidityLabel(score: number): string {
  if (score >= 75) return "Highly Liquid";
  if (score >= 55) return "Moderately Liquid";
  if (score >= 35) return "Low Liquidity";
  return "Very Low Liquidity";
}

function calculateDesirabilityScore(input: AreaInsightInput, metrics: AreaMetrics): number {
  let score = 50;

  if (input.city.toLowerCase() === "erbil") score += 20;
  else if (input.city.toLowerCase() === "baghdad") score += 10;
  else if (input.city.toLowerCase() === "sulaymaniyah") score += 15;

  if (input.district) score += 10;

  score += Math.min(metrics.demandLevel === "high" ? 20 : metrics.demandLevel === "medium" ? 10 : 0, 20);

  return Math.min(Math.max(score, 0), 100);
}

function calculateSafetyScore(city: string): number {
  const scores: Record<string, number> = {
    erbil: 85,
    sulaymaniyah: 82,
    Duhok: 78,
    najaf: 75,
    karbala: 72,
    basra: 65,
    baghdad: 60,
    kirkuk: 58,
    mosul: 45,
  };
  return scores[city.toLowerCase()] || 50;
}

function calculateConvenienceScore(input: AreaInsightInput): number {
  let score = 50;

  const majorCities = ["baghdad", "erbil", "basra", "mosul", "sulaymaniyah"];
  if (majorCities.includes(input.city.toLowerCase())) {
    score += 20;
  }

  if (input.district) score += 10;

  return Math.min(score, 100);
}

function generateRecommendations(input: AreaInsightInput, metrics: AreaMetrics, scores: AreaScores): string[] {
  const recommendations: string[] = [];

  if (scores.growthOutlook === "Excellent" || scores.growthOutlook === "Strong") {
    recommendations.push("Strong investment potential - consider entering the market soon");
  }

  if (metrics.inventoryLevel === "low") {
    recommendations.push("Limited inventory indicates competitive market - act quickly on good deals");
  }

  if (metrics.avgDaysOnMarket < 45) {
    recommendations.push("Properties sell quickly here - pricing competitively is important");
  }

  if (scores.liquidityScore > 70) {
    recommendations.push("High liquidity area - good for both investment and resale");
  }

  if (scores.familyScore > 75) {
    recommendations.push("Family-friendly area - suitable for residential buyers with children");
  }

  if (scores.safetyScore > 75) {
    recommendations.push("High safety rating - attractive for families and long-term residents");
  }

  if (metrics.priceChangePercent > 5) {
    recommendations.push("Rising market - consider negotiating before prices increase further");
  }

  if (recommendations.length === 0) {
    recommendations.push("Stable market with moderate opportunity for buyers and investors");
  }

  return recommendations;
}

function translateRecommendations(recommendations: string[]): string[] {
  return recommendations.map(r => {
    if (r.includes("Strong investment")) return "إمكانات استثمارية قوية - فكر في دخول السوق قريباً";
    if (r.includes("Limited inventory")) return "مخزون محدود يشير إلى سوق تنافسي - تصرف بسرعة على الصفقات الجيدة";
    if (r.includes("Properties sell quickly")) return "العقارات تبيع بسرعة هنا - التسعير التنافسي مهم";
    if (r.includes("High liquidity")) return "منطقة سيولة عالية - جيدة للاستثمار وإعادة البيع";
    if (r.includes("Family-friendly")) return "منطقة صديقة للعائلة - مناسبة للمشترين المقيمين مع الأطفال";
    if (r.includes("High safety rating")) return "تصنيف سلامة مرتفع - جذاب للعائلات والمقيمين طويل المدى";
    if (r.includes("Rising market")) return "سوق صاعد - فكر في التفاوض قبل ارتفاع الأسعار أكثر";
    return "سوق مستقر مع فرصة معتدلة للمشترين والمستثمرين";
  });
}

function generateComparableAreas(input: AreaInsightInput, baseMetrics: Partial<AreaMetrics>): ComparableArea[] {
  const cityList = Object.keys(CITY_METRICS).filter(c => c !== input.city.toLowerCase());
  
  return cityList.slice(0, 4).map((city, index) => {
    const cityData = CITY_METRICS[city];
    const basePrice = baseMetrics.medianPrice || 150000;
    const comparePrice = cityData.medianPrice || 150000;
    const diff = comparePrice - basePrice;
    const diffPercent = (diff / basePrice) * 100;

    return {
      name: city.charAt(0).toUpperCase() + city.slice(1),
      medianPrice: cityData.medianPrice || 150000,
      priceDifference: diff,
      priceDifferencePercent: Math.round(diffPercent),
      growthRate: cityData.priceChangePercent || 4,
      distance: `${(index + 1) * 50}km`,
    };
  });
}

function generateMarketData(input: AreaInsightInput, metrics: AreaMetrics): MarketData {
  return {
    priceRange: {
      min: Math.round(metrics.medianPrice * 0.6),
      max: Math.round(metrics.medianPrice * 1.5),
    },
    popularPropertyTypes: ["apartment", "villa", "land"],
    buyerProfile: metrics.demandLevel === "high" 
      ? "Active buyer market with diverse preferences"
      : "Moderate buyer activity with specific requirements",
    investorProfile: metrics.priceChangePercent >= 5 
      ? "Attracting significant investor interest"
      : "Steady investor interest with focus on rental yield",
    seasonality: {
      peakMonths: ["March", "April", "May", "September", "October"],
      lowMonths: ["July", "August", "January"],
      bestTimeToBuy: "Early Spring (March-April) or Early Autumn (September-October)",
      priceFluctuation: Math.round(metrics.priceChangePercent * 2),
    },
  };
}

export function getAreaScoreColor(score: number): string {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-blue-400";
  if (score >= 30) return "text-amber-400";
  return "text-red-400";
}

export function formatGrowthRate(rate: number): string {
  const sign = rate >= 0 ? "+" : "";
  return `${sign}${rate.toFixed(1)}%`;
}