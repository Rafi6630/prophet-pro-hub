import { useState } from "react";
import { EyeOff, Flag, MessageSquareWarning, ShieldCheck } from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSeededModerationInventory, updateSeededReviewOverride } from "@/lib/sampleInventory";

export function AdminReports() {
  const [refreshKey, setRefreshKey] = useState(0);
  const properties = getSeededModerationInventory();
  const reported = properties.filter((property) => property.reports.length > 0);

  return (
    <AdminLayout title="Admin Reports" breadcrumb="Reports and public visibility">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/10 bg-card/70">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-primary">
              <MessageSquareWarning className="h-5 w-5" />
              <p className="text-sm font-semibold uppercase tracking-[0.24em]">Manage reports</p>
            </div>
            <div className="mt-6 space-y-4">
              {reported.map((property) => (
                <div key={property.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <h3 className="text-lg font-semibold">{property.title}</h3>
                  <p className="mt-1 text-sm text-foreground/64">{property.area}</p>
                  <div className="mt-4 space-y-2 text-sm text-foreground/72">
                    {property.reports.map((report) => (
                      <div key={report.reason} className="flex items-center justify-between rounded-xl bg-slate-950/35 px-3 py-2">
                        <span>{report.reason}</span>
                        <span>{report.count} report(s)</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        updateSeededReviewOverride(property.id, { extraReports: [] });
                        setRefreshKey((value) => value + 1);
                      }}
                    >
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        updateSeededReviewOverride(property.id, { visibility: "review", ownershipStatus: "pending" });
                        setRefreshKey((value) => value + 1);
                      }}
                    >
                      Escalate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/10 bg-card/70">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.24em]">Approve public visibility</p>
              </div>
              <div className="mt-6 space-y-4">
                {properties
                  .filter((property) => property.visibility !== "public")
                  .map((property) => (
                    <div key={property.id} className="rounded-2xl bg-white/[0.03] p-4">
                      <p className="font-semibold">{property.title}</p>
                      <p className="mt-1 text-sm text-foreground/64">
                        Status: {property.visibility} • Ownership: {property.ownershipStatus}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            updateSeededReviewOverride(property.id, { visibility: "public", approved: true });
                            setRefreshKey((value) => value + 1);
                          }}
                        >
                          Approve for Public
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            updateSeededReviewOverride(property.id, { visibility: "review" });
                            setRefreshKey((value) => value + 1);
                          }}
                        >
                          Keep in Review
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/70">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-primary">
                <EyeOff className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.24em]">Visibility actions</p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  "Hide properties with unresolved legal issues",
                  "Require verified seller before publish",
                  "Force re-review on heavy report volume",
                  "Freeze suspicious pricing until admin approval",
                ].map((rule) => (
                  <div key={rule} className="rounded-2xl border border-white/8 bg-slate-950/30 p-4 text-sm text-foreground/72">
                    <Flag className="mb-3 h-4 w-4 text-primary" />
                    {rule}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
