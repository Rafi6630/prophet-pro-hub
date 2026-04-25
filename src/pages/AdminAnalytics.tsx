import { BarChart3, Building2, CheckCheck, Percent, PhoneCall } from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";

const metrics = [
  { label: "Total Listings", value: "1,284", icon: Building2, note: "+8.2% month over month" },
  { label: "Verified Sellers", value: "346", icon: CheckCheck, note: "81 cleared this month" },
  { label: "Monthly Leads", value: "2,913", icon: PhoneCall, note: "Calls, WhatsApp, saved offers" },
  { label: "Top Cities", value: "Baghdad • Erbil • Basra", icon: BarChart3, note: "Highest buyer intent" },
  { label: "Conversion Rate", value: "12.8%", icon: Percent, note: "Lead to serious buyer inquiry" },
];

export function AdminAnalytics() {
  return (
    <AdminLayout title="Admin Analytics" breadcrumb="Performance overview">
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="border-white/10 bg-card/70 xl:col-span-1">
              <CardContent className="p-6">
                <Icon className="h-5 w-5 text-primary" />
                <p className="mt-5 text-sm text-foreground/64">{metric.label}</p>
                <p className="mt-2 text-3xl font-bold">{metric.value}</p>
                <p className="mt-3 text-sm leading-6 text-foreground/62">{metric.note}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/10 bg-card/70">
          <CardContent className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              City performance
            </p>
            <div className="mt-6 space-y-4">
              {[
                ["Baghdad", "41% of high-intent leads"],
                ["Erbil", "Strong premium villa demand"],
                ["Basra", "Top commercial shop lead volume"],
                ["Najaf", "Religious tourism corridor interest rising"],
              ].map(([city, insight]) => (
                <div key={city} className="rounded-2xl bg-white/[0.03] p-4">
                  <p className="font-semibold">{city}</p>
                  <p className="mt-2 text-sm text-foreground/68">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/70">
          <CardContent className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Funnel health
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Listing View to Contact", "18.4%"],
                ["Verified Seller Contact Rate", "24.7%"],
                ["Fair Price Viewed Before Contact", "63%"],
                ["Map Search Assisted Leads", "29%"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/8 bg-slate-950/30 p-4">
                  <p className="text-sm text-foreground/64">{label}</p>
                  <p className="mt-3 text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
