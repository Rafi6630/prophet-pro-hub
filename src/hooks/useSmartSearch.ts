import { useState, useCallback, useMemo } from "react";
import { parseSearchQuery, buildFilterFromParsedQuery, type ParsedSearchQuery, SUGGESTED_SEARCHES } from "@/lib/ai/searchParser";
import { useListings } from "./useListings";

export interface SmartSearchState {
  query: string;
  parsed: ParsedSearchQuery | null;
  isLoading: boolean;
  error: string | null;
  suggestions: typeof SUGGESTED_SEARCHES;
  recentSearches: string[];
  results: unknown[];
  totalResults: number;
}

export function useSmartSearch() {
  const [state, setState] = useState<SmartSearchState>({
    query: "",
    parsed: null,
    isLoading: false,
    error: null,
    suggestions: SUGGESTED_SEARCHES,
    recentSearches: [],
    results: [],
    totalResults: 0,
  });

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem("iraq-property-recent-searches");
    return saved ? JSON.parse(saved) : [];
  });

  const updateState = useCallback((updates: Partial<SmartSearchState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      updateState({ query: "", parsed: null, results: [], totalResults: 0 });
      return;
    }

    updateState({ query, isLoading: true, error: null });

    try {
      const parsed = parseSearchQuery(query);
      const filters = buildFilterFromParsedQuery(parsed);

      await new Promise((resolve) => setTimeout(resolve, 300));

      const mockResults = generateMockResults(parsed);
      const newRecent = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem("iraq-property-recent-searches", JSON.stringify(newRecent));

      updateState({
        parsed,
        isLoading: false,
        results: mockResults,
        totalResults: mockResults.length,
        recentSearches: newRecent,
      });
    } catch (error) {
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : "Search failed",
      });
    }
  }, [recentSearches, updateState]);

  const clearSearch = useCallback(() => {
    updateState({
      query: "",
      parsed: null,
      isLoading: false,
      error: null,
      results: [],
      totalResults: 0,
    });
  }, [updateState]);

  const removeRecentSearch = useCallback((searchTerm: string) => {
    const newRecent = recentSearches.filter((s) => s !== searchTerm);
    setRecentSearches(newRecent);
    localStorage.setItem("iraq-property-recent-searches", JSON.stringify(newRecent));
    updateState({ recentSearches: newRecent });
  }, [recentSearches, updateState]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem("iraq-property-recent-searches");
    updateState({ recentSearches: [] });
  }, [updateState]);

  const parseQuery = useCallback((query: string): ParsedSearchQuery => {
    return parseSearchQuery(query);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return state.parsed ? (
      state.parsed.city ||
      state.parsed.propertyType ||
      state.parsed.budget ||
      state.parsed.bedrooms ||
      state.parsed.features.length > 0 ||
      state.parsed.verifiedOnly
    ) : false;
  }, [state.parsed]);

  const filtersSummary = useMemo(() => {
    if (!state.parsed) return "";

    const parts: string[] = [];
    if (state.parsed.city) parts.push(state.parsed.city);
    if (state.parsed.propertyType) parts.push(state.parsed.propertyType);
    if (state.parsed.bedrooms) parts.push(`${state.parsed.bedrooms} bed`);
    if (state.parsed.budget) {
      if (state.parsed.budget.max) parts.push(`under $${state.parsed.budget.max / 1000}K`);
      if (state.parsed.budget.min) parts.push(`over $${state.parsed.budget.min / 1000}K`);
    }
    if (state.parsed.verifiedOnly) parts.push("verified");
    if (state.parsed.features.length > 0) parts.push(state.parsed.features.join(", "));

    return parts.join(" • ");
  }, [state.parsed]);

  return {
    ...state,
    search,
    clearSearch,
    parseQuery,
    removeRecentSearch,
    clearRecentSearches,
    hasActiveFilters,
    filtersSummary,
    suggestedSearches: SUGGESTED_SEARCHES,
  };
}

function generateMockResults(parsed: ParsedSearchQuery): unknown[] {
  const mockProperties = [
    {
      id: "1",
      title: `${parsed.propertyType || "Property"} in ${parsed.city || "Baghdad"}`,
      price: parsed.budget?.max || 150000,
      size: parsed.size?.min || 200,
      bedrooms: parsed.bedrooms || 3,
      city: parsed.city || "Baghdad",
      propertyType: parsed.propertyType || "apartment",
    },
    {
      id: "2",
      title: `Modern ${parsed.propertyType || "Apartment"} ${parsed.city || "Erbil"}`,
      price: (parsed.budget?.max || 200000) * 1.2,
      size: (parsed.size?.min || 180) * 1.1,
      bedrooms: (parsed.bedrooms || 3) + 1,
      city: parsed.city || "Erbil",
      propertyType: parsed.propertyType || "apartment",
    },
  ];

  return mockProperties;
}

export function useSearchFilters(parsed: ParsedSearchQuery | null) {
  const filters = useMemo(() => {
    if (!parsed) return {};
    return buildFilterFromParsedQuery(parsed);
  }, [parsed]);

  const activeFilterCount = useMemo(() => {
    if (!parsed) return 0;
    let count = 0;
    if (parsed.city) count++;
    if (parsed.propertyType) count++;
    if (parsed.budget) count++;
    if (parsed.bedrooms) count++;
    if (parsed.bathrooms) count++;
    if (parsed.size) count++;
    if (parsed.features.length > 0) count++;
    if (parsed.verifiedOnly) count++;
    return count;
  }, [parsed]);

  return { filters, activeFilterCount };
}