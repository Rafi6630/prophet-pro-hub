import { useState } from "react";
import { Users, MessageSquare, Phone as PhoneIcon, Handshake, XCircle, Inbox } from "lucide-react";
import PageMeta from "@/components/common/PageMeta";
import LeadCard from "@/components/seller/LeadCard";
import { useLeads, type LeadStatus } from "@/hooks/useLeads";
import { useToast } from "@/hooks/use-toast";

const STATUS_TABS: { key: "all" | LeadStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "all",         label: "All",         icon: Inbox },
  { key: "new",         label: "New",         icon: MessageSquare },
  { key: "contacted",   label: "Contacted",   icon: PhoneIcon },
  { key: "negotiating", label: "Negotiating", icon: Handshake },
  { key: "closed",      label: "Closed",      icon: Users },
  { key: "lost",        label: "Lost",        icon: XCircle },
];

export function SellerLeadsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"all" | LeadStatus>("all");
  const { leads, loading, updateLeadStatus, archiveLead } = useLeads();

  const filtered = activeTab === "all" ? leads : leads.filter((l) => l.status === activeTab);

  const totalNew        = leads.filter(l => l.status === "new").length;
  const totalContacted  = leads.filter(l => l.status === "contacted").length;
  const totalClosed     = leads.filter(l => l.status === "closed").length;

  function handleWhatsapp(leadId: string) {
    const lead = leads.find(l => l.id === leadId);
    if (lead?.phone) {
      window.open(`https://wa.me/${lead.phone.replace(/\D/g, "")}`, "_blank");
    } else {
      toast({ title: "No phone number on record for this lead" });
    }
  }

  function handleCall(leadId: string) {
    const lead = leads.find(l => l.id === leadId);
    if (lead?.phone) {
      window.open(`tel:${lead.phone}`, "_self");
    } else {
      toast({ title: "No phone number on record for this lead" });
    }
  }

  async function handleArchive(id: string) {
    try {
      await archiveLead(id);
      toast({ title: "Lead archived" });
    } catch {
      toast({ title: "Failed to archive lead", variant: "destructive" });
    }
  }

  async function handleStatusChange(id: string, status: LeadStatus) {
    try {
      await updateLeadStatus({ id, status });
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  }

  return (
    <>
      <PageMeta
        title="Leads | IraqProperty Seller"
        description="Manage your property leads and inquiries"
        noIndex
      />

      <div className="px-4 pt-8 pb-8 max-w-5xl mx-auto lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">Seller Portal</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Lead Inbox</h1>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Leads",  value: leads.length,    color: "text-slate-900" },
            { label: "New",          value: totalNew,         color: "text-blue-700" },
            { label: "Contacted",    value: totalContacted,   color: "text-amber-700" },
            // { label: "Closed",       value: totalClosed,      color: "text-emerald-700" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
              <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
            <p className="text-2xl font-extrabold text-emerald-700">{totalClosed}</p>
            <p className="text-xs text-slate-500 mt-0.5">Closed</p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-6">
          {STATUS_TABS.map((tab) => {
            const Icon = tab.icon;
            const count = tab.key === "all" ? leads.length : leads.filter(l => l.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === tab.key ? "bg-white/30 text-white" : "bg-slate-100 text-slate-600"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Lead list */}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white h-52 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Users className="h-8 w-8 text-slate-300" />
            </div>
            <div>
              <p className="font-bold text-slate-700">No leads here</p>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">
                {activeTab === "all"
                  ? "When buyers inquire about your listings, they'll appear here."
                  : `No ${activeTab} leads at the moment.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onStatusChange={handleStatusChange}
                onWhatsapp={handleWhatsapp}
                onCall={handleCall}
                onArchive={handleArchive}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default SellerLeadsPage;
