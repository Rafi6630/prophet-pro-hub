export interface InvestmentPropertyInput {
  pricePerSqm: number;
  marketAverage: number;
  locationGrowth: number;
  liquidity: number;
  condition: number;
  price: number;
  estimatedValue: number;
  city: string;
  propertyType: string;
  areaDemand: number;
  age?: number;
  bedrooms?: number;
}

export interface InvestmentScoreResult {
  score: number;
  grade: InvestmentGrade;
  label: string;
  labelAr: string;
  color: string;
  breakdown: {
    priceAdvantage: number;
    growthPotential: number;
    liquidityScore: number;
    conditionScore: number;
    demandScore: number;
  };
  summary: string;
  summaryAr: string;
  risks: string[];
  risksAr: string[];
  opportunities: string[];
  opportunitiesAr: string[];
  timelineRecommendation: string;
  timelineRecommendationAr: string;
}

export type InvestmentGrade = "Excellent" | "Strong" | "Average" | "Weak" | "Avoid";

const GRADE_CONFIG: Record<InvestmentGrade, {
  color: string;
  labelAr: string;
  minScore: number;
  maxScore: number;
}> = {
  Excellent: { color: "text-emerald-400", labelAr: "ممتاز", minScore: 85, maxScore: 100 },
  Strong: { color: "text-blue-400", labelAr: "قوي", minScore: 70, maxScore: 84 },
  Average: { color: "text-amber-400", labelAr: "متوسط", minScore: 50, maxScore: 69 },
  Weak: { color: "text-orange-400", labelAr: "ضعيف", minScore: 30, maxScore: 49 },
  Avoid: { color: "text-red-400", labelAr: "تجنب", minScore: 0, maxScore: 29 },
};

const CITY_GROWTH_RATES: Record<string, number> = {
  erbil: 12,
  sulaymaniyah: 10,
  baghdad: 6,
  basra: 5,
  najaf: 8,
  karbala: 7,
  mosul: 4,
  kirkuk: 5,
  Duhok: 9,
};

const PROPERTY_TYPE_LIQUIDITY: Record<string, number> = {
  apartment: 85,
  villa: 70,
  land: 60,
  commercial: 55,
  house: 75,
  industrial: 45,
};

export function calculateInvestmentScore(property: InvestmentPropertyInput): InvestmentScoreResult {
  const priceAdvantage = calculatePriceAdvantage(property.price, property.estimatedValue, property.pricePerSqm, property.marketAverage);
  const growthPotential = calculateGrowthPotential(property.city, property.locationGrowth, property.propertyType);
  const liquidityScore = calculateLiquidityScore(property.city, property.propertyType, property.liquidity);
  const conditionScore = calculateConditionScore(property.condition, property.age);
  const demandScore = calculateDemandScore(property.areaDemand, property.bedrooms);

  const weights = {
    priceAdvantage: 0.35,
    growthPotential: 0.25,
    liquidityScore: 0.2,
    conditionScore: 0.1,
    demandScore: 0.1,
  };

  const totalScore = Math.round(
    priceAdvantage * weights.priceAdvantage +
    growthPotential * weights.growthPotential +
    liquidityScore * weights.liquidityScore +
    conditionScore * weights.conditionScore +
    demandScore * weights.demandScore
  );

  const grade = getGrade(totalScore);
  const config = GRADE_CONFIG[grade];

  const { summary, summaryAr, risks, risksAr, opportunities, opportunitiesAr, timelineRecommendation, timelineRecommendationAr } = 
    generateInvestmentInsights(property, grade, totalScore);

  return {
    score: Math.min(Math.max(totalScore, 0), 100),
    grade,
    label: grade,
    labelAr: config.labelAr,
    color: config.color,
    breakdown: {
      priceAdvantage,
      growthPotential,
      liquidityScore,
      conditionScore,
      demandScore,
    },
    summary,
    summaryAr,
    risks,
    risksAr,
    opportunities,
    opportunitiesAr,
    timelineRecommendation,
    timelineRecommendationAr,
  };
}

function calculatePriceAdvantage(
  price: number,
  estimatedValue: number,
  pricePerSqm: number,
  marketAverage: number
): number {
  if (estimatedValue === 0) return 50;
  
  const priceVsEstimate = (estimatedValue - price) / estimatedValue;
  const priceVsMarket = (marketAverage - pricePerSqm) / marketAverage;
  
  const combined = (priceVsEstimate + priceVsMarket) / 2;
  
  return Math.min(Math.max(50 + combined * 100, 0), 100);
}

function calculateGrowthPotential(
  city: string,
  locationGrowth: number,
  propertyType: string
): number {
  const cityGrowth = CITY_GROWTH_RATES[city.toLowerCase()] || 5;
  const typeFactor = propertyType === "land" ? 1.2 : 1.0;
  
  const growthScore = Math.min((cityGrowth + locationGrowth) / 2 * typeFactor, 100);
  
  return Math.min(Math.max(growthScore, 0), 100);
}

function calculateLiquidityScore(
  city: string,
  propertyType: string,
  baseLiquidity: number
): number {
  const typeLiquidity = PROPERTY_TYPE_LIQUIDITY[propertyType.toLowerCase()] || 70;
  const cityFactor = city.toLowerCase() === "baghdad" || city.toLowerCase() === "erbil" ? 1.1 : 1.0;
  
  return Math.min(Math.max((typeLiquidity + baseLiquidity) / 2 * cityFactor, 0), 100);
}

function calculateConditionScore(condition: number, age?: number): number {
  let score = condition;
  
  if (age !== undefined) {
    if (age < 3) score = Math.min(score + 10, 100);
    else if (age > 15) score = Math.max(score - 10, 0);
  }
  
  return Math.min(Math.max(score, 0), 100);
}

function calculateDemandScore(areaDemand: number, bedrooms?: number): number {
  let score = areaDemand;
  
  if (bedrooms) {
    if (bedrooms === 3) score = Math.min(score + 10, 100);
    else if (bedrooms > 5) score = Math.max(score - 10, 0);
  }
  
  return Math.min(Math.max(score, 0), 100);
}

function getGrade(score: number): InvestmentGrade {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 50) return "Average";
  if (score >= 30) return "Weak";
  return "Avoid";
}

function generateInvestmentInsights(
  property: InvestmentPropertyInput,
  grade: InvestmentGrade,
  score: number
): {
  summary: string;
  summaryAr: string;
  risks: string[];
  risksAr: string[];
  opportunities: string[];
  opportunitiesAr: string[];
  timelineRecommendation: string;
  timelineRecommendationAr: string;
} {
  const summaryEn = grade === "Excellent" || grade === "Strong"
    ? `This property shows ${grade.toLowerCase()} investment potential with favorable pricing and growth indicators.`
    : grade === "Average"
    ? "This property is reasonably priced but may not offer exceptional returns in the short term."
    : "This property has limited investment appeal. Consider careful evaluation before proceeding.";

  const summaryAr = grade === "Excellent" || grade === "Strong"
    ? `تظهر هذه العقارات إمكانية استثمارية ${grade === "Excellent" ? "ممتازة" : "قوية"} مع تسعير مواتٍ ومؤشرات نمو إيجابية.`
    : grade === "Average"
    ? "العقار مُسعّر بشكل معقول لكنه قد لا يقدم عوائد استثنائية على المدى القصير."
    : "هذا العقار له جاذبية استثمارية محدودة. فكّر في التقييم الدقيق قبل المتابعة.";

  const risks = grade !== "Excellent" && grade !== "Strong" ? [
    "Verify all legal documentation before purchase",
    "Consider market volatility in this area",
    "Factor in potential maintenance costs",
  ] : [];

  const risksAr = risks.map(r => {
    if (r.includes("legal")) return "تحقق من جميع الوثائق القانونية قبل الشراء";
    if (r.includes("market")) return "ضع في اعتبارك تقلب السوق في هذه المنطقة";
    return "ضع في الاعتبار تكاليف الصيانة المحتملة";
  });

  const opportunities = grade === "Excellent" || grade === "Strong" ? [
    "Below-market pricing provides immediate equity",
    "Growing area with infrastructure development",
    "High demand for this property type",
  ] : grade === "Average" ? [
    "Stable rental potential in this location",
    "Good for long-term hold strategy",
  ] : [];

  const opportunitiesAr = opportunities.map(o => {
    if (o.includes("Below-market")) return "التسعير أقل من السوق يوفر حقوق ملكية فورية";
    if (o.includes("Growing")) return "منطقة نامية مع تطوير البنية التحتية";
    if (o.includes("High demand")) return "طلب مرتفع على هذا النوع من العقارات";
    if (o.includes("Stable")) return "إمكانات إيجار مستقرة في هذا الموقع";
    return "جيد لاستراتيجية الاحتفاظ طويلة المدى";
  });

  const timelineRecommendation = grade === "Excellent" || grade === "Strong"
    ? "Act quickly - this is a strong opportunity in a growing market."
    : grade === "Average"
    ? "Consider for long-term investment with careful monitoring."
    : "Conduct thorough due diligence before making any commitment.";

  const timelineRecommendationAr = grade === "Excellent" || grade === "Strong"
    ? "تصرف بسرعة - هذه فرصة قوية في سوق نامٍ."
    : grade === "Average"
    ? "فكّر في الاستثمار طويل المدى مع المراقبة الدقيقة."
    : "قم بإجراء العناية الواجبة الشاملة قبل أي التزام.";

  return {
    summary: summaryEn,
    summaryAr,
    risks,
    risksAr,
    opportunities,
    opportunitiesAr,
    timelineRecommendation,
    timelineRecommendationAr,
  };
}

export function getInvestmentBadge(grade: InvestmentGrade): {
  bgColor: string;
  borderColor: string;
  icon: string;
} {
  switch (grade) {
    case "Excellent":
      return {
        bgColor: "bg-emerald-500/20",
        borderColor: "border-emerald-500/40",
        icon: "star",
      };
    case "Strong":
      return {
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/40",
        icon: "trending-up",
      };
    case "Average":
      return {
        bgColor: "bg-amber-500/20",
        borderColor: "border-amber-500/40",
        icon: "minus",
      };
    case "Weak":
      return {
        bgColor: "bg-orange-500/20",
        borderColor: "border-orange-500/40",
        icon: "trending-down",
      };
    default:
      return {
        bgColor: "bg-red-500/20",
        borderColor: "border-red-500/40",
        icon: "alert",
      };
  }
}