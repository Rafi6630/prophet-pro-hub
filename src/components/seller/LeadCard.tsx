import { Phone, MessageCircle, Archive, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LeadStatus } from "@/hooks/useLeads";

export interface LeadCardLead {
  id: string;
  buyerName: string;
  phone: string;
  message: string;
  propertyTitle: string;
  source: "inspection" | "message" | "whatsapp";
  date: string;
  status: LeadStatus;
}

interface LeadCardProps {
  lead: LeadCardLead;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onWhatsapp: (id: string) => void;
  onCall: (id: string) => void;
  onArchive: (id: string) => void;
}

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new",         label: "New" },
  { value: "contacted",   label: "Contacted" },
  { value: "negotiating", label: "Negotiating" },
  { value: "closed",      label: "Closed" },
  { value: "lost",        label: "Lost" },
];

function statusColor(status: LeadStatus): string {
  switch (status) {
    case "new":         return "bg-blue-100 text-blue-800";
    case "contacted":   return "bg-amber-100 text-amber-800";
    case "negotiating": return "bg-purple-100 text-purple-800";
    case "closed":      return "bg-emerald-100 text-emerald-800";
    case "lost":        return "bg-red-100 text-red-700";
  }
}

function sourceLabel(source: string): string {
  if (source === "inspection") return "Inspection";
  if (source === "message")    return "Message";
  if (source === "whatsapp")   return "WhatsApp";
  return source;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function LeadCard({
  lead,
  onStatusChange,
  onWhatsapp,
  onCall,
  onArchive,
}: LeadCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-amber-400 flex items-center justify-center text-sm font-bold text-white shrink-0">
          {getInitials(lead.buyerName)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-slate-900 text-sm">{lead.buyerName}</h4>
            <span className="text-xs text-slate-400">{formatDate(lead.date)}</span>
          </div>
          {lead.phone && (
            <p className="text-xs text-slate-500 mt-0.5">{lead.phone}</p>
          )}
        </div>
      </div>

      {/* Message */}
      {lead.message && (
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 bg-slate-50 rounded-xl px-3 py-2">
          {lead.message}
        </p>
      )}

      {/* Meta badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] gap-1">
          <Building2 className="h-3 w-3" />
          {lead.propertyTitle.slice(0, 30)}{lead.propertyTitle.length > 30 ? "…" : ""}
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {sourceLabel(lead.source)}
        </Badge>
      </div>

      {/* Status selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 shrink-0">Status:</span>
        <select
          value={lead.status}
          onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
          className={`text-xs rounded-lg px-2 py-1 border font-medium cursor-pointer ${statusColor(lead.status)} border-transparent`}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <Button
          size="sm"
          className="flex-1 h-8 rounded-xl text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
          onClick={() => onWhatsapp(lead.id)}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-8 rounded-xl text-xs border-blue-200 text-blue-700 hover:bg-blue-50 gap-1"
          onClick={() => onCall(lead.id)}
        >
          <Phone className="h-3.5 w-3.5" />
          Call
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 rounded-xl border-slate-200 text-slate-400 hover:bg-slate-50"
          onClick={() => onArchive(lead.id)}
          title="Archive lead"
        >
          <Archive className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
