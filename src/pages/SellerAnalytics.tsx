import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import PageMeta from "@/components/common/PageMeta";
import PerformanceChart from "@/components/seller/PerformanceChart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generateMockChartData } from "@/lib/sellerMetrics";
import { Eye, MousePointerClick, TrendingUp, Calendar } from "lucide-react";

type DateRange = "7d" | "30d" | "90d";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

export function SellerAnalyticsPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const chartData = generateMockChartData();

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ["analytics-listings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("id, title, views, city")
        .eq("user_id", user!.id)
        .order("views", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  const top5 = (listings ?? []).slice(0, 5).map((l) => ({
    name: l.title.slice(0, 20) + (l.title.length > 20 ? "…" : ""),
    views: l.views ?? 0,
    leads: Math.floor((l.views ?? 0) * 0.05),
  }));

  const totalViews = (listings ?? []).reduce((acc, l) => acc + (l.views ?? 0), 0);
  const totalClicks = Math.floor(totalViews * 0.12);
  const avgDaily = dateRange === "7d" ? Math.floor(totalViews / 7) : dateRange === "30d" ? Math.floor(totalViews / 30) : Math.floor(totalViews / 90);

  const bestDay = chartData.reduce((best, d) => d.views > (best?.views ?? 0) ? d : best, chartData[0]);

  const rangeLabels: Record<DateRange, string> = { "7d": "7 Days", "30d": "30 Days", "90d": "90 Days" };

  return (
    <>
      <PageMeta
        title="Analytics | IraqProperty Seller"
        description="Track your listing performance and leads"
        noIndex
      />

      <div className="px-4 pt-8 pb-12 max-w-6xl mx-auto lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">Seller Portal</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Analytics</h1>
          </div>

          {/* Date range selector */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {(["7d", "30d", "90d"] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  dateRange === range ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {rangeLabels[range]}
              </button>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
          <StatCard label="Total Views"    value={totalViews}                   icon={Eye}              color="bg-purple-100 text-purple-600" />
          <StatCard label="Total Clicks"   value={totalClicks}                  icon={MousePointerClick} color="bg-blue-100 text-blue-600" />
          <StatCard label="Avg Daily Views" value={avgDaily}                    icon={TrendingUp}        color="bg-amber-100 text-amber-600" />
          <StatCard label="Best Day"       value={bestDay?.date ?? "—"}         icon={Calendar}          color="bg-emerald-100 text-emerald-600" />
        </div>

        {/* Performance Chart */}
        <div className="mb-6">
          <PerformanceChart data={chartData} loading={false} />
        </div>

        {/* Top 5 listings bar chart */}
        {top5.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Top 5 Listings by Views</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={top5} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Bar dataKey="views" fill="#0a1220" radius={[6, 6, 0, 0]} />
                <Bar dataKey="leads" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Listing Performance</h3>
          </div>
          {listingsLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Listing</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Views</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Leads</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Conv %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(listings ?? []).map((l) => {
                    const views = l.views ?? 0;
                    const leads = Math.floor(views * 0.05);
                    const conv = views > 0 ? ((leads / views) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-800">{l.title}</span>
                          <span className="ml-2 text-xs text-slate-400">{l.city}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">{views}</td>
                        <td className="px-4 py-3 text-right font-medium text-amber-700">{leads}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            Number(conv) >= 5 ? "bg-emerald-100 text-emerald-700" :
                            Number(conv) >= 2 ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                            {conv}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {(listings ?? []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">
                        No listings found. Create your first listing to see analytics.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SellerAnalyticsPage;
