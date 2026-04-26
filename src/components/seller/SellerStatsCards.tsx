import { Building2, CheckCircle, Users, Phone, Eye, TrendingUp } from "lucide-react";
import type { SellerStats } from "@/lib/sellerMetrics";

interface SellerStatsCardsProps {
  stats: SellerStats;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  iconColor: string;
  textColor: string;
}

export default function SellerStatsCards({ stats }: SellerStatsCardsProps) {
  const cards: StatCard[] = [
    {
      label: "Total Listings",
      value: stats.totalListings,
      icon: Building2,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      textColor: "text-blue-700",
    },
    {
      label: "Active Listings",
      value: stats.activeListings,
      icon: CheckCircle,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      textColor: "text-emerald-700",
    },
    {
      label: "Total Leads",
      value: stats.totalLeads,
      icon: Users,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      textColor: "text-amber-700",
    },
    {
      label: "WhatsApp Clicks",
      value: stats.whatsappClicks,
      icon: Phone,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      textColor: "text-green-700",
    },
    {
      label: "Views This Month",
      value: stats.viewsThisMonth,
      icon: Eye,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      textColor: "text-purple-700",
    },
    {
      label: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      textColor: "text-amber-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${card.bgColor} flex items-center justify-center`}>
              <Icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 leading-none">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{card.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
