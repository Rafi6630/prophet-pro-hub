import { useState } from "react";
import { AlertTriangle, Copy, ShieldAlert, Tags } from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSeededModerationInventory, updateSeededReviewOverride } from "@/lib/sampleInventory";

export function AdminModeration() {
  const [refreshKey, setRefreshKey] = useState(0);
  const properties = getSeededModerationInventory();

  const moderationQueues = [
    {
      title: "Flagged listings",
      icon: AlertTriangle,
      items: properties
        .filter((property) => property.reports.length > 0)
        .map((property) => ({
          id: property.id,
          label: `${property.title} • ${property.reports[0]?.reason ?? "Report pending"}`,
          onInvestigate: () => {
            updateSeededReviewOverride(property.id, { visibility: "review" });
            setRefreshKey((value) => value + 1);
          },
          onHide: () => {
            updateSeededReviewOverride(property.id, { visibility: "hidden" });
            setRefreshKey((value) => value + 1);
          },
        })),
    },
    {
      title: "Fake prices",
      icon: Tags,
      items: properties
        .filter((property) => property.suspiciouslyLowPrice)
        .map((property) => ({
          id: property.id,
          label: `${property.title} priced far below ${property.marketAverage}/sqm market average`,
          onInvestigate: () => {
            updateSeededReviewOverride(property.id, { ownershipStatus: "pending" });
            setRefreshKey((value) => value + 1);
          },
          onHide: () => {
            updateSeededReviewOverride(property.id, { visibility: "hidden", suspiciouslyLowPrice: true });
            setRefreshKey((value) => value + 1);
          },
        })),
    },
    {
      title: "Duplicate properties",
      icon: Copy,
      items: properties
        .filter((property) => property.visibility === "review")
        .slice(0, 3)
        .map((property) => ({
          id: property.id,
          label: `${property.title} queued for duplicate review`,
          onInvestigate: () => {
            updateSeededReviewOverride(property.id, { visibility: "review" });
            setRefreshKey((value) => value + 1);
          },
          onHide: () => {
            updateSeededReviewOverride(property.id, { visibility: "hidden" });
            setRefreshKey((value) => value + 1);
          },
        })),
    },
    {
      title: "Suspicious sellers",
      icon: ShieldAlert,
      items: properties
        .filter((property) => !property.seller.verified || property.hasLegalIssues)
        .map((property) => ({
          id: property.id,
          label: `${property.seller.name} • ${property.title}`,
          onInvestigate: () => {
            updateSeededReviewOverride(property.id, { sellerVerified: false, visibility: "review" });
            setRefreshKey((value) => value + 1);
          },
          onHide: () => {
            updateSeededReviewOverride(property.id, { visibility: "hidden", sellerVerified: false });
            setRefreshKey((value) => value + 1);
          },
        })),
    },
  ];

  return (
    <AdminLayout title="Admin Moderation" breadcrumb="Safety and quality control">
      <div className="grid gap-6 lg:grid-cols-2">
        {moderationQueues.map((queue) => {
          const Icon = queue.icon;
          return (
            <Card key={queue.title} className="border-white/10 bg-card/70">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-primary">
                  <Icon className="h-5 w-5" />
                  <p className="text-sm font-semibold uppercase tracking-[0.24em]">{queue.title}</p>
                </div>
                <div className="mt-6 space-y-4">
                  {queue.items.length ? queue.items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-sm leading-7 text-foreground/74">{item.label}</p>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" onClick={item.onInvestigate}>Investigate</Button>
                        <Button size="sm" variant="outline" onClick={item.onHide}>
                          Hide Listing
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-foreground/70">
                      Queue is clear.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AdminLayout>
  );
}
