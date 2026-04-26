import { useState, useCallback, useMemo, useEffect } from "react";
import { getFairPriceWithComparison, type FairPriceInput, type FairPriceEstimate } from "@/lib/ai/fairPriceEngine";
import { calculateInvestmentScore, type InvestmentPropertyInput, type InvestmentScoreResult } from "@/lib/ai/investmentScore";
import { detectFraudRisk, type FraudCheckInput, type FraudRiskResult } from "@/lib/ai/fraudRisk";
import { getAreaInsights, type AreaInsightInput, type AreaInsightResult } from "@/lib/ai/areaInsights";

export interface PropertyAIState {
  fairPrice: FairPriceEstimate | null;
  investmentScore: InvestmentScoreResult | null;
  fraudRisk: FraudRiskResult | null;
  areaInsights: AreaInsightResult | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface PropertyAIConfig {
  listingPrice: number;
  city: string;
  district?: string;
  propertyType: string;
  size: number;
  bedrooms?: number;
  bathrooms?: number;
  condition?: "poor" | "average" | "good" | "excellent";
  age?: number;
  areaDemand?: number;
  marketAverage?: number;
  pricePerSqm?: number;
  sellerVerified?: boolean;
  sellerListingsCount?: number;
  sellerAccountAge?: number;
  hasAllDocuments?: boolean;
  imagesCount?: number;
  descriptionLength?: number;
  title?: string;
  description?: string;
  coordinates?: { lat: number; lng: number };
  daysOnMarket?: number;
  phoneNumbers?: string[];
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getCacheKey(config: PropertyAIConfig): string {
  return `${config.city}-${config.propertyType}-${config.size}-${config.listingPrice}`;
}

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function usePropertyAI(config: PropertyAIConfig) {
  const [state, setState] = useState<PropertyAIState>({
    fairPrice: null,
    investmentScore: null,
    fraudRisk: null,
    areaInsights: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const [triggerCount, setTriggerCount] = useState(0);

  const analyze = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const cacheKey = getCacheKey(config);
      const cachedFairPrice = getCached<FairPriceEstimate>(`fairprice-${cacheKey}`);
      const cachedInvestment = getCached<InvestmentScoreResult>(`investment-${cacheKey}`);
      const cachedFraud = getCached<FraudRiskResult>(`fraud-${cacheKey}`);
      const cachedArea = getCached<AreaInsightResult>(`area-${config.city}`);

      const fairPriceInput: FairPriceInput = {
        size: config.size,
        marketAverage: config.marketAverage || 1000,
        condition: config.condition || "average",
        areaDemand: config.areaDemand || 50,
        city: config.city,
        district: config.district,
        propertyType: config.propertyType,
        bedrooms: config.bedrooms,
        bathrooms: config.bathrooms,
        age: config.age,
      };

      const fairPrice = cachedFairPrice || getFairPriceWithComparison(fairPriceInput, config.listingPrice);
      if (!cachedFairPrice) setCache(`fairprice-${cacheKey}`, fairPrice);

      const investmentInput: InvestmentPropertyInput = {
        pricePerSqm: config.pricePerSqm || config.listingPrice / config.size,
        marketAverage: config.marketAverage || 1000,
        locationGrowth: config.areaDemand || 50,
        liquidity: 70,
        condition: config.condition === "excellent" ? 100 : config.condition === "good" ? 80 : config.condition === "average" ? 60 : 40,
        price: config.listingPrice,
        estimatedValue: fairPrice.estimatedValue,
        city: config.city,
        propertyType: config.propertyType,
        areaDemand: config.areaDemand || 50,
        age: config.age,
        bedrooms: config.bedrooms,
      };

      const investmentScore = cachedInvestment || calculateInvestmentScore(investmentInput);
      if (!cachedInvestment) setCache(`investment-${cacheKey}`, investmentScore);

      const fraudInput: FraudCheckInput = {
        price: config.listingPrice,
        pricePerSqm: config.pricePerSqm || config.listingPrice / config.size,
        marketAverage: config.marketAverage || 1000,
        sellerVerified: config.sellerVerified || false,
        sellerListingsCount: config.sellerListingsCount || 0,
        sellerAccountAge: config.sellerAccountAge || 0,
        hasAllDocuments: config.hasAllDocuments ?? true,
        imagesCount: config.imagesCount || 3,
        descriptionLength: config.descriptionLength || 100,
        phoneNumbers: config.phoneNumbers || [],
        hasDuplicateImages: false,
        coordinates: config.coordinates,
        propertyType: config.propertyType,
        areaDemand: config.areaDemand || 50,
        daysOnMarket: config.daysOnMarket || 0,
        priceHistory: [config.listingPrice],
        title: config.title || "",
        description: config.description || "",
      };

      const fraudRisk = cachedFraud || detectFraudRisk(fraudInput);
      if (!cachedFraud) setCache(`fraud-${cacheKey}`, fraudRisk);

      const areaInput: AreaInsightInput = {
        city: config.city,
        district: config.district,
        propertyType: config.propertyType,
        size: config.size,
      };

      const areaInsights = cachedArea || getAreaInsights(areaInput);
      if (!cachedArea) setCache(`area-${config.city}`, areaInsights);

      setState({
        fairPrice,
        investmentScore,
        fraudRisk,
        areaInsights,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "AI analysis failed",
      }));
    }
  }, [config]);

  useEffect(() => {
    if (triggerCount > 0) {
      analyze();
    }
  }, [triggerCount, analyze]);

  useEffect(() => {
    analyze();
  }, []);

  const refresh = useCallback(() => {
    cache.clear();
    setTriggerCount((c) => c + 1);
  }, []);

  const summary = useMemo(() => {
    if (!state.fairPrice || !state.investmentScore || !state.fraudRisk) {
      return null;
    }

    const hasIssues = state.fraudRisk.riskLevel !== "Low";
    const isGoodDeal = state.fairPrice.priceDifferencePercent < -5;
    const isExcellentInvestment = state.investmentScore.score >= 75;

    let verdict: string;
    if (hasIssues && !isExcellentInvestment) {
      verdict = "Proceed with caution";
    } else if (isExcellentInvestment && !hasIssues) {
      verdict = "Excellent opportunity";
    } else if (isGoodDeal) {
      verdict = "Below market value";
    } else {
      verdict = "Fair market price";
    }

    return {
      verdict,
      hasIssues,
      isGoodDeal,
      isExcellentInvestment,
      priceAnalysis: state.fairPrice.priceDifferencePercent > 0 ? "Above" : state.fairPrice.priceDifferencePercent < 0 ? "Below" : "At",
      investmentGrade: state.investmentScore.grade,
      riskLevel: state.fraudRisk.riskLevel,
    };
  }, [state.fairPrice, state.investmentScore, state.fraudRisk]);

  return {
    ...state,
    refresh,
    summary,
  };
}

export function useFairPriceAnalysis(
  size: number,
  marketAverage: number,
  condition: "poor" | "average" | "good" | "excellent",
  areaDemand: number,
  listingPrice: number
) {
  const [estimate, setEstimate] = useState<FairPriceEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (size <= 0 || marketAverage <= 0) return;

    setIsLoading(true);

    const timeout = setTimeout(() => {
      const input: FairPriceInput = {
        size,
        marketAverage,
        condition,
        areaDemand,
        city: "Baghdad",
        propertyType: "apartment",
      };

      const result = getFairPriceWithComparison(input, listingPrice);
      setEstimate(result);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timeout);
  }, [size, marketAverage, condition, areaDemand, listingPrice]);

  return { estimate, isLoading };
}

export function useInvestmentAnalysis(
  pricePerSqm: number,
  marketAverage: number,
  city: string,
  propertyType: string,
  areaDemand: number
) {
  const [result, setResult] = useState<InvestmentScoreResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (pricePerSqm <= 0 || !city) return;

    setIsLoading(true);

    const timeout = setTimeout(() => {
      const input: InvestmentPropertyInput = {
        pricePerSqm,
        marketAverage,
        locationGrowth: areaDemand,
        liquidity: 70,
        condition: 70,
        price: pricePerSqm * 200,
        estimatedValue: marketAverage * 200,
        city,
        propertyType,
        areaDemand,
      };

      const score = calculateInvestmentScore(input);
      setResult(score);
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(timeout);
  }, [pricePerSqm, marketAverage, city, propertyType, areaDemand]);

  return { result, isLoading };
}