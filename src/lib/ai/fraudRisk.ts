export interface FraudCheckInput {
  price: number;
  pricePerSqm: number;
  marketAverage: number;
  sellerVerified: boolean;
  sellerListingsCount: number;
  sellerAccountAge: number;
  hasAllDocuments: boolean;
  imagesCount: number;
  descriptionLength: number;
  phoneNumbers: string[];
  hasDuplicateImages: boolean;
  coordinates?: { lat: number; lng: number };
  propertyType: string;
  areaDemand: number;
  daysOnMarket: number;
  priceHistory: number[];
  title: string;
  description: string;
}

export interface FraudRiskResult {
  riskLevel: "Low" | "Medium" | "High";
  riskScore: number;
  riskScorePercent: number;
  flags: FraudFlag[];
  recommendations: string[];
  recommendationsAr: string[];
  isSuspicious: boolean;
  verificationChecks: VerificationCheck[];
}

export interface FraudFlag {
  type: "critical" | "warning" | "info";
  category: string;
  categoryAr: string;
  message: string;
  messageAr: string;
  severity: number;
}

export interface VerificationCheck {
  check: string;
  checkAr: string;
  passed: boolean;
  details: string;
  detailsAr: string;
}

const PRICE_DEVIATION_THRESHOLD = 0.3;
const MIN_IMAGES = 3;
const MIN_DESCRIPTION_LENGTH = 100;
const MAX_LISTINGS_PER_SELLER = 20;
const MIN_ACCOUNT_AGE_DAYS = 7;

export function detectFraudRisk(input: FraudCheckInput): FraudRiskResult {
  const flags: FraudFlag[] = [];
  let totalScore = 0;
  
  flags.push(...checkPriceAnomalies(input));
  flags.push(...checkSellerBehavior(input));
  flags.push(...checkListingQuality(input));
  flags.push(...checkImageIntegrity(input));
  flags.push(...checkDocumentCompleteness(input));

  flags.forEach((flag) => {
    totalScore += flag.severity;
  });

  const normalizedScore = Math.min(Math.max(totalScore, 0), 100);
  const riskLevel = getRiskLevel(normalizedScore);

  const verificationChecks = performVerificationChecks(input);
  const recommendations = generateRecommendations(flags, riskLevel);
  const recommendationsAr = recommendations.map(translateRecommendation);

  return {
    riskLevel,
    riskScore: normalizedScore,
    riskScorePercent: normalizedScore,
    flags,
    recommendations,
    recommendationsAr,
    isSuspicious: riskLevel === "High" || normalizedScore > 60,
    verificationChecks,
  };
}

function checkPriceAnomalies(input: FraudCheckInput): FraudFlag[] {
  const flags: FraudFlag[] = [];
  
  const priceVsMarket = Math.abs(input.pricePerSqm - input.marketAverage) / input.marketAverage;
  if (priceVsMarket > PRICE_DEVIATION_THRESHOLD) {
    const isTooLow = input.pricePerSqm < input.marketAverage;
    flags.push({
      type: isTooLow ? "warning" : "info",
      category: "Pricing",
      categoryAr: "التسعير",
      message: isTooLow
        ? `Price is ${(priceVsMarket * 100).toFixed(0)}% below market average - verify reason`
        : `Price is ${(priceVsMarket * 100).toFixed(0)}% above market average`,
      messageAr: isTooLow
        ? `السعر أقل من متوسط السوق بنسبة ${(priceVsMarket * 100).toFixed(0)}% - تحقق من السبب`
        : `السعر أعلى من متوسط السوق بنسبة ${(priceVsMarket * 100).toFixed(0)}%`,
      severity: isTooLow ? 25 : 10,
    });
  }

  if (input.priceHistory.length >= 2) {
    const changes = input.priceHistory.slice(1).map((p, i) => 
      Math.abs(p - input.priceHistory[i]) / input.priceHistory[i]
    );
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    if (avgChange > 0.15) {
      flags.push({
        type: "warning",
        category: "Pricing",
        categoryAr: "التسعير",
        message: "Frequent price changes detected - verify pricing history",
        messageAr: "تم اكتشاف تغييرات متكررة في الأسعار - تحقق من سجل الأسعار",
        severity: 20,
      });
    }
  }

  return flags;
}

function checkSellerBehavior(input: FraudCheckInput): FraudFlag[] {
  const flags: FraudFlag[] = [];

  if (!input.sellerVerified) {
    flags.push({
      type: "warning",
      category: "Seller",
      categoryAr: "البائع",
      message: "Seller is not verified - exercise caution",
      messageAr: "البائع غير موثّق - توخّ الحذر",
      severity: 20,
    });
  }

  if (input.sellerListingsCount > MAX_LISTINGS_PER_SELLER) {
    flags.push({
      type: "info",
      category: "Seller",
      categoryAr: "البائع",
      message: `Seller has ${input.sellerListingsCount} active listings - possible agent or investor`,
      messageAr: `البائع لديه ${input.sellerListingsCount} listing نشط - قد يكون وكيلاً أو مستثمراً`,
      severity: 5,
    });
  }

  if (input.sellerAccountAge < MIN_ACCOUNT_AGE_DAYS) {
    flags.push({
      type: "warning",
      category: "Seller",
      categoryAr: "البائع",
      message: "Account is new - verify seller identity",
      messageAr: "الحساب جديد - تحقق من هوية البائع",
      severity: 15,
    });
  }

  const uniquePhones = new Set(input.phoneNumbers);
  if (uniquePhones.size > 3) {
    flags.push({
      type: "info",
      category: "Seller",
      categoryAr: "البائع",
      message: `Multiple phone numbers detected (${uniquePhones.size})`,
      messageAr: `تم اكتشاف أرقام هاتف متعددة (${uniquePhones.size})`,
      severity: 10,
    });
  }

  return flags;
}

function checkListingQuality(input: FraudCheckInput): FraudFlag[] {
  const flags: FraudFlag[] = [];

  if (input.descriptionLength < MIN_DESCRIPTION_LENGTH) {
    flags.push({
      type: "info",
      category: "Listing",
      categoryAr: "Listing",
      message: "Description is short - may lack important details",
      messageAr: "الوصف قصير - قد يفتقر إلى تفاصيل مهمة",
      severity: 5,
    });
  }

  if (input.daysOnMarket === 0) {
    flags.push({
      type: "info",
      category: "Listing",
      categoryAr: "Listing",
      message: "Just listed - monitor for suspicious activity",
      messageAr: "تم النشر للتو - راقب أي نشاط مشبوه",
      severity: 5,
    });
  }

  const suspiciousPhrases = [
    "urgent sale", "must sell", "family problem", "relocating",
    "cash only", "no questions", "deal of a lifetime"
  ];
  const hasSuspiciousPhrases = suspiciousPhrases.some(
    phrase => input.description.toLowerCase().includes(phrase) || 
              input.title.toLowerCase().includes(phrase)
  );
  if (hasSuspiciousPhrases) {
    flags.push({
      type: "warning",
      category: "Listing",
      categoryAr: "Listing",
      message: "Description contains urgency language - verify legitimacy",
      messageAr: "الوصف يحتوي على لغة استعجال - تحقق من الشرعية",
      severity: 15,
    });
  }

  return flags;
}

function checkImageIntegrity(input: FraudCheckInput): FraudFlag[] {
  const flags: FraudFlag[] = [];

  if (input.imagesCount < MIN_IMAGES) {
    flags.push({
      type: "info",
      category: "Images",
      categoryAr: "الصور",
      message: `Only ${input.imagesCount} images - limited visual verification`,
      messageAr: `فقط ${input.imagesCount} صور - تحقق بصري محدود`,
      severity: 5,
    });
  }

  if (input.hasDuplicateImages) {
    flags.push({
      type: "warning",
      category: "Images",
      categoryAr: "الصور",
      message: "Duplicate images detected - may indicate stock photos",
      messageAr: "تم اكتشاف صور مكررة - قد تشير إلى صور مخزون",
      severity: 15,
    });
  }

  return flags;
}

function checkDocumentCompleteness(input: FraudCheckInput): FraudFlag[] {
  const flags: FraudFlag[] = [];

  if (!input.hasAllDocuments) {
    flags.push({
      type: "critical",
      category: "Documents",
      categoryAr: "الوثائق",
      message: "Missing required documents - request before proceeding",
      messageAr: "وثائق مطلوبة مفقودة - اطلب قبل المتابعة",
      severity: 30,
    });
  }

  return flags;
}

function getRiskLevel(score: number): "Low" | "Medium" | "High" {
  if (score >= 50) return "High";
  if (score >= 20) return "Medium";
  return "Low";
}

function performVerificationChecks(input: FraudCheckInput): VerificationCheck[] {
  const checks: VerificationCheck[] = [];

  checks.push({
    check: "Price within market range",
    checkAr: "السعر ضمن نطاق السوق",
    passed: Math.abs(input.pricePerSqm - input.marketAverage) / input.marketAverage <= PRICE_DEVIATION_THRESHOLD,
    details: "Price deviation is within acceptable limits",
    detailsAr: "انحراف السعر ضمن الحدود المقبولة",
  });

  checks.push({
    check: "Seller verification",
    checkAr: "توثيق البائع",
    passed: input.sellerVerified,
    details: input.sellerVerified ? "Seller identity verified" : "Seller identity not verified",
    detailsAr: input.sellerVerified ? "تم التحقق من هوية البائع" : "لم يتم التحقق من هوية البائع",
  });

  checks.push({
    check: "Images are original",
    checkAr: "الصور أصلية",
    passed: !input.hasDuplicateImages,
    details: input.hasDuplicateImages ? "Some images may be duplicates" : "All images appear unique",
    detailsAr: input.hasDuplicateImages ? "قد تكون بعض الصور مكررة" : "جميع الصور تبدو فريدة",
  });

  checks.push({
    check: "Account age",
    checkAr: "عمر الحساب",
    passed: input.sellerAccountAge >= MIN_ACCOUNT_AGE_DAYS,
    details: `Account age: ${input.sellerAccountAge} days`,
    detailsAr: `عمر الحساب: ${input.sellerAccountAge} يوم`,
  });

  checks.push({
    check: "Documents complete",
    checkAr: "الوثائق مكتملة",
    passed: input.hasAllDocuments,
    details: input.hasAllDocuments ? "All required documents provided" : "Missing required documents",
    detailsAr: input.hasAllDocuments ? "تم تقديم جميع الوثائق المطلوبة" : "وثائق مطلوبة مفقودة",
  });

  return checks;
}

function generateRecommendations(flags: FraudFlag[], riskLevel: "Low" | "Medium" | "High"): string[] {
  const recommendations: string[] = [];

  if (riskLevel === "High") {
    recommendations.push("Request verification of seller identity and ownership documents");
    recommendations.push("Conduct physical inspection before any commitment");
    recommendations.push("Verify property coordinates match description");
  }

  if (riskLevel === "Medium") {
    recommendations.push("Request additional photos and documents");
    recommendations.push("Contact seller to verify listing details");
    recommendations.push("Cross-reference price with recent market data");
  }

  const criticalFlags = flags.filter(f => f.type === "critical");
  if (criticalFlags.length > 0) {
    recommendations.push("Address all critical issues before proceeding");
  }

  const hasPricingIssues = flags.some(f => f.category === "Pricing" && f.type === "warning");
  if (hasPricingIssues) {
    recommendations.push("Request explanation for pricing deviation");
  }

  if (recommendations.length === 0) {
    recommendations.push("Listing appears to meet standard verification criteria");
  }

  return recommendations;
}

function translateRecommendation(recommendation: string): string {
  if (recommendation.includes("verification of seller identity")) {
    return "اطلب التحقق من هوية البائع ووثائق الملكية";
  }
  if (recommendation.includes("physical inspection")) {
    return "إجراء فحص مادي قبل أي التزام";
  }
  if (recommendation.includes("property coordinates")) {
    return "التحقق من تطابق إحداثيات العقار مع الوصف";
  }
  if (recommendation.includes("additional photos")) {
    return "اطلب صور ووثائق إضافية";
  }
  if (recommendation.includes("Cross-reference price")) {
    return "مقارنة السعر مع بيانات السوق الحديثة";
  }
  if (recommendation.includes("Address all critical")) {
    return "معالجة جميع المشكلات الحرجة قبل المتابعة";
  }
  if (recommendation.includes("pricing deviation")) {
    return "اطلب شرحاً لانحراف التسعير";
  }
  return "Listing يفي بمعايير التحقق القياسية";
}

export function formatRiskScore(score: number): string {
  return `${score}/100`;
}