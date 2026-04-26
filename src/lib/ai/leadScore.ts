export interface LeadScoreInput {
  inquirySource: "website" | "whatsapp" | "phone" | "app" | "referral";
  responseTimeMinutes?: number;
  hasBudget: boolean;
  budgetAmount?: number;
  budgetMatch: "exact" | "close" | "over" | "under";
  hasViewedProperty: boolean;
  viewCount: number;
  hasSavedProperty: boolean;
  hasContactedSeller: boolean;
  contactCount: number;
  repeatVisit: boolean;
  visitCount: number;
  lastVisitDaysAgo?: number;
  engagementScore: number;
  messagesExchanged: number;
  propertyTypeInterest: string[];
  cityInterest: string[];
  timelineScore: "immediate" | "1month" | "3months" | "6months" | "browsing";
  isVerified: boolean;
  hasCompletedProfile: boolean;
  isReturningUser: boolean;
  userAge: number;
}

export interface LeadScoreResult {
  score: number;
  tier: LeadTier;
  tierLabel: string;
  tierLabelAr: string;
  tierColor: string;
  breakdown: LeadScoreBreakdown;
  summary: string;
  summaryAr: string;
  action: string;
  actionAr: string;
  priority: number;
  estimatedCloseDate: string;
  conversionProbability: number;
}

export type LeadTier = "Hot" | "Warm" | "Cold";

export interface LeadScoreBreakdown {
  intentSignals: number;
  budgetFit: number;
  engagement: number;
  timeline: number;
  verification: number;
  interaction: number;
}

const TIER_CONFIG: Record<LeadTier, {
  minScore: number;
  maxScore: number;
  color: string;
  labelAr: string;
}> = {
  Hot: { minScore: 75, maxScore: 100, color: "text-red-400", labelAr: "حار" },
  Warm: { minScore: 45, maxScore: 74, color: "text-orange-400", labelAr: "دافئ" },
  Cold: { minScore: 0, maxScore: 44, color: "text-blue-400", labelAr: "بارد" },
};

const SOURCE_PRIORITY: Record<string, number> = {
  whatsapp: 15,
  phone: 12,
  app: 10,
  website: 8,
  referral: 18,
};

const TIMELINE_PRIORITY: Record<string, number> = {
  immediate: 25,
  "1month": 20,
  "3months": 12,
  "6months": 6,
  browsing: 2,
};

export function calculateLeadScore(input: LeadScoreInput): LeadScoreResult {
  const intentSignals = calculateIntentSignals(input);
  const budgetFit = calculateBudgetFit(input);
  const engagement = calculateEngagement(input);
  const timeline = calculateTimelineScore(input);
  const verification = calculateVerificationScore(input);
  const interaction = calculateInteractionScore(input);

  const weights = {
    intentSignals: 0.25,
    budgetFit: 0.25,
    engagement: 0.2,
    timeline: 0.15,
    verification: 0.1,
    interaction: 0.05,
  };

  const totalScore = Math.round(
    intentSignals * weights.intentSignals +
    budgetFit * weights.budgetFit +
    engagement * weights.engagement +
    timeline * weights.timeline +
    verification * weights.verification +
    interaction * weights.interaction
  );

  const tier = getTier(totalScore);
  const config = TIER_CONFIG[tier];

  const conversionProbability = calculateConversionProbability(totalScore, input.timelineScore);
  const estimatedCloseDate = calculateEstimatedCloseDate(input.timelineScore, totalScore);

  const breakdown: LeadScoreBreakdown = {
    intentSignals,
    budgetFit,
    engagement,
    timeline,
    verification,
    interaction,
  };

  const summary = generateSummary(tier, totalScore, breakdown);
  const summaryAr = generateSummaryAr(tier, totalScore, breakdown);
  const action = generateAction(tier, input);
  const actionAr = generateActionAr(tier, input);
  const priority = calculatePriority(tier, totalScore, input.responseTimeMinutes);

  return {
    score: totalScore,
    tier,
    tierLabel: tier,
    tierLabelAr: config.labelAr,
    tierColor: config.color,
    breakdown,
    summary,
    summaryAr,
    action,
    actionAr,
    priority,
    estimatedCloseDate,
    conversionProbability,
  };
}

function calculateIntentSignals(input: LeadScoreInput): number {
  let score = 30;

  if (input.hasViewedProperty) score += 10;
  if (input.viewCount >= 5) score += 15;
  if (input.viewCount >= 10) score += 10;

  if (input.hasSavedProperty) score += 15;
  if (input.repeatVisit) score += 10;
  if (input.visitCount >= 3) score += 5;

  score += Math.min(input.engagementScore, 15);

  return Math.min(score, 100);
}

function calculateBudgetFit(input: LeadScoreInput): number {
  if (!input.hasBudget) return 25;

  let score = 50;

  switch (input.budgetMatch) {
    case "exact":
      score = 100;
      break;
    case "close":
      score = 80;
      break;
    case "over":
      score = 65;
      break;
    case "under":
      score = 60;
      break;
  }

  if (input.budgetAmount) {
    if (input.budgetAmount >= 200000) score += 10;
    if (input.budgetAmount >= 500000) score += 10;
  }

  return Math.min(score, 100);
}

function calculateEngagement(input: LeadScoreInput): number {
  let score = 40;

  if (input.messagesExchanged >= 3) score += 20;
  if (input.messagesExchanged >= 10) score += 15;

  if (input.hasContactedSeller) score += 15;
  if (input.contactCount >= 2) score += 10;
  if (input.contactCount >= 5) score += 10;

  if (input.propertyTypeInterest.length > 1) score += 5;
  if (input.cityInterest.length > 1) score += 5;

  return Math.min(score, 100);
}

function calculateTimelineScore(input: LeadScoreInput): number {
  return TIMELINE_PRIORITY[input.timelineScore] || 0;
}

function calculateVerificationScore(input: LeadScoreInput): number {
  let score = 20;

  if (input.isVerified) score += 30;
  if (input.hasCompletedProfile) score += 20;
  if (input.isReturningUser) score += 15;

  if (input.userAge > 0 && input.userAge < 3) {
    score -= 10;
  }

  return Math.min(score, 100);
}

function calculateInteractionScore(input: LeadScoreInput): number {
  let score = 30;

  const sourceBonus = SOURCE_PRIORITY[input.inquirySource] || 0;
  score += sourceBonus;

  if (input.responseTimeMinutes !== undefined) {
    if (input.responseTimeMinutes <= 5) score += 20;
    else if (input.responseTimeMinutes <= 15) score += 10;
    else if (input.responseTimeMinutes <= 60) score += 5;
  }

  return Math.min(score, 100);
}

function getTier(score: number): LeadTier {
  if (score >= 75) return "Hot";
  if (score >= 45) return "Warm";
  return "Cold";
}

function calculateConversionProbability(score: number, timeline: string): number {
  let baseProbability: number;

  switch (timeline) {
    case "immediate":
      baseProbability = 0.7;
      break;
    case "1month":
      baseProbability = 0.5;
      break;
    case "3months":
      baseProbability = 0.3;
      break;
    case "6months":
      baseProbability = 0.15;
      break;
    default:
      baseProbability = 0.05;
  }

  const scoreMultiplier = score / 100;
  const finalProbability = baseProbability * scoreMultiplier;

  return Math.min(Math.max(finalProbability, 0.01), 0.99);
}

function calculateEstimatedCloseDate(timeline: string, score: number): string {
  const now = new Date();

  switch (timeline) {
    case "immediate":
      return formatDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));
    case "1month":
      return formatDate(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
    case "3months":
      return formatDate(new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000));
    case "6months":
      return formatDate(new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000));
    default:
      return formatDate(new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000));
  }
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function generateSummary(tier: LeadTier, score: number, breakdown: LeadScoreBreakdown): string {
  if (tier === "Hot") {
    return `High-intent lead with strong ${breakdown.budgetFit > 70 ? "budget alignment" : "engagement signals"}. ${breakdown.intentSignals > 60 ? "Multiple property views and saves detected." : "Active interest in specific properties."} ${breakdown.timeline < 3 ? "Ready for immediate action." : "Expected to convert within 30 days."}`;
  } else if (tier === "Warm") {
    return `Moderate interest with ${breakdown.engagement > 50 ? "active engagement" : "some interaction"}. ${breakdown.budgetFit > 60 ? "Budget appears reasonable." : "Budget verification needed."} ${breakdown.intentSignals > 40 ? "Consider nurturing with relevant listings." : "Build relationship before presenting options."}`;
  } else {
    return `Early-stage lead requiring ${breakdown.verification < 40 ? "profile completion and verification" : "nurturing"}. ${breakdown.engagement < 30 ? "Limited interaction so far." : "Some browsing activity detected."} ${breakdown.timeline < 3 ? "Monitor for timeline acceleration." : "Plan long-term follow-up sequence."}`;
  }
}

function generateSummaryAr(tier: LeadTier, score: number, breakdown: LeadScoreBreakdown): string {
  if (tier === "Hot") {
    return `Lead عالي الجودة مع ${breakdown.budgetFit > 70 ? "محاذاة قوية للميزانية" : "إشارات تفاعل قوية"}. ${breakdown.intentSignals > 60 ? "تم اكتشاف مشاهدات وحفظ للعقارات المتعددة." : "اهتمام نشط بالعقارات المحددة."} ${breakdown.timeline < 3 ? "جاهز للإجراء الفوري." : "من المتوقع التحويل خلال 30 يوماً."}`;
  } else if (tier === "Warm") {
    return `اهتمام معتدل مع ${breakdown.engagement > 50 ? "تفاعل نشط" : "بعض التفاعل"}. ${breakdown.budgetFit > 60 ? "الميزانية تبدو معقولة." : "تحتاج التحقق من الميزانية."} ${breakdown.intentSignals > 40 ? "فكر في التنشئة مع القوائم ذات الصلة." : "ابنِ العلاقة قبل تقديم الخيارات."}`;
  } else {
    return `Lead في مرحلة مبكرة يتطلب ${breakdown.verification < 40 ? "إكمال والتحقق من الملف الشخصي" : "التنشئة"}. ${breakdown.engagement < 30 ? "تفاعل محدود حتى الآن." : "تم اكتشاف بعض نشاط التصفح."} ${breakdown.timeline < 3 ? "راقب تسارع الجدول الزمني." : "خطط للمتابعة طويلة المدى."}`;
  }
}

function generateAction(tier: LeadTier, input: LeadScoreInput): string {
  if (tier === "Hot") {
    return "Contact immediately via preferred channel. Schedule viewing within 24 hours. Prepare all property details and ownership documents.";
  } else if (tier === "Warm") {
    return "Send relevant property matches. Follow up within 2-3 days. Offer virtual tour or detailed property information.";
  } else {
    return "Add to nurture sequence. Share market insights and new listings. Verify budget and timeline at next interaction.";
  }
}

function generateActionAr(tier: LeadTier, input: LeadScoreInput): string {
  if (tier === "Hot") {
    return "تواصل فوراً عبر القناة المفضلة. جدولة المعاينة خلال 24 ساعة. جهّز جميع تفاصيل العقار ووثائق الملكية.";
  } else if (tier === "Warm") {
    return "أرسل العقارات المطابقة ذات الصلة. تابع خلال 2-3 أيام. قدم جولة افتراضية أو معلومات تفصيلية عن العقار.";
  } else {
    return "أضف إلى تسلسل التنشئة. شارك رؤى السوق والقوائم الجديدة. تحقق من الميزانية والجدول الزمني في التفاعل التالي.";
  }
}

function calculatePriority(tier: LeadTier, score: number, responseTime?: number): number {
  let priority = tier === "Hot" ? 100 : tier === "Warm" ? 60 : 20;

  priority += Math.round(score / 10);

  if (responseTime !== undefined && responseTime <= 5) {
    priority += 10;
  }

  return Math.min(priority, 100);
}

export function sortLeadsByPriority(leads: LeadScoreResult[]): LeadScoreResult[] {
  return leads.sort((a, b) => b.priority - a.priority);
}

export function filterHotLeads(leads: LeadScoreResult[]): LeadScoreResult[] {
  return leads.filter(lead => lead.tier === "Hot");
}

export function getLeadStats(leads: LeadScoreResult[]): {
  total: number;
  hotCount: number;
  warmCount: number;
  coldCount: number;
  avgScore: number;
  avgConversionProb: number;
} {
  return {
    total: leads.length,
    hotCount: leads.filter(l => l.tier === "Hot").length,
    warmCount: leads.filter(l => l.tier === "Warm").length,
    coldCount: leads.filter(l => l.tier === "Cold").length,
    avgScore: Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length),
    avgConversionProb: Math.round(leads.reduce((sum, l) => sum + l.conversionProbability, 0) / leads.length * 100),
  };
}