import { Link } from "react-router-dom";
import PageMeta from "@/components/common/PageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sellerProfiles } from "@/data/sellerProfiles";
import { createOrganizationSchema } from "@/lib/structuredData";
import { VerifiedBadge } from "@/components/VerifiedBadge";

export function VerifiedSellersPage() {
  return (
    <div className="container mx-auto px-4 pb-24 pt-28">
      <PageMeta
        title="Verified Sellers | IraqProperty"
        description="Browse trusted agencies, developers, and sellers with active listings, ratings, and completed deals."
        structuredData={createOrganizationSchema()}
      />
      <section className="section-shell px-6 py-10 md:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Verified Sellers Network</p>
          <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">Trusted agencies and sellers buyers can move with faster</h1>
          <p className="mt-4 text-base leading-8 text-foreground/68">
            Every profile highlights active listings, response time, completed deals, and verification status so buyers know who deserves their attention.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {sellerProfiles.map((seller) => (
            <Card key={seller.id} className="premium-card">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <VerifiedBadge variant={seller.type === "Agency" ? "agency" : "seller"} />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold">{seller.name}</h2>
                    <p className="mt-1 text-sm text-foreground/62">{seller.nameAr}</p>
                    <p className="mt-4 text-sm leading-7 text-foreground/70">{seller.bio}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-accent px-4 py-3 text-accent-foreground">
                    <p className="text-xs uppercase tracking-[0.18em]">Rating</p>
                    <p className="mt-2 text-2xl font-bold">{seller.rating}</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Info label="Response Time" value={seller.responseTime} />
                  <Info label="Completed Deals" value={`${seller.completedDeals}`} />
                  <Info label="Active Listings" value={`${seller.activeListings}`} />
                  <Info label="Subscription" value={seller.subscriptionTier} />
                </div>
                <div className="mt-6 flex gap-3">
                  <Button asChild className="flex-1">
                    <Link to={`/sellers/${seller.slug}`}>View Profile</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 border-slate-200 bg-white">
                    <Link to="/buy">See Listings</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-foreground/60">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}
