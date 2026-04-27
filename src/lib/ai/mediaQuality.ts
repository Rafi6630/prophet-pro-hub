export interface ImageQualityResult {
  url: string;
  qualityScore: number;        // 0-100
  qualityLabel: "Excellent" | "Good" | "Fair" | "Poor";
  qualityLabelAr: string;
  trustImpact: "positive" | "neutral" | "negative";
  trustImpactAr: string;
  issues: string[];
  issuesAr: string[];
  warning?: string;
  warningAr?: string;
}

export interface MediaQualityReport {
  overallScore: number;
  overallLabel: "Excellent" | "Good" | "Fair" | "Poor";
  overallLabelAr: string;
  hasTrustWarning: boolean;
  trustWarningMessage?: string;
  trustWarningMessageAr?: string;
  images: ImageQualityResult[];
  recommendations: string[];
  recommendationsAr: string[];
}

// Deterministic scoring from URL and index — consistent across renders
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function scoreFromUrl(url: string, index: number, totalImages: number): number {
  const base = hashString(url) % 35; // 0-34 deterministic variation

  // Deductions from URL patterns
  let score = 78 + base; // 78-100 starting range

  // Stock photo indicators
  if (/unsplash|pexels|pixabay|stock|placeholder|lorem/i.test(url)) score -= 25;
  // Low resolution hints
  if (/thumb|small|xs|tiny|64|128/i.test(url)) score -= 15;
  // No extension (possibly dynamically generated)
  if (!/\.(jpg|jpeg|png|webp|avif)/i.test(url)) score -= 5;
  // CDN-hosted (usually quality)
  if (/cdn|cloudflare|cloudinary|imgix/i.test(url)) score += 5;

  // Too few images for the listing
  if (totalImages < 3) score -= 10;
  if (totalImages === 1) score -= 15;

  // First image matters most; later images tend to be supplemental
  if (index === 0) score += 5;

  return Math.min(Math.max(Math.round(score), 30), 98);
}

function getQualityLabel(score: number): { en: ImageQualityResult["qualityLabel"]; ar: string } {
  if (score >= 80) return { en: "Excellent", ar: "ممتاز" };
  if (score >= 65) return { en: "Good",      ar: "جيد" };
  if (score >= 45) return { en: "Fair",      ar: "مقبول" };
  return              { en: "Poor",      ar: "ضعيف" };
}

function getIssues(url: string, score: number): { en: string[]; ar: string[] } {
  const en: string[] = [];
  const ar: string[] = [];

  if (/unsplash|pexels|pixabay|stock/i.test(url)) {
    en.push("Possible stock photo — may not represent actual property");
    ar.push("صورة مخزون محتملة — قد لا تمثّل العقار الفعلي");
  }
  if (/thumb|small|xs|64|128/i.test(url)) {
    en.push("Low resolution detected — hard to verify property details");
    ar.push("دقة منخفضة مكتشفة — يصعب التحقق من تفاصيل العقار");
  }
  if (score < 50) {
    en.push("Image quality may affect buyer trust significantly");
    ar.push("جودة الصورة قد تؤثر بشكل كبير على ثقة المشتري");
  }

  return { en, ar };
}

function getTrustImpact(score: number): {
  impact: ImageQualityResult["trustImpact"];
  impactAr: string;
  warning?: string;
  warningAr?: string;
} {
  if (score >= 75) return { impact: "positive", impactAr: "إيجابي" };
  if (score >= 50) return { impact: "neutral",  impactAr: "محايد" };
  return {
    impact: "negative",
    impactAr: "سلبي",
    warning: "This image may look misleading or low quality to buyers",
    warningAr: "قد تبدو هذه الصورة مضللة أو منخفضة الجودة للمشترين",
  };
}

export function analyzeMediaQuality(
  imageUrls: string[],
  hasDuplicateImages = false
): MediaQualityReport {
  if (imageUrls.length === 0) {
    return {
      overallScore: 20,
      overallLabel: "Poor",
      overallLabelAr: "ضعيف",
      hasTrustWarning: true,
      trustWarningMessage: "No images provided — buyers are significantly less likely to inquire",
      trustWarningMessageAr: "لم يتم توفير صور — من غير المرجح أن يستفسر المشترون",
      images: [],
      recommendations: [
        "Add at least 5 high-quality photos of the property",
        "Include exterior, living areas, kitchen, and bedroom shots",
        "Ensure photos are taken in good natural light",
      ],
      recommendationsAr: [
        "أضف ما لا يقل عن 5 صور عالية الجودة للعقار",
        "ضع صوراً للواجهة الخارجية والمعيشة والمطبخ وغرفة النوم",
        "تأكد من التقاط الصور في ضوء طبيعي جيد",
      ],
    };
  }

  const images: ImageQualityResult[] = imageUrls.map((url, i) => {
    const score = scoreFromUrl(url, i, imageUrls.length);
    const label = getQualityLabel(score);
    const issues = getIssues(url, score);
    const trustData = getTrustImpact(score);

    return {
      url,
      qualityScore: score,
      qualityLabel: label.en,
      qualityLabelAr: label.ar,
      trustImpact: trustData.impact,
      trustImpactAr: trustData.impactAr,
      issues: issues.en,
      issuesAr: issues.ar,
      warning: trustData.warning,
      warningAr: trustData.warningAr,
    };
  });

  let overallScore = Math.round(images.reduce((s, img) => s + img.qualityScore, 0) / images.length);

  // Penalty for duplicate images
  if (hasDuplicateImages) overallScore = Math.max(overallScore - 15, 10);
  // Penalty for too few images
  if (imageUrls.length < 3) overallScore = Math.max(overallScore - 10, 10);

  const overallLabel = getQualityLabel(overallScore);
  const negativeImages = images.filter((img) => img.trustImpact === "negative");
  const hasTrustWarning = negativeImages.length > 0 || overallScore < 50 || hasDuplicateImages;

  let trustWarningMessage: string | undefined;
  let trustWarningMessageAr: string | undefined;

  if (hasDuplicateImages) {
    trustWarningMessage = "Duplicate images detected — buyers may question authenticity";
    trustWarningMessageAr = "تم اكتشاف صور مكررة — قد يشكّك المشترون في الأصالة";
  } else if (overallScore < 50) {
    trustWarningMessage = `${negativeImages.length} image(s) appear low quality or potentially misleading — this may reduce buyer trust`;
    trustWarningMessageAr = `${negativeImages.length} صورة تبدو منخفضة الجودة أو مضللة — قد يقلل هذا من ثقة المشتري`;
  } else if (negativeImages.length > 0) {
    trustWarningMessage = `${negativeImages.length} image(s) could negatively impact buyer confidence`;
    trustWarningMessageAr = `${negativeImages.length} صورة قد تؤثر سلباً على ثقة المشتري`;
  }

  const recommendations: string[] = [];
  const recommendationsAr: string[] = [];

  if (imageUrls.length < 5) {
    recommendations.push("Add more photos — listings with 8+ images get 3× more inquiries");
    recommendationsAr.push("أضف المزيد من الصور — الإعلانات التي تحتوي على 8+ صور تحصل على 3× استفسارات أكثر");
  }
  if (hasDuplicateImages) {
    recommendations.push("Remove duplicate photos to improve authenticity signals");
    recommendationsAr.push("أزل الصور المكررة لتحسين إشارات الأصالة");
  }
  if (overallScore < 70) {
    recommendations.push("Replace low-quality images with high-resolution originals (min 1080p)");
    recommendationsAr.push("استبدل الصور منخفضة الجودة بصور أصلية عالية الدقة (1080p كحد أدنى)");
    recommendations.push("Take photos during daylight with a smartphone or professional camera");
    recommendationsAr.push("التقط الصور في وضح النهار باستخدام هاتف ذكي أو كاميرا احترافية");
  }
  if (recommendations.length === 0) {
    recommendations.push("Media quality looks strong — keep images updated seasonally");
    recommendationsAr.push("جودة الوسائط تبدو قوية — حافظ على تحديث الصور موسمياً");
  }

  return {
    overallScore,
    overallLabel: overallLabel.en,
    overallLabelAr: overallLabel.ar,
    hasTrustWarning,
    trustWarningMessage,
    trustWarningMessageAr,
    images,
    recommendations,
    recommendationsAr,
  };
}
