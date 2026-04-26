import { useState, useCallback, useMemo, useEffect } from "react";
import { calculateLeadScore, type LeadScoreInput, type LeadScoreResult, getLeadStats, sortLeadsByPriority, filterHotLeads } from "@/lib/ai/leadScore";
import { generateListingContent, type ListingWriterInput, type GeneratedListing } from "@/lib/ai/listingWriter";

export interface SellerAIState {
  leads: LeadScoreResult[];
  topLeads: LeadScoreResult[];
  stats: ReturnType<typeof getLeadStats> | null;
  isLoading: boolean;
  error: string | null;
}

export function useSellerAI(sellerId?: string) {
  const [state, setState] = useState<SellerAIState>({
    leads: [],
    topLeads: [],
    stats: null,
    isLoading: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const mockLeads: LeadScoreInput[] = [
        {
          inquirySource: "whatsapp",
          hasBudget: true,
          budgetAmount: 200000,
          budgetMatch: "close",
          hasViewedProperty: true,
          viewCount: 8,
          hasSavedProperty: true,
          hasContactedSeller: true,
          contactCount: 3,
          repeatVisit: true,
          visitCount: 5,
          engagementScore: 75,
          messagesExchanged: 12,
          propertyTypeInterest: ["villa", "apartment"],
          cityInterest: ["Erbil", "Baghdad"],
          timelineScore: "1month",
          isVerified: true,
          hasCompletedProfile: true,
          isReturningUser: true,
          userAge: 30,
        },
        {
          inquirySource: "website",
          hasBudget: true,
          budgetAmount: 150000,
          budgetMatch: "exact",
          hasViewedProperty: true,
          viewCount: 15,
          hasSavedProperty: true,
          hasContactedSeller: true,
          contactCount: 5,
          repeatVisit: true,
          visitCount: 8,
          engagementScore: 85,
          messagesExchanged: 20,
          propertyTypeInterest: ["apartment"],
          cityInterest: ["Baghdad"],
          timelineScore: "immediate",
          isVerified: true,
          hasCompletedProfile: true,
          isReturningUser: true,
          userAge: 45,
        },
        {
          inquirySource: "referral",
          hasBudget: false,
          hasViewedProperty: false,
          viewCount: 1,
          hasSavedProperty: false,
          hasContactedSeller: true,
          contactCount: 1,
          repeatVisit: false,
          visitCount: 1,
          engagementScore: 20,
          messagesExchanged: 2,
          propertyTypeInterest: ["land"],
          cityInterest: ["Mosul"],
          timelineScore: "6months",
          isVerified: false,
          hasCompletedProfile: false,
          isReturningUser: false,
          userAge: 1,
        },
      ];

      const scoredLeads = mockLeads.map((lead) => calculateLeadScore(lead));
      const sortedLeads = sortLeadsByPriority(scoredLeads);
      const hotLeads = filterHotLeads(sortedLeads);
      const stats = getLeadStats(sortedLeads);

      setState({
        leads: sortedLeads,
        topLeads: hotLeads.slice(0, 5),
        stats,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load leads",
      }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getHotLeadsCount = useMemo(() => {
    return state.leads.filter((l) => l.tier === "Hot").length;
  }, [state.leads]);

  const getConversionRate = useMemo(() => {
    if (!state.stats) return 0;
    return state.stats.avgConversionProb;
  }, [state.stats]);

  return {
    ...state,
    refresh,
    hotLeadsCount: getHotLeadsCount,
    conversionRate: getConversionRate,
  };
}

export function useListingWriter(initialInput?: Partial<ListingWriterInput>) {
  const [input, setInput] = useState<ListingWriterInput>({
    propertyType: initialInput?.propertyType || "apartment",
    city: initialInput?.city || "Baghdad",
    district: initialInput?.district,
    size: initialInput?.size || 0,
    bedrooms: initialInput?.bedrooms,
    bathrooms: initialInput?.bathrooms,
    condition: initialInput?.condition,
    features: initialInput?.features || [],
    amenities: initialInput?.amenities || [],
    notes: initialInput?.notes,
    sellerNotes: initialInput?.sellerNotes,
    targetAudience: initialInput?.targetAudience || "buyer",
  });

  const [generated, setGenerated] = useState<GeneratedListing | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateInput = useCallback((updates: Partial<ListingWriterInput>) => {
    setInput((prev) => ({ ...prev, ...updates }));
  }, []);

  const generate = useCallback(async () => {
    if (input.size <= 0) {
      setError("Please enter property size");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = generateListingContent(input);
      setGenerated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }, [input]);

  const regenerate = useCallback(async () => {
    await generate();
  }, [generate]);

  const applyGenerated = useCallback(() => {
    if (!generated) return null;

    return {
      title: generated.title,
      titleAr: generated.titleAr,
      description: generated.description,
      descriptionAr: generated.descriptionAr,
      highlights: generated.keyHighlights,
    };
  }, [generated]);

  const suggestions = useMemo(() => {
    if (!generated) return [];
    return generated.improvementSuggestions;
  }, [generated]);

  return {
    input,
    updateInput,
    generated,
    isGenerating,
    error,
    generate,
    regenerate,
    applyGenerated,
    suggestions,
  };
}

export function useSellerDashboard(sellerId?: string) {
  const sellerAI = useSellerAI(sellerId);

  const [listingStats, setListingStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
    totalInquiries: 0,
    avgDaysOnMarket: 0,
    conversionRate: 0,
  });

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const loadDashboard = useCallback(async () => {
    await sellerAI.refresh();

    setListingStats({
      totalListings: 12,
      activeListings: 8,
      totalViews: 1542,
      totalInquiries: 47,
      avgDaysOnMarket: 28,
      conversionRate: 12,
    });

    const suggestions = generateSuggestions(sellerAI.leads, listingStats);
    setAiSuggestions(suggestions);
  }, [sellerAI.refresh]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const recommendations = useMemo(() => {
    const recs: { type: "pricing" | "marketing" | "engagement"; message: string; priority: "high" | "medium" | "low" }[] = [];

    if (sellerAI.hotLeadsCount === 0) {
      recs.push({
        type: "engagement",
        message: "No hot leads this week. Consider adjusting your listing prices or adding more properties.",
        priority: "high",
      });
    }

    if (listingStats.avgDaysOnMarket > 45) {
      recs.push({
        type: "pricing",
        message: "Your listings are taking longer to sell. Consider competitive pricing based on AI market analysis.",
        priority: "high",
      });
    }

    if (listingStats.conversionRate < 10) {
      recs.push({
        type: "marketing",
        message: "Low conversion rate. Review your listing descriptions and add more high-quality photos.",
        priority: "medium",
      });
    }

    return recs;
  }, [sellerAI.hotLeadsCount, listingStats]);

  return {
    ...sellerAI,
    listingStats,
    aiSuggestions,
    recommendations,
    loadDashboard,
  };
}

function generateSuggestions(leads: LeadScoreResult[], stats: { avgDaysOnMarket: number; totalInquiries: number }): string[] {
  const suggestions: string[] = [];

  const hotLeads = leads.filter((l) => l.tier === "Hot");
  if (hotLeads.length > 0) {
    suggestions.push(`You have ${hotLeads.length} hot leads awaiting response. Contact them within 2 hours for best conversion.`);
  }

  if (stats.avgDaysOnMarket > 30) {
    suggestions.push("Properties over 30 days may benefit from price adjustment. AI analysis suggests checking comparable listings.");
  }

  if (stats.totalInquiries > 20) {
    suggestions.push("High inquiry volume detected. Consider prioritizing leads with budget matching your property range.");
  }

  return suggestions;
}