import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDeals, fetchDealById, createDeal,
  advanceDealStatus, saveDealAIAnalysis, updateDealNotes,
} from "@/services/dealService";
import type { DealFilters, DealStatus, AIAnalysis } from "@/core/types/deal";
import type { Property } from "@/core/types/property";

// ── All deals ─────────────────────────────────────────────────────────────────

export function useDeals(filters?: DealFilters) {
  return useQuery({
    queryKey: ["deals", filters],
    queryFn:  () => fetchDeals(filters),
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

// ── Single deal ───────────────────────────────────────────────────────────────

export function useDeal(dealId: string) {
  return useQuery({
    queryKey: ["deal", dealId],
    queryFn:  () => fetchDealById(dealId),
    enabled:  !!dealId,
    staleTime: 60 * 1000,
  });
}

// ── Create deal from property ─────────────────────────────────────────────────

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (property: Property) => createDeal(property),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["deals"] }),
  });
}

// ── Advance deal status ───────────────────────────────────────────────────────

export function useAdvanceDealStatus(dealId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ toStatus, note }: { toStatus: DealStatus; note?: string }) =>
      advanceDealStatus(dealId, toStatus, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deal", dealId] });
      qc.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

// ── Save AI analysis ──────────────────────────────────────────────────────────

export function useSaveDealAI(dealId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (analysis: AIAnalysis) => saveDealAIAnalysis(dealId, analysis),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["deal", dealId] }),
  });
}

// ── Update notes ──────────────────────────────────────────────────────────────

export function useUpdateDealNotes(dealId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notes: string) => updateDealNotes(dealId, notes),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["deal", dealId] }),
  });
}
