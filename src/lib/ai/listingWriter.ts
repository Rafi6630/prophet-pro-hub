export interface ListingWriterInput {
  propertyType: string;
  city: string;
  district?: string;
  size: number;
  bedrooms?: number;
  bathrooms?: number;
  condition?: "poor" | "average" | "good" | "excellent";
  features?: string[];
  amenities?: string[];
  notes?: string;
  sellerNotes?: string;
  targetAudience?: "buyer" | "investor" | "renter";
}

export interface GeneratedListing {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  keyHighlights: string[];
  keyHighlightsAr: string[];
  seoKeywords: string[];
  seoKeywordsAr: string[];
  callToAction: string;
  callToActionAr: string;
  quality: "premium" | "standard" | "basic";
  improvementSuggestions: string[];
}

const CITY_ARABIC_NAMES: Record<string, string> = {
  baghdad: "بغداد",
  erbil: "إربيل",
  basra: "البصرة",
  mosul: "الموصل",
  najaf: "النجف",
  karbala: "كربلاء",
  sulaymaniyah: "السليمانية",
  kirkuk: "كركوك",
  Duhok: "دهوك",
};

const PROPERTY_TYPE_ARABIC: Record<string, string> = {
  villa: "فيلا",
  apartment: "شقة",
  house: "منزل",
  land: "أرض",
  commercial: "تجاري",
  industrial: "صناعي",
};

const PROPERTY_TYPE_PLURAL_ARABIC: Record<string, string> = {
  villa: "فلل",
  apartment: "شقق",
  house: "منازل",
  land: "أراضٍ",
  commercial: "مساحات تجارية",
  industrial: "مساحات صناعية",
};

const FEATURE_ADJECTIVES_EN: Record<string, string[]> = {
  villa: ["luxurious", "spacious", "modern", "prestigious", "elegant"],
  apartment: ["stylish", "cozy", "modern", "well-designed", "compact"],
  house: ["charming", "spacious", "family-friendly", "well-maintained", "inviting"],
  land: ["prime", "strategic", "rare", "valuable", "prime-location"],
  commercial: ["high-traffic", "prime-location", "established", "profitable", "versatile"],
};

const FEATURE_ADJECTIVES_AR: Record<string, string[]> = {
  villa: ["فاخرة", "واسعة", "عصرية", "مرموقة", "أنيقة"],
  apartment: ["أنيقة", "مريحة", "عصرية", "مصممة بشكل جيد", "مدمجة"],
  house: ["ساحرة", "واسعة", "مناسبة للعائلة", "مصونة جيداً", "ودودة"],
  land: ["مميزة", "استراتيجية", "نادرة", "قيّمة", "موقع رئيسي"],
  commercial: ["حركة مرور عالية", "موقع رئيسي", "راسخة", "مربحة", "متعددة الاستخدامات"],
};

export function generateListingContent(input: ListingWriterInput): GeneratedListing {
  const propertyTypeAr = PROPERTY_TYPE_ARABIC[input.propertyType.toLowerCase()] || input.propertyType;
  const pluralTypeAr = PROPERTY_TYPE_PLURAL_ARABIC[input.propertyType.toLowerCase()] || propertyTypeAr;
  const cityAr = CITY_ARABIC_NAMES[input.city.toLowerCase()] || input.city;

  const adjectives = FEATURE_ADJECTIVES_EN[input.propertyType.toLowerCase()] || ["quality"];
  const adjectiveAr = FEATURE_ADJECTIVES_AR[input.propertyType.toLowerCase()] || ["ممتازة"];

  const title = buildTitle(input, adjectives);
  const titleAr = buildTitleAr(input, propertyTypeAr, cityAr, adjectiveAr);
  const description = buildDescription(input, adjectives);
  const descriptionAr = buildDescriptionAr(input, propertyTypeAr, cityAr, adjectiveAr);
  const keyHighlights = buildHighlights(input);
  const keyHighlightsAr = buildHighlightsAr(input, propertyTypeAr);
  const seoKeywords = buildSeoKeywords(input);
  const seoKeywordsAr = buildSeoKeywordsAr(input, propertyTypeAr, cityAr);
  const callToAction = buildCallToAction(input);
  const callToActionAr = buildCallToActionAr(input, propertyTypeAr);
  const improvementSuggestions = buildImprovementSuggestions(input);

  const quality = determineQuality(input);

  return {
    title,
    titleAr,
    description,
    descriptionAr,
    keyHighlights,
    keyHighlightsAr,
    seoKeywords,
    seoKeywordsAr,
    callToAction,
    callToActionAr,
    quality,
    improvementSuggestions,
  };
}

function buildTitle(input: ListingWriterInput, adjectives: string[]): string {
  const parts: string[] = [];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];

  if (input.bedrooms) {
    parts.push(`${input.bedrooms}-Bed`);
  }

  parts.push(input.propertyType.charAt(0).toUpperCase() + input.propertyType.slice(1));

  if (input.condition === "excellent" || input.condition === "good") {
    parts.push(adj);
  }

  parts.push("in");

  if (input.district) {
    parts.push(`${input.district},`);
  }

  parts.push(input.city);

  if (input.features?.includes("furnished")) {
    parts.push("with Furniture");
  }

  return parts.join(" ");
}

function buildTitleAr(input: ListingWriterInput, propertyTypeAr: string, cityAr: string, adjectiveAr: string[]): string {
  const parts: string[] = [];

  if (input.condition === "excellent" || input.condition === "good") {
    const adj = adjectiveAr[Math.floor(Math.random() * adjectiveAr.length)];
    parts.push(adj);
  }

  if (input.bedrooms) {
    parts.push(`${input.propertyType === "apartment" ? "شقة" : "فيلا"}`);
    parts.push(`${input.bedrooms} غرف نوم`);
  } else {
    parts.push(propertyTypeAr);
  }

  parts.push("في");

  if (input.district) {
    parts.push(`${input.district} -`);
  }

  parts.push(cityAr);

  if (input.features?.includes("furnished")) {
    parts.push("مفروشة");
  }

  return parts.join(" ");
}

function buildDescription(input: ListingWriterInput, adjectives: string[]): string {
  const lines: string[] = [];

  const adj = adjectives[0];
  
  lines.push(`This ${adj} ${input.propertyType} offers an exceptional opportunity in ${input.city}${input.district ? `, ${input.district}` : ""}.`);

  if (input.size) {
    lines.push(`Spanning ${input.size.toLocaleString()} square meters, this property provides ample space for comfortable living or investment purposes.`);
  }

  if (input.bedrooms || input.bathrooms) {
    const roomDetails: string[] = [];
    if (input.bedrooms) roomDetails.push(`${input.bedrooms} bedrooms`);
    if (input.bathrooms) roomDetails.push(`${input.bathrooms} bathrooms`);
    lines.push(`The property features ${roomDetails.join(" and ")}${input.condition ? `, maintained in ${input.condition} condition` : ""}.`);
  }

  if (input.features && input.features.length > 0) {
    lines.push(`Key features include: ${input.features.join(", ")}.`);
  }

  if (input.amenities && input.amenities.length > 0) {
    lines.push(`Additional amenities: ${input.amenities.join(", ")}.`);
  }

  if (input.sellerNotes) {
    lines.push(`\n${input.sellerNotes}`);
  }

  lines.push(`This ${input.propertyType} is ideally positioned for ${input.targetAudience === "investor" ? "investment returns and rental income" : "families seeking a quality home in a prime location"}.`);

  return lines.join(" ");
}

function buildDescriptionAr(input: ListingWriterInput, propertyTypeAr: string, cityAr: string, adjectiveAr: string[]): string {
  const lines: string[] = [];

  const adj = adjectiveAr[0];
  
  lines.push(`توفر هذه ${adj} ${propertyTypeAr} فرصة استثنائية في ${cityAr}${input.district ? `، ${input.district}` : ""}.`);

  if (input.size) {
    lines.push(`تمتد على مساحة ${input.size.toLocaleString()} متر مربع، مما يوفر مساحة واسعة${input.targetAudience === "investor" ? "لأغراض الاستثمار والإيجار" : "للعيش المريح"}.`);
  }

  if (input.bedrooms || input.bathrooms) {
    const roomDetails: string[] = [];
    if (input.bedrooms) roomDetails.push(`${input.bedrooms} غرف نوم`);
    if (input.bathrooms) roomDetails.push(`${input.bathrooms} حمامات`);
    lines.push(`يتميز العقار بـ ${roomDetails.join(" و ")}${input.condition ? `، بحالة ${getConditionAr(input.condition)}` : ""}.`);
  }

  if (input.features && input.features.length > 0) {
    lines.push(`تشمل الميزات الرئيسية: ${translateFeaturesToAr(input.features).join("، ")}.`);
  }

  if (input.amenities && input.amenities.length > 0) {
    lines.push(`مرافق إضافية: ${translateFeaturesToAr(input.amenities).join("، ")}.`);
  }

  if (input.sellerNotes) {
    lines.push(`\n${input.sellerNotes}`);
  }

  lines.push(`هذه ${propertyTypeAr} مثالية${input.targetAudience === "investor" ? "للعوائد الاستثمارية والدخل الإيجاري" : "للعائلات التي تبحث عن منزل عالي الجودة في موقع رئيسي"}.`);

  return lines.join(" ");
}

function buildHighlights(input: ListingWriterInput): string[] {
  const highlights: string[] = [];

  highlights.push(`${input.size.toLocaleString()} sqm ${input.propertyType}`);
  
  if (input.bedrooms) {
    highlights.push(`${input.bedrooms} Bedrooms`);
  }
  
  if (input.bathrooms) {
    highlights.push(`${input.bathrooms} Bathrooms`);
  }

  if (input.condition) {
    highlights.push(`${input.condition.charAt(0).toUpperCase() + input.condition.slice(1)} Condition`);
  }

  if (input.features) {
    input.features.slice(0, 4).forEach(f => {
      highlights.push(formatFeatureName(f));
    });
  }

  if (input.district) {
    highlights.push(`${input.district} District`);
  }

  return highlights;
}

function buildHighlightsAr(input: ListingWriterInput, propertyTypeAr: string): string[] {
  const highlights: string[] = [];

  highlights.push(`${input.size.toLocaleString()} م² ${propertyTypeAr}`);
  
  if (input.bedrooms) {
    highlights.push(`${input.bedrooms} غرف نوم`);
  }
  
  if (input.bathrooms) {
    highlights.push(`${input.bathrooms} حمامات`);
  }

  if (input.condition) {
    highlights.push(`حالة ${getConditionAr(input.condition)}`);
  }

  if (input.features) {
    input.features.slice(0, 4).forEach(f => {
      highlights.push(translateFeatureToAr(f));
    });
  }

  if (input.district) {
    highlights.push(`حي ${input.district}`);
  }

  return highlights;
}

function buildSeoKeywords(input: ListingWriterInput): string[] {
  const keywords: string[] = [];

  keywords.push(`${input.propertyType} ${input.city}`);
  keywords.push(`${input.propertyType} for sale ${input.city}`);
  
  if (input.district) {
    keywords.push(`${input.propertyType} ${input.district} ${input.city}`);
  }

  if (input.bedrooms) {
    keywords.push(`${input.bedrooms} bedroom ${input.propertyType}`);
  }

  keywords.push(`real estate ${input.city}`);
  keywords.push(`property investment ${input.city}`);

  if (input.condition === "excellent" || input.condition === "good") {
    keywords.push(`premium ${input.propertyType}`);
    keywords.push(`luxury ${input.propertyType}`);
  }

  return keywords;
}

function buildSeoKeywordsAr(input: ListingWriterInput, propertyTypeAr: string, cityAr: string): string[] {
  const keywords: string[] = [];

  keywords.push(`${propertyTypeAr} ${cityAr}`);
  keywords.push(`${propertyTypeAr} للبيع في ${cityAr}`);
  
  if (input.district) {
    keywords.push(`${propertyTypeAr} في ${input.district} ${cityAr}`);
  }

  if (input.bedrooms) {
    keywords.push(`${input.bedrooms} غرف نوم ${propertyTypeAr}`);
  }

  keywords.push(`عقارات ${cityAr}`);
  keywords.push(`استثمار عقاري ${cityAr}`);

  if (input.condition === "excellent" || input.condition === "good") {
    keywords.push(`${propertyTypeAr} فاخرة`);
  }

  return keywords;
}

function buildCallToAction(input: ListingWriterInput): string {
  if (input.targetAudience === "investor") {
    return "Contact us today to schedule a viewing and explore this investment opportunity.";
  }
  return `Schedule a viewing today and experience everything this ${input.propertyType} has to offer.`;
}

function buildCallToActionAr(input: ListingWriterInput, propertyTypeAr: string): string {
  if (input.targetAudience === "investor") {
    return "تواصل معنا اليوم لتحديد موعد للمعاينة واستكشاف فرصة الاستثمار هذه.";
  }
  return `حدد موعداً للمعاينة اليوم واستمتع بكل ما تقدمه هذه ${propertyTypeAr}.`;
}

function buildImprovementSuggestions(input: ListingWriterInput): string[] {
  const suggestions: string[] = [];

  if (!input.district) {
    suggestions.push("Add specific district or neighborhood for better visibility");
  }

  if (!input.bedrooms && !input.bathrooms) {
    suggestions.push("Include bedroom and bathroom count for more attractive listing");
  }

  if (!input.condition) {
    suggestions.push("Specify property condition to set proper expectations");
  }

  if (!input.features || input.features.length < 3) {
    suggestions.push("Add more property features (parking, garden, security, etc.)");
  }

  if (!input.sellerNotes) {
    suggestions.push("Add personal notes about the property (neighborhood, nearby facilities)");
  }

  if (!input.amenities || input.amenities.length === 0) {
    suggestions.push("List nearby amenities (schools, markets, hospitals)");
  }

  if (input.size && input.size < 100) {
    suggestions.push("Highlight the efficient use of space in your description");
  }

  return suggestions;
}

function determineQuality(input: ListingWriterInput): "premium" | "standard" | "basic" {
  let score = 0;

  if (input.district) score += 20;
  if (input.bedrooms) score += 15;
  if (input.bathrooms) score += 10;
  if (input.condition) score += 15;
  if (input.features && input.features.length >= 3) score += 20;
  if (input.amenities && input.amenities.length >= 3) score += 15;
  if (input.sellerNotes) score += 10;

  if (score >= 75) return "premium";
  if (score >= 45) return "standard";
  return "basic";
}

function formatFeatureName(feature: string): string {
  return feature
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^./, str => str.toUpperCase());
}

function translateFeatureToAr(feature: string): string {
  const translations: Record<string, string> = {
    furnished: "مفروشة",
    parking: "موقف سيارات",
    garden: "حديقة",
    pool: "مسبح",
    security: "أمن",
    elevator: "مصعد",
    gym: "صالة رياضية",
    balcony: "شرفة",
    "central-heating": "تدفئة مركزية",
    "air-conditioning": "تكييف",
  };
  return translations[feature.toLowerCase()] || feature;
}

function translateFeaturesToAr(features: string[]): string[] {
  return features.map(f => translateFeatureToAr(f));
}

function getConditionAr(condition: string): string {
  const conditions: Record<string, string> = {
    poor: "متدنية",
    average: "متوسطة",
    good: "جيدة",
    excellent: "ممتازة",
  };
  return conditions[condition] || condition;
}

export function improveExistingListing(
  currentTitle: string,
  currentDescription: string,
  improvements: string[]
): GeneratedListing {
  const title = currentTitle;
  const titleAr = currentTitle;
  
  const description = currentDescription;
  const descriptionAr = currentDescription;

  return {
    title,
    titleAr,
    description,
    descriptionAr,
    keyHighlights: [],
    keyHighlightsAr: [],
    seoKeywords: [],
    seoKeywordsAr: [],
    callToAction: buildCallToAction({ propertyType: "property", city: "Iraq" }),
    callToActionAr: buildCallToActionAr({ propertyType: "العقار", city: "العراق" }, "العقار"),
    quality: "standard",
    improvementSuggestions: improvements,
  };
}