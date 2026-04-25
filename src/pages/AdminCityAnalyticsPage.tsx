import { BarChart3 } from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { marketInsights } from "@/data/marketInsights";

export function AdminCityAnalyticsPage() {
  return (
    <AdminLayout title="City Analytics" breadcrumb="Demand, pricing, growth">
      <Card className="premium-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-primary">
            <BarChart3 className="h-5 w-5" />
            <p className="text-sm font-semibold uppercase tracking-[0.24em]">City intelligence</p>
          </div>
          <div className="mt-6 grid gap-4">
            {marketInsights.map((row) => (
              <div key={row.cityId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">{row.city}</p>
                    <p className="mt-1 text-sm text-foreground/64">{row.growthOutlook}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-foreground/60">Average Price Per Sqm</p>
                    <p className="mt-1 text-xl font-bold">${row.averagePricePerSqm}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
