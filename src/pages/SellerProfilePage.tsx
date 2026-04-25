import { Link, useParams } from "react-router-dom";
import PageMeta from "@/components/common/PageMeta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { sellerProfiles } from "@/data/sellerProfiles";
import { publicProperties } from "@/data/sampleProperties";
import { enrichProperty } from "@/lib/propertyMetrics";
import { PropertyCard } from "@/components/PropertyCard";
import { VerifiedBadge } from "@/components/VerifiedBadge";

export function SellerProfilePage() {
  const { sellerSlug } = useParams();
  const seller = sellerProfiles.find((item) => item.slug === sellerSlug);

  if (!seller) {
    return (
      <div className="container mx-auto px-4 pb-24 pt-28">
        <Card className="premium-card">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold">Seller profile not found</h1>
          </CardContent>
        </Card>
      </div>
    );
  }

  const listings = publicProperties
    .filter((property) => property.seller.id === seller.id)
    .map(enrichProperty);

  return (
    <div className="container mx-auto px-4 pb-24 pt-28">
      <PageMeta title={`${seller.name} | IraqProperty`} description={seller.bio} />
      <section className="section-shell px-6 py-10 md:px-8">
        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="premium-card border-0 shadow-none">
            <CardContent className="p-0">
              <div className="rounded-[2rem] bg-secondary p-8 text-secondary-foreground">
                <div className="flex flex-wrap gap-2">
                  <VerifiedBadge variant={seller.type === "Agency" ? "agency" : "seller"} />
                </div>
                <h1 className="mt-5 text-4xl font-extrabold">{seller.name}</h1>
                <p className="mt-2 text-base text-secondary-foreground/70">{seller.nameAr}</p>
                <p className="mt-5 text-sm leading-7 text-secondary-foreground/76">{seller.bio}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <SellerStat label="Seller Rating" value={seller.rating.toFixed(1)} />
                  <SellerStat label="Completed Deals" value={`${seller.completedDeals}`} />
                  <SellerStat label="Response Time" value={seller.responseTime} />
                  <SellerStat label="Cities Served" value={seller.cities.join(", ")} />
                </div>
                <div className="mt-6 flex gap-3">
                  <Button asChild className="flex-1">
                    <Link to="/buy">Browse Listings</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10">
                    <Link to="/seller/dashboard">Seller Dashboard</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            {listings.map((listing) => (
              <PropertyCard key={listing.id} property={listing} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SellerStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/8 p-4">
      <p className="text-sm text-secondary-foreground/62">{label}</p>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}
