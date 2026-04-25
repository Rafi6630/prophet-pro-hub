import { CheckCircle2, FileBadge2, Shield } from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwnershipStatus } from "@/components/OwnershipStatus";
import { VerifiedBadge } from "@/components/VerifiedBadge";

const sellerReviews = [
  {
    seller: "Al Mansour Property Office",
    city: "Baghdad",
    documents: "Ownership deed, tax letter, seller ID",
    status: "verified" as const,
  },
  {
    seller: "Dara Homes Agency",
    city: "Erbil",
    documents: "Agency license, ownership file, building permit",
    status: "pending" as const,
  },
  {
    seller: "Basra Delta Investments",
    city: "Basra",
    documents: "Transfer file missing municipal clearance",
    status: "missing-documents" as const,
  },
];

export function AdminVerification() {
  return (
    <AdminLayout title="Verification Hub" breadcrumb="Sellers • Documents • Listings">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/10 bg-card/70">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              <p className="text-sm font-semibold uppercase tracking-[0.24em]">
                Approve sellers
              </p>
            </div>
            <div className="mt-6 space-y-4">
              {sellerReviews.map((review) => (
                <div key={review.seller} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{review.seller}</h3>
                      <p className="text-sm text-foreground/64">{review.city}</p>
                    </div>
                    <VerifiedBadge variant={review.status === "verified" ? "agency" : "seller"} />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-foreground/72">{review.documents}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <OwnershipStatus status={review.status} />
                    <Button size="sm">Approve</Button>
                    <Button size="sm" variant="outline">
                      Request More Documents
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
                <FileBadge2 className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.24em]">
                  Review documents
                </p>
              </div>
              <div className="mt-6 space-y-4 text-sm text-foreground/72">
                <div className="rounded-2xl bg-slate-950/35 p-4">
                  Baghdad villa deed matches seller ID and municipal map reference.
                </div>
                <div className="rounded-2xl bg-slate-950/35 p-4">
                  Erbil apartment tower missing notarized agency authorization.
                </div>
                <div className="rounded-2xl bg-slate-950/35 p-4">
                  Basra shop listing needs updated tax clearance before publishing.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/70">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.24em]">
                  Approve listings
                </p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  "Luxury villa in Jadriya",
                  "Commercial building in Ankawa",
                  "Land parcel in Najaf airport road",
                  "Retail row in central Basra",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="font-medium">{item}</p>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm">Publish</Button>
                      <Button size="sm" variant="outline">
                        Hold
                      </Button>
                    </div>
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
