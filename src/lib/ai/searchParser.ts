export interface ParsedSearchQuery {
  city?: string;
  neighborhood?: string;
  propertyType?: string;
  budget?: {
    min?: number;
    max?: number;
    currency: string;
  };
  bedrooms?: number;
  bathrooms?: number;
  size?: {
    min?: number;
    max?: number;
  };
  keywords: string[];
  features: string[];
  verifiedOnly: boolean;
  investment: boolean;
  urgent: boolean;
  furnished: boolean;
  parking: boolean;
  garden: boolean;
  near?: string[];
  sortBy?: "price" | "date" | "size" | "score";
  sortOrder?: "asc" | "desc";
  rawQuery: string;
}

const CITY_ALIASES: Record<string, string> = {
  baghdad: "Baghdad",
  بغداد: "Baghdad",
  erbil: "Erbil",
  اربيل: "Erbil",
  إربيل: "Erbil",
  hewler: "Erbil",
  basra: "Basra",
  البصرة: "Basra",
  mosul: "Mosul",
  الموصل: "Mosul",
  najaf: "Najaf",
  النجف: "Najaf",
  karbala: "Karbala",
  كربلاء: "Karbala",
  sulaymaniyah: "Sulaimaniyah",
  slemani: "Sulaimaniyah",
  السليمانية: "Sulaimaniyah",
  kirkuk: "Kirkuk",
  كركوك: "Kirkuk",
  duhok: "Duhok",
  دهوك: "Duhok",
  amarah: "Amarah",
  العمارة: "Amarah",
  nasiriyah: "Nasiriyah",
  الناصرية: "Nasiriyah",
  hillah: "Hillah",
  الحلة: "Hillah",
  ramadi: "Ramadi",
  الرمادي: "Ramadi",
  fallujah: "Fallujah",
  الفلوجة: "Fallujah",
};

// ── Neighborhoods / districts ────────────────────────────────────────────────
export const NEIGHBORHOOD_ALIASES: Record<string, string> = {
  // Baghdad
  mansour: "Mansour",
  المنصور: "Mansour",
  karrada: "Karrada",
  الكرادة: "Karrada",
  "al-karrada": "Karrada",
  jadiriyah: "Jadiriyah",
  الجادرية: "Jadiriyah",
  "al-jadiriyah": "Jadiriyah",
  "camp sarah": "Camp Sarah",
  saidiyah: "Saidiyah",
  السيدية: "Saidiyah",
  "al-saidiyah": "Saidiyah",
  "new baghdad": "New Baghdad",
  "بغداد الجديدة": "New Baghdad",
  adhamiyah: "Adhamiyah",
  الأعظمية: "Adhamiyah",
  kadhimiya: "Kadhimiya",
  الكاظمية: "Kadhimiya",
  zayouna: "Zayouna",
  الزيونة: "Zayouna",
  "dora": "Dora",
  الدورة: "Dora",
  // Erbil
  ankawa: "Ankawa",
  عنكاوا: "Ankawa",
  "dream city": "Dream City",
  ainkawa: "Ankawa",
  "italian village": "Italian Village",
  // Basra
  "al-ashar": "Ashar",
  العشار: "Ashar",
  "al-andalus": "Andalus",
  الأندلس: "Andalus",
  // Generic
  "city center": "City Center",
  "وسط المدينة": "City Center",
  downtown: "City Center",
};

const PROPERTY_TYPE_ALIASES: Record<string, string> = {
  villa: "villa",
  فيلا: "villa",
  فلل: "villa",
  house: "house",
  منزل: "house",
  بيت: "house",
  دار: "house",
  apartment: "apartment",
  شقة: "apartment",
  flat: "apartment",
  land: "land",
  أرض: "land",
  قطعة: "land",
  plot: "land",
  commercial: "commercial",
  تجاري: "commercial",
  shop: "commercial",
  محل: "commercial",
  office: "commercial",
  مكتب: "commercial",
  warehouse: "industrial",
  industrial: "industrial",
  مستودع: "industrial",
  chalet: "chalet",
  شاليه: "chalet",
  farm: "farm",
  مزرعة: "farm",
};

const FEATURE_KEYWORDS: Record<string, string[]> = {
  furnished: ["furnished", "مفروش", "equipped", "semi-furnished", "نصف مفروش"],
  parking: ["parking", "garage", "car port", "موقف", "كراج", "موقف سيارات"],
  garden: ["garden", "yard", "outdoor", "حديقة", "lawn", "backyard", "حوش"],
  pool: ["pool", "swimming pool", "مسبح", "حوض سباحة"],
  security: ["security", "guarded", "secure", "gated", "أمن", "مسوّر", "حراسة", "كمبوند"],
  elevator: ["elevator", "lift", "مصعد"],
  balcony: ["balcony", "terrace", "شرفة", "بلكون"],
  gym: ["gym", "fitness", "صالة رياضية", "نادي رياضي"],
  generator: ["generator", "مولد", "مولد كهربائي"],
  solar: ["solar", "solar panels", "طاقة شمسية", "ألواح شمسية"],
  water_tank: ["water tank", "خزان ماء", "خزان"],
  maid_room: ["maid room", "maid's room", "غرفة خادمة", "غرفة شغالة"],
  rooftop: ["rooftop", "roof", "سطح", "روف تيراس"],
  smart_home: ["smart home", "smart", "منزل ذكي", "ذكي"],
  sea_view: ["sea view", "river view", "waterfront", "إطلالة نهر", "إطلالة بحر", "كورنيش"],
  new_construction: ["new", "brand new", "under construction", "جديد", "قيد الإنشاء", "حديث البناء"],
};

const AREA_KEYWORDS: Record<string, string> = {
  school: "school",
  schools: "school",
  hospital: "hospital",
  mosques: "mosque",
  mosque: "mosque",
  market: "market",
  supermarket: "market",
  park: "park",
  playground: "park",
};

const BUDGET_PATTERNS = [
  // "under 150k", "below $200k", "less than 500000"
  /(?:under|below|less than|max|up to|أقل من|بحد أقصى)\s*\$?\s*(\d[\d,]*)\s*(k|K|m|M|million|مليون|ألف)?/i,
  // "100k or less", "200K maximum"
  /\$?\s*(\d[\d,]*)\s*(k|K|m|M|million|مليون|ألف)\s*(?:or less|maximum|under|أو أقل)?/i,
  // "budget of 150000"
  /(?:budget|price|price range|ميزانية|سعر)\s*(?:of|is|:)?\s*\$?\s*(\d[\d,]*)\s*(?:k|K|m|M|million|مليون|ألف)?/i,
  // range "100k - 200k", "100,000 to 200,000"
  /\$?\s*(\d[\d,]*)\s*(k|K|m|M|million|مليون|ألف)?\s*(?:to|-|–|حتى)\s*\$?\s*(\d[\d,]*)\s*(k|K|m|M|million|مليون|ألف)?/i,
  // "between 100k and 200k"
  /between\s*\$?\s*(\d[\d,]*)\s*(?:and|to)?\s*\$?\s*(\d[\d,]*)/i,
  // Arabic number-only "١٥٠" (handled via normalization below)
];

const SIZE_PATTERNS = [
  /(\d+)\s*(?:sqm|square|meter|m²)/i,
  /(\d+)\s*(?:sqft|square feet)/i,
  /size\s*(?:of)?\s*(\d+)/i,
  /(\d+)\s*(?:bedroom|bed|br)/i,
];

// Normalize Arabic-Indic numerals and common abbreviations before parsing
function normalizeQuery(query: string): string {
  return query
    .replace(/[٠١٢٣٤٥٦٧٨٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/,/g, "")   // remove thousand separators
    .trim()
    .toLowerCase();
}

function extractNeighborhood(query: string): string | undefined {
  const names = Object.keys(NEIGHBORHOOD_ALIASES);
  for (const name of names) {
    if (query.includes(name)) {
      return NEIGHBORHOOD_ALIASES[name];
    }
  }
  return undefined;
}

export function parseSearchQuery(query: string): ParsedSearchQuery {
  const normalizedQuery = normalizeQuery(query);
  const result: ParsedSearchQuery = {
    keywords: [],
    features: [],
    verifiedOnly: false,
    investment: false,
    urgent: false,
    furnished: false,
    parking: false,
    garden: false,
    near: [],
    rawQuery: query,
  };

  result.city = extractCity(normalizedQuery);
  result.neighborhood = extractNeighborhood(normalizedQuery);
  result.propertyType = extractPropertyType(normalizedQuery);
  result.budget = extractBudget(normalizedQuery);
  result.bedrooms = extractBedrooms(normalizedQuery);
  result.bathrooms = extractBathrooms(normalizedQuery);
  result.size = extractSize(normalizedQuery);
  result.features = extractFeatures(normalizedQuery);
  result.near = extractNearbyAreas(normalizedQuery);
  result.verifiedOnly = checkVerifiedOnly(normalizedQuery);
  result.investment = checkInvestmentQuery(normalizedQuery);
  result.urgent = checkUrgentQuery(normalizedQuery);
  result.sortBy = extractSortPreference(normalizedQuery);

  // Convenience booleans from features array
  result.furnished = result.features.includes("furnished");
  result.parking   = result.features.includes("parking");
  result.garden    = result.features.includes("garden");

  result.keywords = extractKeywords(normalizedQuery);

  return result;
}

function extractCity(query: string): string | undefined {
  const cityNames = Object.keys(CITY_ALIASES);
  for (const city of cityNames) {
    if (query.includes(city)) {
      return CITY_ALIASES[city];
    }
  }
  return undefined;
}

function extractPropertyType(query: string): string | undefined {
  const typeNames = Object.keys(PROPERTY_TYPE_ALIASES);
  for (const type of typeNames) {
    if (query.includes(type)) {
      return PROPERTY_TYPE_ALIASES[type];
    }
  }
  return undefined;
}

function extractBudget(query: string): ParsedSearchQuery["budget"] | undefined {
  const budget: { min?: number; max?: number; currency: string } = { currency: "USD" };

  const isUnderKeyword = /under|below|less than|max|up to|أقل من|بحد أقصى/.test(query);

  // Range pattern: "100k - 200k" or "100,000 to 200,000"
  const rangePattern = /\$?\s*(\d+)\s*(k|m|million|مليون|ألف)?\s*(?:to|-|–|حتى)\s*\$?\s*(\d+)\s*(k|m|million|مليون|ألف)?/i;
  const rangeMatch = query.match(rangePattern);
  if (rangeMatch) {
    budget.min = parseAmount(rangeMatch[1], rangeMatch[2] ?? "");
    budget.max = parseAmount(rangeMatch[3], rangeMatch[4] ?? "");
  } else {
    for (const pattern of BUDGET_PATTERNS) {
      const match = query.match(pattern);
      if (match && match[1]) {
        const amount = parseAmount(match[1].replace(/,/g, ""), match[2] ?? "");
        if (amount > 0) {
          if (isUnderKeyword) {
            budget.max = amount;
          } else {
            budget.min = amount;
          }
          break;
        }
      }
    }
  }

  // Currency detection
  const currencyMatch = query.match(/(iqd|usd|dollar|دولار|دينار|دينار عراقي)/i);
  if (currencyMatch) {
    const c = currencyMatch[1].toLowerCase();
    budget.currency = c.startsWith("iqd") || c.includes("دينار") ? "IQD" : "USD";
  }

  if (budget.min !== undefined || budget.max !== undefined) {
    return budget;
  }
  return undefined;
}

function parseAmount(value: string, suffix: string): number {
  const num = parseInt(value.replace(/,/g, ""), 10);
  if (isNaN(num)) return 0;
  const s = suffix.toLowerCase();
  if (s === "k") return num * 1000;
  if (s === "m" || s === "million" || s === "مليون") return num * 1_000_000;
  if (s === "ألف") return num * 1000;
  return num;
}

function extractBedrooms(query: string): number | undefined {
  const bedroomPatterns = [
    /(\d+)\s*(?:bedroom|bed|br)s?/i,
    /(\d+)\s*br/i,
    /(one|two|three|four|five)\s*(?:bedroom|bed)/i,
  ];

  const wordToNumber: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
  };

  for (const pattern of bedroomPatterns) {
    const match = query.match(pattern);
    if (match) {
      if (match[1] && wordToNumber[match[1].toLowerCase()]) {
        return wordToNumber[match[1].toLowerCase()];
      }
      if (match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num <= 10) {
          return num;
        }
      }
    }
  }
  return undefined;
}

function extractBathrooms(query: string): number | undefined {
  const bathroomPatterns = [
    /(\d+)\s*(?:bathroom|bath|ba)s?/i,
    /(\d+)\s*ba/i,
  ];

  for (const pattern of bathroomPatterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num <= 10) {
        return num;
      }
    }
  }
  return undefined;
}

function extractSize(query: string): { min?: number; max?: number } | undefined {
  const size: { min?: number; max?: number } = {};

  for (const pattern of SIZE_PATTERNS) {
    const match = query.match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num)) {
        if (query.includes("under") || query.includes("max")) {
          size.max = num;
        } else if (query.includes("over") || query.includes("min")) {
          size.min = num;
        } else {
          size.min = num;
        }
      }
    }
  }

  const rangeMatch = query.match(/(\d+)\s*(?:to|-)\s*(\d+)\s*(?:sqm|square|m²)/i);
  if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
    size.min = parseInt(rangeMatch[1], 10);
    size.max = parseInt(rangeMatch[2], 10);
  }

  if (size.min || size.max) {
    return size;
  }
  return undefined;
}

function extractFeatures(query: string): string[] {
  const features: string[] = [];

  for (const [feature, keywords] of Object.entries(FEATURE_KEYWORDS)) {
    if (keywords.some(kw => query.includes(kw))) {
      features.push(feature);
    }
  }

  return features;
}

function extractNearbyAreas(query: string): string[] {
  const nearby: string[] = [];

  for (const [areaKeyword, areaType] of Object.entries(AREA_KEYWORDS)) {
    if (query.includes(`near ${areaKeyword}`) || query.includes(`nearby ${areaKeyword}`)) {
      nearby.push(areaType);
    }
  }

  return nearby;
}

function checkVerifiedOnly(query: string): boolean {
  return /verified|trusted|official|موثّق|موثق|رسمي/.test(query);
}

function checkInvestmentQuery(query: string): boolean {
  return /investment|invest|roi|rental|returns|استثمار|استثماري|عائد/.test(query);
}

function checkUrgentQuery(query: string): boolean {
  return /urgent|immediate|asap|fast|quick|عاجل|سريع/.test(query);
}

function extractSortPreference(query: string): "price" | "date" | "size" | "score" | undefined {
  if (query.includes("cheapest") || query.includes("lowest price") || query.includes("affordable")) {
    return "price";
  }
  if (query.includes("newest") || query.includes("latest") || query.includes("recent")) {
    return "date";
  }
  if (query.includes("largest") || query.includes("biggest") || query.includes("spacious")) {
    return "size";
  }
  if (query.includes("best") || query.includes("top rated") || query.includes("recommended")) {
    return "score";
  }
  return undefined;
}

function extractKeywords(query: string): string[] {
  const stopWords = ["in", "the", "a", "an", "and", "or", "with", "for", "near", "under", "over", "me"];
  const words = query.split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));

  const significantWords: string[] = [];
  for (const word of words) {
    if (!Object.keys(CITY_ALIASES).includes(word) &&
        !Object.keys(PROPERTY_TYPE_ALIASES).includes(word) &&
        !Object.values(FEATURE_KEYWORDS).flat().includes(word)) {
      significantWords.push(word);
    }
  }

  return significantWords;
}

export function buildFilterFromParsedQuery(parsed: ParsedSearchQuery): Record<string, unknown> {
  const filters: Record<string, unknown> = {};

  if (parsed.city) {
    filters.city = parsed.city;
  }
  if (parsed.neighborhood) {
    filters.neighborhood = parsed.neighborhood;
  }
  if (parsed.propertyType) {
    filters.propertyType = parsed.propertyType;
  }
  if (parsed.budget) {
    if (parsed.budget.min) filters.priceMin = parsed.budget.min;
    if (parsed.budget.max) filters.priceMax = parsed.budget.max;
    filters.currency = parsed.budget.currency;
  }
  if (parsed.bedrooms) {
    filters.bedrooms = parsed.bedrooms;
  }
  if (parsed.bathrooms) {
    filters.bathrooms = parsed.bathrooms;
  }
  if (parsed.size) {
    if (parsed.size.min) filters.sizeMin = parsed.size.min;
    if (parsed.size.max) filters.sizeMax = parsed.size.max;
  }
  if (parsed.features.length > 0) {
    filters.features = parsed.features;
  }
  if (parsed.verifiedOnly) {
    filters.verified = true;
  }
  if (parsed.sortBy) {
    filters.sortBy = parsed.sortBy;
  }

  return filters;
}

export const SUGGESTED_SEARCHES = [
  { query: "villa in Erbil investment opportunity", label: "Villa in Erbil investment" },
  { query: "apartment Baghdad near schools", label: "Apartment in Baghdad near schools" },
  { query: "land in Basra under 200k", label: "Land in Basra under $200K" },
  { query: "furnished apartment Erbil verified", label: "Furnished apartment in Erbil" },
  { query: "house Mosul safe area", label: "House in Mosul safe area" },
  { query: "commercial space Baghdad parking", label: "Commercial space with parking" },
];