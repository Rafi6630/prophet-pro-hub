import PageMeta from "@/components/common/PageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { sampleProperties } from "@/data/sampleProperties";

export function SellerDashboardPage() {
  const listings = sampleProperties.slice(0, 4);

  return (
    <div className="container mx-auto px-4 pb-24 pt-28">
      <PageMeta title="Seller Dashboard | IraqProperty" description="Manage listings, leads, verification, and performance." noIndex />
      <section className="section-shell px-6 py-10 md:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Seller Dashboard</p>
          <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">Manage listings, leads, upgrades, and verification from one workspace</h1>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-4">
          {[
            ["My Listings", `${listings.length}`],
            ["Leads This Month", "41"],
            ["Verification Status", "3 approved"],
            ["Performance Score", "92/100"],
          ].map(([label, value]) => (
            <Card key={label} className="premium-card">
              <CardContent className="p-6">
                <p className="text-sm text-foreground/60">{label}</p>
                <p className="mt-3 text-3xl font-bold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-10 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card className="premium-card">
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">My Listings</p>
              <div className="mt-6 space-y-4">
                {listings.map((property) => (
                  <div key={property.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold">{property.title}</p>
                    <p className="mt-1 text-sm text-foreground/64">
                      {property.visibility} • Verification {property.ownershipStatus}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="premium-card">
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Leads and messages</p>
              <div className="mt-6 grid gap-4">
                {[
                  "Upgrade listing to Featured Listing",
                  "Activate Verified Agency subscription",
                  "Reply to WhatsApp and call leads faster",
                  "Track performance analytics by listing",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-foreground/72">{item}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
