export interface ParsedSearchQuery {
  city?: string;
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
  erbil: "Erbil",
  basra: "Basra",
  mosul: "Mosul",
  najaf: "Najaf",
  karbala: "Karbala",
  sulaymaniyah: "Sulaimaniyah",
  kirkuk: "Kirkuk",
  Duhok: "Duhok",
  " Duhok": "Duhok",
};

const PROPERTY_TYPE_ALIASES: Record<string, string> = {
  villa: "villa",
  house: "house",
  apartment: "apartment",
  flat: "apartment",
  land: "land",
  plot: "land",
  commercial: "commercial",
  shop: "commercial",
  office: "commercial",
  warehouse: "industrial",
  industrial: "industrial",
};

const FEATURE_KEYWORDS: Record<string, string[]> = {
  furnished: ["furnished", "مفروش", "furnished", "equipped"],
  parking: ["parking", "garage", "car", "موقف", "parking"],
  garden: ["garden", "yard", "outdoor", "حديقة", "garden", "lawn"],
  pool: ["pool", "swimming", "مسبح", "pool"],
  security: ["security", "guarded", "secure", "أمن", "security"],
  elevator: ["elevator", "lift", "مصعد", "elevator"],
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
  /(?:under|below|less than|max|up to)\s*(\d+)\s*(k|K|m|M)?/i,
  /(\d+)\s*(k|K|m|M)\s*(?:or less|maximum|under)?/i,
  /(?:budget|price|price range)\s*(?:of|is|:)?\s*(\d+)\s*(?:k|K|m|M)?/i,
  /(\d+)\s*-\s*(\d+)\s*(?:k|K|m|M)?/i,
  /between\s*(\d+)\s*(?:and)?\s*(\d+)/i,
];

const SIZE_PATTERNS = [
  /(\d+)\s*(?:sqm|square|meter|m²)/i,
  /(\d+)\s*(?:sqft|square feet)/i,
  /size\s*(?:of)?\s*(\d+)/i,
  /(\d+)\s*(?:bedroom|bed|br)/i,
];

export function parseSearchQuery(query: string): ParsedSearchQuery {
  const normalizedQuery = query.trim().toLowerCase();
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
    currency: "USD",
    rawQuery: query,
  };

  result.city = extractCity(normalizedQuery);
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

  for (const pattern of BUDGET_PATTERNS) {
    const match = query.match(pattern);
    if (match) {
      if (match.length === 3 && match[2]) {
        budget.min = parseAmount(match[1], match[2]);
        budget.max = parseAmount(match[2], match[2]);
      } else if (match[1]) {
        const amount = parseAmount(match[1], match[1]);
        const isUnder = query.includes("under") || query.includes("below") || query.includes("max");
        if (isUnder) {
          budget.max = amount;
        } else {
          budget.min = amount;
        }
      }
      break;
    }
  }

  const currencyMatch = query.match(/(iqd|usd|dollar|dinar)/i);
  if (currencyMatch) {
    budget.currency = currencyMatch[1].toLowerCase().startsWith("iqd") ? "IQD" : "USD";
  }

  if (budget.min || budget.max) {
    return budget;
  }
  return undefined;
}

function parseAmount(value: string, suffix: string): number {
  const num = parseInt(value, 10);
  if (suffix.toLowerCase() === "k" || suffix === "K") {
    return num * 1000;
  }
  if (suffix.toLowerCase() === "m" || suffix === "M") {
    return num * 1000000;
  }
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
  return query.includes("verified") || query.includes("trusted") || query.includes("official");
}

function checkInvestmentQuery(query: string): boolean {
  return query.includes("investment") || query.includes("invest") || query.includes("ROI") || 
         query.includes("rental") || query.includes("returns");
}

function checkUrgentQuery(query: string): boolean {
  return query.includes("urgent") || query.includes("immediate") || query.includes("asap") ||
         query.includes("fast") || query.includes("quick");
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