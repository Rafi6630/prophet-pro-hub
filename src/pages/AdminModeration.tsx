import { AlertTriangle, Copy, ShieldAlert, Tags } from "lucide-react";
import { sampleProperties } from "@/data/sampleProperties";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AdminModeration() {
  const moderationQueues = [
    {
      title: "Flagged listings",
      icon: AlertTriangle,
      items: sampleProperties
        .filter((property) => property.reports.length > 0)
        .map((property) => `${property.title} • ${property.reports[0]?.reason ?? "Report pending"}`),
    },
    {
      title: "Fake prices",
      icon: Tags,
      items: sampleProperties
        .filter((property) => property.suspiciouslyLowPrice)
        .map((property) => `${property.title} priced far below ${property.marketAverage}/sqm market average`),
    },
    {
      title: "Duplicate properties",
      icon: Copy,
      items: ["Najaf duplex posted by two agencies", "Sulaymaniyah farm parcel repeated with different photos"],
    },
    {
      title: "Suspicious sellers",
      icon: ShieldAlert,
      items: sampleProperties
        .filter((property) => !property.seller.verified || property.hasLegalIssues)
        .map((property) => `${property.seller.name} • ${property.title}`),
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
                  {queue.items.map((item) => (
                    <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-sm leading-7 text-foreground/74">{item}</p>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm">Investigate</Button>
                        <Button size="sm" variant="outline">
                          Hide Listing
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AdminLayout>
  );
}
