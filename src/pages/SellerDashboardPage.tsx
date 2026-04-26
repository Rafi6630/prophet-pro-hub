import { Link } from "react-router-dom";
import { BadgeCheck, CreditCard, Settings, UserCircle2 } from "lucide-react";
import PageMeta from "@/components/common/PageMeta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { sampleProperties } from "@/data/sampleProperties";
import SellerAccessGate from "@/components/SellerAccessGate";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles, addRole } from "@/hooks/useUserRoles";

export function SellerDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isSeller, loading, refetchRoles } = useUserRoles();
  const listings = sampleProperties.slice(0, 4);

  const activateSellerMode = async () => {
    if (!user) return;
    const { error } = await addRole(user.id, "seller");
    if (error && !error.message.includes("duplicate")) {
      toast({ title: "Unable to activate seller mode", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Seller mode activated" });
    // Refetch roles in-place — no page reload needed
    refetchRoles();
  };

  return (
    <SellerAccessGate isSeller={isSeller} loading={loading} onActivate={activateSellerMode}>
      <div className="container mx-auto px-4 pb-24 pt-28">
        <PageMeta title="Seller Dashboard | IraqProperty" description="Manage listings, leads, verification, and performance." noIndex />
        <section className="section-shell px-6 py-10 md:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Seller Dashboard</p>
            <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">Manage listings, leads, upgrades, and verification from one workspace</h1>
          </div>

          {/* Stats */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

          {/* Quick actions */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Card className="premium-card">
              <CardContent className="p-6">
                <UserCircle2 className="h-6 w-6 text-primary" />
                <h3 className="mt-4 text-xl font-bold">User Profile</h3>
                <p className="mt-2 text-sm leading-7 text-foreground/70">Update public identity, contact details, and city coverage before buyers reach out.</p>
                <Button asChild variant="outline" className="mt-5 w-full border-slate-200 bg-white">
                  <Link to="/dashboard/profile">Open Profile</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="premium-card">
              <CardContent className="p-6">
                <Settings className="h-6 w-6 text-primary" />
                <h3 className="mt-4 text-xl font-bold">Settings</h3>
                <p className="mt-2 text-sm leading-7 text-foreground/70">Control language, notifications, and market update preferences from one place.</p>
                <Button asChild variant="outline" className="mt-5 w-full border-slate-200 bg-white">
                  <Link to="/dashboard/settings">Open Settings</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="premium-card">
              <CardContent className="p-6">
                <CreditCard className="h-6 w-6 text-primary" />
                <h3 className="mt-4 text-xl font-bold">Subscription Plan</h3>
                <p className="mt-2 text-sm leading-7 text-foreground/70">Choose Featured Listing, Verified Agency, or premium investor visibility upgrades.</p>
                <Button asChild className="mt-5 w-full">
                  <Link to="/dashboard/subscription">View Plans</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Listings + Leads */}
          <div className="mt-10 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="premium-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">My Listings</p>
                  <Button asChild size="sm" className="rounded-xl text-xs">
                    <Link to="/listings/new">+ Add Listing</Link>
                  </Button>
                </div>
                {listings.length === 0 ? (
                  <div className="mt-8 flex flex-col items-center gap-3 py-6 text-center">
                    <p className="text-sm text-foreground/60">No listings yet.</p>
                    <Button asChild size="sm">
                      <Link to="/listings/new">Create your first listing</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {listings.map((property) => (
                      <div key={property.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="font-semibold">{property.title}</p>
                        <p className="mt-1 text-sm text-foreground/60">
                          {property.visibility} • Verification {property.ownershipStatus}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="premium-card">
              <CardContent className="p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Leads, messages, and upgrades</p>
                <div className="mt-6 grid gap-4">
                  {[
                    "Upgrade listing to Featured Listing",
                    "Activate Verified Agency subscription",
                    "Reply to WhatsApp and call leads faster",
                    "Track performance analytics by listing",
                    "Review profile, settings, and trust status regularly",
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-foreground/72">{item}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Onboarding checklist */}
          <div className="mt-6">
            <Card className="premium-card">
              <CardContent className="p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Seller onboarding checklist</p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {[
                    "Complete public profile and contact details",
                    "Submit verification documents",
                    "Publish your first premium-quality listing",
                    "Activate a subscription plan for stronger placement",
                  ].map((item, index) => (
                    <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-foreground/74">
                      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Verification CTA */}
          <div className="mt-6">
            <Card className="premium-card border-emerald-200 bg-emerald-50">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-1 h-6 w-6 text-emerald-700" />
                  <div>
                    <h3 className="text-xl font-bold text-emerald-900">Become a fully verified agency</h3>
                    <p className="mt-2 text-sm leading-7 text-emerald-800">Unlock stronger trust placement, subscription-led monetization, and premium lead conversion tools.</p>
                  </div>
                </div>
                <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
                  <Link to="/verification">Open Verification</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </SellerAccessGate>
  );
}
