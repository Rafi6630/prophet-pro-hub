/**
 * AI Valuation Engine — Module 1 (Extended)
 * Multi-factor property valuation with deep property details.
 */

export interface ValuationInput {
  // Core
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  district: string;
  propertyType: string;
  age?: number;
  verified?: boolean;
  features?: string[];

  // Location
  lat?: number;
  lng?: number;
  locationType?: "residential" | "commercial_mix" | "main_road" | "corner_plot" | "cul_de_sac" | "gated_compound";
  streetWidth?: "narrow" | "medium" | "wide" | "main_boulevard";
  nearbyFacilities?: string[];

  // Building (Villa / House)
  floors?: number;
  hasGarden?: boolean;
  gardenArea?: number;
  hasRooftop?: boolean;
  rooftopArea?: number;
  hasBasement?: boolean;
  basementArea?: number;

  // Apartment building
  floorLevel?: number;
  buildingFloors?: number;
  hasElevator?: boolean;

  // Balconies
  balconies?: number;
  balconyArea?: number;

  // View
  view?: string[];

  // Condition & Finish
  condition?: "luxury" | "excellent" | "good" | "fair" | "needs_renovation" | "needs_major_work";
  interiorCladding?: "marble" | "ceramic" | "parquet" | "mixed" | "basic";
  exteriorCladding?: "stone_facade" | "modern_cladding" | "painted" | "brick" | "glass_curtain";

  // Environment & Ambience
  naturalLight?: "excellent" | "good" | "limited";
  sunExposure?: "all_day" | "morning" | "afternoon" | "limited";
  noiseLevel?: "very_quiet" | "quiet" | "moderate" | "busy";

  // Utilities & Systems
  hasGenerator?: boolean;
  hasSolarPanels?: boolean;
  hasWaterTank?: boolean;
  hasCentralAC?: boolean;
  hasHeating?: boolean;
  hasSecuritySystem?: boolean;
  parkingSpaces?: number;

  // Luxury extras
  hasPool?: boolean;
  hasGym?: boolean;
  hasSmartHome?: boolean;
  hasConcierge?: boolean;
}

export interface ValuationFactor {
  name: string;
  impact: "positive" | "negative" | "neutral";
  adjustment: number;
  description: string;
}

export interface Comparable {
  title: string;
  price: number;
  area: number;
  pricePerSqm: number;
  distance: string;
  similarity: number;
}

export interface AppreciationForecast {
  oneYear: number;
  threeYear: number;
  fiveYear: number;
  trend: "strong_growth" | "moderate_growth" | "stable" | "declining";
}

export interface ValuationResult {
  estimatedValue: number;
  discountVsMarket: number;
  discountPercent: number;
  confidenceScore: number;
  confidenceLabel: "high" | "medium" | "low";
  pricePerSqm: number;
  marketPricePerSqm: number;
  verdict: "undervalued" | "fair" | "overvalued";
  verdictLabel: string;
  factors: ValuationFactor[];
  comparables: Comparable[];
  appreciation: AppreciationForecast;
  scoreBreakdown: { category: string; score: number; max: number }[];
}

// ── Market data ───────────────────────────────────────────────────────────────

const CITY_BASE: Record<string, number> = {
  Erbil: 2200, Baghdad: 1850, Basra: 1400, Sulaymaniyah: 1650,
};

const DISTRICT_MULT: Record<string, number> = {
  Ankawa: 1.25, Gulan: 1.15, Ainkawa: 1.20, Shorsh: 1.10, Sarchinar: 0.95, Koya: 0.90,
  Mansour: 1.30, Karrada: 1.18, Zayouna: 1.12, Jadriya: 1.22, Adhamiya: 1.05, "Sadr City": 0.82,
  Ashar: 1.10, Brazilja: 0.95,
  Bakhtiari: 1.15, Qadisiyah: 1.08,
};

const TYPE_MULT: Record<string, number> = {
  Villa: 1.20, Penthouse: 1.35, Apartment: 1.00, Commercial: 1.10,
  Land: 0.85, Townhouse: 1.05, Office: 1.15, Warehouse: 0.80,
};

const CITY_GROWTH: Record<string, number> = {
  Erbil: 7.8, Baghdad: 4.2, Basra: 3.1, Sulaymaniyah: 5.5,
};

// ── Core algorithm ────────────────────────────────────────────────────────────

export function calculateValuation(inp: ValuationInput): ValuationResult {
  const {
    price, area, city, district, propertyType,
    bedrooms = 3, bathrooms = 2, age = 5,
    verified = false,
    locationType, streetWidth, nearbyFacilities = [],
    floors, hasGarden, gardenArea, hasRooftop, rooftopArea, hasBasement,
    floorLevel, buildingFloors, hasElevator,
    balconies, balconyArea,
    view = [],
    condition, interiorCladding, exteriorCladding,
    naturalLight, sunExposure, noiseLevel,
    hasGenerator, hasSolarPanels, hasWaterTank, hasCentralAC,
    hasHeating, hasSecuritySystem, parkingSpaces = 0,
    hasPool, hasGym, hasSmartHome, hasConcierge,
  } = inp;

  const factors: ValuationFactor[] = [];
  let totalMult = 1.0;

  const addFactor = (
    name: string,
    impact: ValuationFactor["impact"],
    adj: number,
    description: string,
  ) => {
    factors.push({ name, impact, adjustment: adj, description });
    totalMult *= 1 + adj;
  };

  // Base
  const cityBase = CITY_BASE[city] ?? 1700;
  const distMult = DISTRICT_MULT[district] ?? 1.0;
  const typeMult = TYPE_MULT[propertyType] ?? 1.0;
  let base = cityBase * distMult * typeMult;
  base *= 1 + (bedrooms - 2) * 0.03 + (bathrooms - 1) * 0.02;

  // Age
  const ageAdj = -Math.min(age * 0.008, 0.20);
  if (Math.abs(ageAdj) > 0.005) {
    addFactor("Property Age", ageAdj < 0 ? "negative" : "neutral", ageAdj,
      `${age}-year-old property: ${Math.abs(Math.round(ageAdj * 100))}% age depreciation.`);
  }

  // Condition
  const condMap: Record<string, [number, string]> = {
    luxury:           [+0.18, "Luxury finish commands an 18% premium."],
    excellent:        [+0.10, "Excellent condition adds 10% to value."],
    good:             [+0.03, "Good condition — minimal adjustment."],
    fair:             [ 0.00, "Fair condition — at market rate."],
    needs_renovation: [-0.08, "Renovation needed: 8% discount applied."],
    needs_major_work: [-0.18, "Major work required: 18% discount applied."],
  };
  if (condition && condMap[condition]) {
    const [adj, desc] = condMap[condition];
    if (adj !== 0) addFactor("Condition", adj >= 0 ? "positive" : "negative", adj, desc);
  }

  // Interior cladding
  const intMap: Record<string, [number, string]> = {
    marble:  [+0.09, "Marble floors: luxury finish +9%."],
    parquet: [+0.05, "Parquet floors: quality finish +5%."],
    ceramic: [+0.02, "Ceramic tiles: standard premium +2%."],
    mixed:   [ 0.00, "Mixed flooring: neutral."],
    basic:   [-0.04, "Basic finish: reduced appeal -4%."],
  };
  if (interiorCladding && intMap[interiorCladding]) {
    const [adj, desc] = intMap[interiorCladding];
    if (adj !== 0) addFactor("Interior Finish", adj > 0 ? "positive" : "negative", adj, desc);
  }

  // Exterior cladding
  const extMap: Record<string, [number, string]> = {
    stone_facade:    [+0.07, "Natural stone facade +7%."],
    glass_curtain:   [+0.06, "Glass curtain wall: modern premium +6%."],
    modern_cladding: [+0.04, "Modern cladding +4%."],
    painted:         [ 0.00, "Painted exterior: standard."],
    brick:           [-0.02, "Brick exterior: slight discount -2%."],
  };
  if (exteriorCladding && extMap[exteriorCladding]) {
    const [adj, desc] = extMap[exteriorCladding];
    if (adj !== 0) addFactor("Exterior Finish", adj > 0 ? "positive" : "negative", adj, desc);
  }

  // View
  const viewPremiums: Record<string, number> = {
    sea: 0.15, mountain: 0.12, city: 0.08, open: 0.06,
    garden: 0.04, courtyard: 0.02, street: 0.01,
  };
  const bestView = view.reduce((best, v) =>
    (viewPremiums[v] ?? 0) > (viewPremiums[best] ?? 0) ? v : best, "");
  if (bestView && viewPremiums[bestView] > 0) {
    const adj = viewPremiums[bestView];
    addFactor("View", "positive", adj,
      `${bestView.charAt(0).toUpperCase() + bestView.slice(1)} view +${Math.round(adj * 100)}%.`);
  }

  // Floor level
  if (floorLevel !== undefined && buildingFloors) {
    const isTop = floorLevel === buildingFloors;
    const isGround = floorLevel <= 1;
    const isHigh = floorLevel >= Math.round(buildingFloors * 0.6);
    if (isTop) addFactor("Top Floor", "positive", 0.05, "Top floor: views and privacy +5%.");
    else if (isHigh) addFactor("High Floor", "positive", 0.03, "High floor: light and views +3%.");
    else if (isGround) addFactor("Ground Floor", "negative", -0.04, "Ground floor: privacy penalty -4%.");
    if (!hasElevator && floorLevel > 3)
      addFactor("No Elevator", "negative", -0.03, `Floor ${floorLevel} without elevator: accessibility penalty -3%.`);
  }
  if (hasElevator) addFactor("Elevator", "positive", 0.02, "Elevator available +2%.");

  // Street width
  const streetMap: Record<string, [number, string]> = {
    main_boulevard: [+0.06, "Main boulevard frontage: access +6%."],
    wide:           [+0.04, "Wide street (12–20m) +4%."],
    medium:         [+0.01, "Medium street: standard."],
    narrow:         [-0.03, "Narrow street: limited access -3%."],
  };
  if (streetWidth && streetMap[streetWidth]) {
    const [adj, desc] = streetMap[streetWidth];
    if (adj !== 0) addFactor("Street Width", adj > 0 ? "positive" : "negative", adj, desc);
  }

  // Location type
  const locTypeMap: Record<string, [number, string]> = {
    gated_compound: [+0.10, "Gated compound: security +10%."],
    corner_plot:    [+0.06, "Corner plot: exposure +6%."],
    residential:    [+0.02, "Residential zone: quiet +2%."],
    commercial_mix: [-0.01, "Mixed commercial: noise -1%."],
    main_road:      [-0.03, "Main road: noise/privacy -3%."],
    cul_de_sac:     [+0.03, "Cul-de-sac: very quiet +3%."],
  };
  if (locationType && locTypeMap[locationType]) {
    const [adj, desc] = locTypeMap[locationType];
    if (adj !== 0) addFactor("Location Type", adj > 0 ? "positive" : "negative", adj, desc);
  }

  // Nearby facilities
  const facWeights: Record<string, number> = {
    school: 0.025, hospital: 0.02, mall: 0.02, park: 0.018,
    university: 0.015, metro: 0.025, mosque: 0.01,
  };
  const facAdj = Math.min(nearbyFacilities.reduce((s, f) => s + (facWeights[f] ?? 0.01), 0), 0.10);
  if (facAdj > 0) {
    addFactor("Nearby Facilities", "positive", facAdj,
      `${nearbyFacilities.length} key facility(ies): ${nearbyFacilities.join(", ")}.`);
  }

  // Garden
  if (hasGarden) {
    const adj = Math.min((gardenArea ?? 50) / 500 * 0.07, 0.08);
    addFactor("Private Garden", "positive", adj,
      `${gardenArea ?? ""}m² private garden +${Math.round(adj * 100)}%.`);
  }

  // Rooftop
  if (hasRooftop) {
    const adj = Math.min((rooftopArea ?? 50) / 200 * 0.04, 0.06);
    addFactor("Rooftop Terrace", "positive", adj, `Rooftop terrace +${Math.round(adj * 100)}%.`);
  }

  // Basement
  if (hasBasement) addFactor("Basement", "positive", 0.03, "Basement space +3%.");

  // Balconies
  if (balconies && balconies > 0) {
    const adj = Math.min(balconies * 0.015 + (balconyArea ?? 0) / 100 * 0.01, 0.05);
    addFactor("Balconies", "positive", adj,
      `${balconies} balcony(ies)${balconyArea ? `, ${balconyArea} m²` : ""} +${Math.round(adj * 100)}%.`);
  }

  // Light & sun
  if (naturalLight === "excellent") addFactor("Natural Light", "positive", 0.03, "Excellent natural light +3%.");
  else if (naturalLight === "limited") addFactor("Natural Light", "negative", -0.03, "Limited natural light -3%.");
  if (sunExposure === "all_day") addFactor("Sun Exposure", "positive", 0.02, "All-day sunlight +2%.");

  // Noise
  if (noiseLevel === "very_quiet") addFactor("Environment", "positive", 0.04, "Very quiet environment +4%.");
  else if (noiseLevel === "busy") addFactor("Environment", "negative", -0.04, "Busy/noisy area -4%.");

  // Parking
  if (parkingSpaces > 0) {
    const adj = Math.min(parkingSpaces * 0.025, 0.06);
    addFactor("Parking", "positive", adj, `${parkingSpaces} parking space(s) +${Math.round(adj * 100)}%.`);
  }

  // Utilities
  const utils: string[] = [];
  let utilAdj = 0;
  if (hasGenerator)      { utilAdj += 0.02;  utils.push("Generator"); }
  if (hasSolarPanels)    { utilAdj += 0.025; utils.push("Solar panels"); }
  if (hasWaterTank)      { utilAdj += 0.01;  utils.push("Water tank"); }
  if (hasCentralAC)      { utilAdj += 0.02;  utils.push("Central AC"); }
  if (hasHeating)        { utilAdj += 0.015; utils.push("Central heating"); }
  if (hasSecuritySystem) { utilAdj += 0.015; utils.push("Security system"); }
  if (utilAdj > 0)
    addFactor("Utilities & Systems", "positive", Math.min(utilAdj, 0.08),
      `${utils.join(", ")}.`);

  // Luxury
  const luxItems: string[] = [];
  let luxAdj = 0;
  if (hasPool)      { luxAdj += 0.06; luxItems.push("Pool"); }
  if (hasGym)       { luxAdj += 0.03; luxItems.push("Private gym"); }
  if (hasSmartHome) { luxAdj += 0.04; luxItems.push("Smart home"); }
  if (hasConcierge) { luxAdj += 0.03; luxItems.push("Concierge"); }
  if (luxAdj > 0)
    addFactor("Luxury Amenities", "positive", Math.min(luxAdj, 0.12),
      `${luxItems.join(", ")}.`);

  // Verified
  if (verified) addFactor("Verified Listing", "positive", 0.03, "Platform-verified +3%.");

  // ── Final calculation ─────────────────────────────────────────────────────
  const marketPricePerSqm = base * totalMult;
  const estimatedValue    = Math.round(marketPricePerSqm * area);
  const pricePerSqm       = Math.round(price / area);
  const discountVsMarket  = price - estimatedValue;
  const discountPercent   = Math.round((discountVsMarket / estimatedValue) * 100);

  let verdict: ValuationResult["verdict"];
  let verdictLabel: string;
  if (discountPercent <= -10)     { verdict = "undervalued"; verdictLabel = "🟢 Undervalued — Strong Buy Signal"; }
  else if (discountPercent >= 10) { verdict = "overvalued";  verdictLabel = "🔴 Overvalued — Exercise Caution"; }
  else                             { verdict = "fair";        verdictLabel = "🟡 Fair Market Value"; }

  let confScore = 50;
  if (district in DISTRICT_MULT)   confScore += 12;
  if (city in CITY_BASE)           confScore += 8;
  if (propertyType in TYPE_MULT)   confScore += 5;
  if (condition)                   confScore += 6;
  if (interiorCladding)            confScore += 4;
  if (view.length > 0)             confScore += 3;
  if (noiseLevel)                  confScore += 3;
  if (naturalLight)                confScore += 2;
  if (streetWidth)                 confScore += 2;
  if (nearbyFacilities.length > 0) confScore += 3;
  if (floorLevel !== undefined)    confScore += 2;
  confScore = Math.min(confScore, 98);

  const confidenceLabel: ValuationResult["confidenceLabel"] =
    confScore >= 80 ? "high" : confScore >= 60 ? "medium" : "low";

  const comparables: Comparable[] = [
    { title: `${district} ${propertyType} — Comp A`, price: Math.round(estimatedValue * 0.97), area: Math.round(area * 0.95), pricePerSqm: Math.round(marketPricePerSqm), distance: "0.3 km", similarity: 94 },
    { title: `${district} ${propertyType} — Comp B`, price: Math.round(estimatedValue * 1.04), area: Math.round(area * 1.08), pricePerSqm: Math.round(marketPricePerSqm * 0.98), distance: "0.7 km", similarity: 87 },
    { title: `${city} ${propertyType} — Comp C`,     price: Math.round(estimatedValue * 0.93), area: Math.round(area * 0.90), pricePerSqm: Math.round(marketPricePerSqm * 1.03), distance: "1.2 km", similarity: 79 },
  ];

  const gr = (CITY_GROWTH[city] ?? 5.0) / 100;
  const appreciation: AppreciationForecast = {
    oneYear:   Math.round(estimatedValue * (1 + gr)),
    threeYear: Math.round(estimatedValue * Math.pow(1 + gr, 3)),
    fiveYear:  Math.round(estimatedValue * Math.pow(1 + gr, 5)),
    trend: gr > 0.06 ? "strong_growth" : gr > 0.04 ? "moderate_growth" : "stable",
  };

  const scoreBreakdown = [
    { category: "Location",          score: Math.round(Math.min(((DISTRICT_MULT[district] ?? 1) - 0.8) / 0.55, 1) * 25), max: 25 },
    { category: "Condition & Finish", score: Math.min(
        (condition === "luxury" ? 10 : condition === "excellent" ? 8 : condition === "good" ? 6 : condition === "fair" ? 4 : condition === "needs_renovation" ? 2 : 0) +
        (interiorCladding === "marble" ? 5 : interiorCladding === "parquet" ? 4 : interiorCladding === "ceramic" ? 3 : 2), 25), max: 25 },
    { category: "Features", score: Math.min(
        (hasPool ? 7 : 0) + (hasGym ? 4 : 0) + (hasSmartHome ? 5 : 0) + (hasGarden ? 4 : 0) +
        (balconies ? Math.min(balconies * 2, 4) : 0) + (parkingSpaces ? Math.min(parkingSpaces * 2, 5) : 0), 25), max: 25 },
    { category: "Environment", score: Math.min(
        (noiseLevel === "very_quiet" ? 10 : noiseLevel === "quiet" ? 7 : noiseLevel === "moderate" ? 4 : 2) +
        (naturalLight === "excellent" ? 8 : naturalLight === "good" ? 5 : 2) +
        (view.includes("mountain") || view.includes("sea") ? 7 : view.includes("city") ? 5 : 3), 25), max: 25 },
  ];

  return {
    estimatedValue, discountVsMarket, discountPercent,
    confidenceScore: confScore, confidenceLabel,
    pricePerSqm, marketPricePerSqm: Math.round(marketPricePerSqm),
    verdict, verdictLabel, factors, comparables, appreciation, scoreBreakdown,
  };
}
