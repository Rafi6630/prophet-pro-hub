import { useQuery } from "@tanstack/react-query";
import { analyzePropertyWithAI, analyzePropertyLocally } from "@/services/aiService";
import type { Property } from "@/core/types/property";

// ── Hook — cached AI analysis for a property ──────────────────────────────────

export function useAIAnalysis(property: Property | null | undefined) {
  return useQuery({
    queryKey: ["ai-analysis", property?.id],
    queryFn:  () => analyzePropertyWithAI(property!),
    enabled:  !!property,
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days — matches Supabase cache TTL
    placeholderData: property ? analyzePropertyLocally(property) : undefined,
  });
}
