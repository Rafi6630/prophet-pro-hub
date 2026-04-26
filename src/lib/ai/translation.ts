export type TranslationDirection = "en-ar" | "ar-en" | "en-ku" | "ku-en" | "ar-ku" | "ku-ar";

export interface TranslationResult {
  original: string;
  translated: string;
  direction: TranslationDirection;
  confidence: number;
  quality: "high" | "medium" | "low";
  alternatives?: string[];
}

export interface ListingTranslation {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  highlights: string[];
  highlightsAr: string[];
  features: string[];
  featuresAr: string[];
  seoKeywords: string[];
  seoKeywordsAr: string[];
  quality: "premium" | "standard" | "basic";
}

const IRAQI_ARABIC_REPLACEMENTS: Record<string, string> = {
  "apartment": "شقة",
  "villa": "فيلا",
  "house": "بيت",
  "land": "أرض",
  "bedroom": "غرفة نوم",
  "bathroom": "حمام",
  "kitchen": "مطبخ",
  "living room": "صالة",
  "parking": "موقف",
  "furnished": "مفروش",
  "unfurnished": "غير مفروش",
  "for sale": "للبيع",
  "for rent": "للإيجار",
  "price": "السعر",
  "area": "المساحة",
  "location": "الموقع",
  "city": "المدينة",
  "district": "الحي",
  "building": "بناء",
  "floor": "طابق",
  "new": "جديد",
  "used": "مستخدم",
  "good condition": "حالة جيدة",
  "excellent condition": "حالة ممتازة",
  "investment": "استثمار",
  "commercial": "تجاري",
  "residential": "سكني",
  "garden": "حديقة",
  "balcony": "شرفة",
  "air conditioning": "تكييف",
  "heating": "تدفئة",
  "security": "أمن",
  "elevator": "مصعد",
  "swimming pool": "مسبح",
  "gym": "صالة رياضية",
  "mosque": "مسجد",
  "school": "مدرسة",
  "hospital": "مستشفى",
  "market": "سوق",
  "mall": "مركز تجاري",
  "Baghdad": "بغداد",
  "Erbil": "إربيل",
  "Basra": "البصرة",
  "Mosul": "الموصل",
  "Najaf": "النجف",
  "Karbala": "كربلاء",
  "Sulaimaniyah": "السليمانية",
  "Kirkuk": "كركوك",
};

const KURDISH_EQUIVALENTS: Record<string, string> = {
  "Baghdad": "Baghdad",
  "Erbil": "Hewlêr",
  "Basra": "Basra",
  "Mosul": "Mosul",
  "Najaf": "Necef",
  "property": "خاو",
  "house": "سەیی",
  "apartment": "شەقە",
  "land": "زەوی",
  "for sale": "بۆ فرۆشتن",
  "price": "نرخ",
  "bedroom": "ژووری نوستن",
  "bathroom": "ژووری هەڵدان",
};

export function translateText(text: string, direction: TranslationDirection): TranslationResult {
  const confidence = calculateConfidence(text, direction);
  const quality = getQuality(confidence);

  let translated: string;

  switch (direction) {
    case "en-ar":
      translated = translateToArabic(text);
      break;
    case "ar-en":
      translated = translateToEnglish(text);
      break;
    case "en-ku":
      translated = translateToKurdish(text);
      break;
    case "ku-en":
      translated = translateFromKurdish(text);
      break;
    case "ar-ku":
      const enText = translateToEnglish(text);
      translated = translateToKurdish(enText);
      break;
    case "ku-ar":
      const enTextFromKu = translateFromKurdish(text);
      translated = translateToArabic(enTextFromKu);
      break;
    default:
      translated = text;
  }

  return {
    original: text,
    translated,
    direction,
    confidence,
    quality,
  };
}

export function translateListing(
  title: string,
  description: string,
  features: string[],
  highlights: string[]
): ListingTranslation {
  const titleAr = translateToArabic(title);
  const descriptionAr = translateToArabic(description);
  const featuresAr = features.map(f => translateToArabic(f));
  const highlightsAr = highlights.map(h => translateToArabic(h));

  const seoKeywords = extractSeoKeywords(title, description);
  const seoKeywordsAr = seoKeywords.map(k => translateToArabic(k));

  const quality = determineTranslationQuality(titleAr, descriptionAr, featuresAr);

  return {
    title,
    titleAr,
    description,
    descriptionAr,
    highlights,
    highlightsAr,
    features,
    featuresAr,
    seoKeywords,
    seoKeywordsAr,
    quality,
  };
}

function translateToArabic(text: string): string {
  let translated = text;

  for (const [en, ar] of Object.entries(IRAQI_ARABIC_REPLACEMENTS)) {
    const regex = new RegExp(`\\b${en}\\b`, "gi");
    translated = translated.replace(regex, ar);
  }

  translated = normalizeArabicText(translated);

  return translated;
}

function translateToEnglish(text: string): string {
  let translated = text;

  for (const [en, ar] of Object.entries(IRAQI_ARABIC_REPLACEMENTS)) {
    const regex = new RegExp(`\\b${ar}\\b`, "gi");
    translated = translated.replace(regex, en);
  }

  translated = normalizeEnglishText(translated);

  return translated;
}

function translateToKurdish(text: string): string {
  let translated = text;

  for (const [en, ku] of Object.entries(KURDISH_EQUIVALENTS)) {
    const regex = new RegExp(`\\b${en}\\b`, "gi");
    translated = translated.replace(regex, ku);
  }

  return translated;
}

function translateFromKurdish(text: string): string {
  let translated = text;

  for (const [en, ku] of Object.entries(KURDISH_EQUIVALENTS)) {
    const regex = new RegExp(`\\b${ku}\\b`, "gi");
    translated = translated.replace(regex, en);
  }

  return translated;
}

function normalizeArabicText(text: string): string {
  let normalized = text;

  normalized = normalized.replace(/هٔ/g, "ة");
  normalized = normalized.replace(/أ/g, "ا");
  normalized = normalized.replace(/إ/g, "ا");
  normalized = normalized.replace(/آ/g, "ا");

  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

function normalizeEnglishText(text: string): string {
  let normalized = text;

  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

function calculateConfidence(text: string, direction: TranslationDirection): number {
  let confidence = 0.8;

  if (direction.includes("ar")) {
    const arabicChars = text.match(/[\u0600-\u06FF]/g) || [];
    if (arabicChars.length > text.length * 0.3) {
      confidence += 0.1;
    }
  }

  const knownTerms = Object.keys(IRAQI_ARABIC_REPLACEMENTS);
  const matches = knownTerms.filter(term => text.toLowerCase().includes(term.toLowerCase()));
  confidence += matches.length * 0.02;

  if (text.length > 50) confidence += 0.05;
  if (text.length > 200) confidence += 0.05;

  return Math.min(confidence, 0.98);
}

function getQuality(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 0.85) return "high";
  if (confidence >= 0.65) return "medium";
  return "low";
}

function extractSeoKeywords(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const keywords: string[] = [];

  const propertyTypes = ["apartment", "villa", "house", "land", "commercial"];
  propertyTypes.forEach(type => {
    if (text.includes(type)) keywords.push(type);
  });

  const cities = ["baghdad", "erbil", "basra", "mosul", "najaf", "karbala", "sulaimaniyah"];
  cities.forEach(city => {
    if (text.includes(city)) keywords.push(city);
  });

  const features = ["furnished", "parking", "garden", "security", "elevator"];
  features.forEach(feature => {
    if (text.includes(feature)) keywords.push(feature);
  });

  keywords.push("for sale", "real estate", "property investment");

  return [...new Set(keywords)];
}

function determineTranslationQuality(
  titleAr: string,
  descriptionAr: string,
  featuresAr: string[]
): "premium" | "standard" | "basic" {
  let score = 0;

  if (titleAr.length > 10) score += 20;
  if (descriptionAr.length > 100) score += 30;
  if (featuresAr.length >= 3) score += 25;
  if (titleAr !== titleAr.toLowerCase()) score += 15;

  if (featuresAr.every(f => f.length > 5)) score += 10;

  if (score >= 80) return "premium";
  if (score >= 50) return "standard";
  return "basic";
}

export function createBilingualListing(
  english: { title: string; description: string; features: string[] },
  arabic: { title: string; description: string; features: string[] }
): ListingTranslation {
  return {
    title: english.title,
    titleAr: arabic.title,
    description: english.description,
    descriptionAr: arabic.description,
    highlights: english.features,
    highlightsAr: arabic.features,
    features: english.features,
    featuresAr: arabic.features,
    seoKeywords: extractSeoKeywords(english.title, english.description),
    seoKeywordsAr: extractSeoKeywords(arabic.title, arabic.description),
    quality: "premium",
  };
}

export function formatPriceWithCurrency(
  price: number,
  currency: "USD" | "IQD",
  language: "en" | "ar"
): string {
  if (currency === "IQD") {
    const formatted = language === "ar" 
      ? `${(price / 1000).toFixed(0)} الف د.ع`
      : `${(price / 1000).toFixed(0)}K IQD`;
    return formatted;
  }

  const formatted = language === "ar"
    ? `${price.toLocaleString()} دولار`
    : `$${price.toLocaleString()}`;
  
  return formatted;
}

export function convertPropertyDescriptionToArabic(
  title: string,
  description: string,
  features: string[],
  highlights: string[]
): ListingTranslation {
  return translateListing(title, description, features, highlights);
}