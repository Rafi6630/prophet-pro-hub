import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type LeadStatus = "new" | "contacted" | "negotiating" | "closed" | "lost";

export interface Lead {
  id: string;
  buyerName: string;
  phone: string;
  message: string;
  propertyTitle: string;
  propertyId: string;
  source: "inspection" | "message" | "whatsapp";
  date: string;
  status: LeadStatus;
}

const LS_KEY = "iraq_property_lead_statuses";

function getStoredStatuses(): Record<string, LeadStatus> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStoredStatus(id: string, status: LeadStatus) {
  const all = getStoredStatuses();
  all[id] = status;
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}

const ARCHIVED_KEY = "iraq_property_archived_leads";

function getArchivedIds(): string[] {
  try {
    const raw = localStorage.getItem(ARCHIVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function archiveId(id: string) {
  const ids = getArchivedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(ARCHIVED_KEY, JSON.stringify(ids));
  }
}

export function useLeads() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const leadsQuery = useQuery({
    queryKey: ["seller-leads", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Lead[]> => {
      const archivedIds = getArchivedIds();
      const storedStatuses = getStoredStatuses();

      // Fetch inspection requests for this seller
      const { data: inspections, error: inspErr } = await supabase
        .from("inspection_requests")
        .select("id, property_id, buyer_id, status, scheduled_date, properties(title)")
        .eq("seller_id", user!.id)
        .order("scheduled_date", { ascending: false })
        .limit(50);

      if (inspErr) throw inspErr;

      // Fetch messages sent to this seller
      const { data: messages, error: msgErr } = await supabase
        .from("messages")
        .select("id, property_id, sender_id, content, created_at, properties(title)")
        .eq("recipient_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (msgErr) throw msgErr;

      const leads: Lead[] = [];

      for (const insp of inspections ?? []) {
        if (archivedIds.includes(insp.id)) continue;
        const status: LeadStatus = storedStatuses[insp.id] ?? mapInspStatus(insp.status);
        const prop = insp.properties as { title: string } | null;
        leads.push({
          id: insp.id,
          buyerName: "Buyer " + insp.buyer_id.slice(0, 6),
          phone: "",
          message: `Inspection scheduled for ${insp.scheduled_date ?? "TBD"}`,
          propertyTitle: prop?.title ?? "Unknown Property",
          propertyId: insp.property_id,
          source: "inspection",
          date: insp.scheduled_date ?? new Date().toISOString(),
          status,
        });
      }

      for (const msg of messages ?? []) {
        if (archivedIds.includes(msg.id)) continue;
        const status: LeadStatus = storedStatuses[msg.id] ?? "new";
        const prop = msg.properties as { title: string } | null;
        leads.push({
          id: msg.id,
          buyerName: "Buyer " + msg.sender_id.slice(0, 6),
          phone: "",
          message: (msg.content as string) ?? "",
          propertyTitle: prop?.title ?? "Unknown Property",
          propertyId: msg.property_id,
          source: "message",
          date: msg.created_at,
          status,
        });
      }

      // Sort by date descending
      leads.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return leads;
    },
  });

  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      setStoredStatus(id, status);
      // Also try to update inspection_requests status if applicable
      await supabase
        .from("inspection_requests")
        .update({ status: status })
        .eq("id", id)
        .eq("seller_id", user!.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-leads", user?.id] });
    },
  });

  const archiveLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      archiveId(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-leads", user?.id] });
    },
  });

  return {
    leads: leadsQuery.data ?? [],
    loading: leadsQuery.isLoading,
    error: leadsQuery.error,
    updateLeadStatus: updateLeadStatusMutation.mutateAsync,
    archiveLead: archiveLeadMutation.mutateAsync,
  };
}

function mapInspStatus(s: string | null): LeadStatus {
  if (!s) return "new";
  if (s === "confirmed") return "contacted";
  if (s === "completed") return "closed";
  if (s === "cancelled") return "lost";
  return "new";
}
