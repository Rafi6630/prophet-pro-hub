export interface SellerStats {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  totalLeads: number;
  whatsappClicks: number;
  viewsThisMonth: number;
  conversionRate: number; // leads/views * 100
  subscriptionPlan: string;
  verificationStatus: string;
}

export interface DailyMetric {
  date: string; // "Jan 01"
  views: number;
  leads: number;
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/** Generate 30 days of mock chart data (used when DB has no data yet) */
export function generateMockChartData(): DailyMetric[] {
  const result: DailyMetric[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = `${MONTH_NAMES[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;
    result.push({
      date: label,
      views: Math.floor(Math.random() * 40) + 5,
      leads: Math.floor(Math.random() * 8),
    });
  }
  return result;
}

/** Compute conversion rate safely (no divide-by-zero) */
export function computeConversionRate(leads: number, views: number): number {
  if (!views || views === 0) return 0;
  return Math.round((leads / views) * 1000) / 10; // one decimal
}

/** Format plan name for display */
export function formatPlanName(plan: string): string {
  switch (plan?.toLowerCase()) {
    case "pro":    return "Pro";
    case "agency": return "Agency";
    case "free":   return "Free";
    default:       return plan ?? "Free";
  }
}

/** Get Tailwind color class for the plan badge */
export function planColorClass(plan: string): string {
  switch (plan?.toLowerCase()) {
    case "pro":    return "bg-amber-100 text-amber-800 border-amber-300";
    case "agency": return "bg-purple-100 text-purple-800 border-purple-300";
    default:       return "bg-slate-100 text-slate-700 border-slate-300";
  }
}
