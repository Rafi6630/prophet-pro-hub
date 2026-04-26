import type { ReactNode } from "react";
import { CheckCircle2, Rocket, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface SellerAccessGateProps {
  isSeller: boolean;
  /** Pass useUserRoles().loading so the gate never flashes for real sellers */
  loading?: boolean;
  onActivate: () => void;
  children: ReactNode;
}

export function SellerAccessGate({
  isSeller,
  loading = false,
  onActivate,
  children,
}: SellerAccessGateProps) {
  // While role state is still loading, show a neutral spinner — never flash
  // the "activate seller" screen at a user who already has the role.
  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isSeller) {
    return <>{children}</>;
  }

  return (
    <div className="container-app py-6 lg:py-10">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="hero-shell px-6 py-8 text-white lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold">
            <Rocket className="h-4 w-4 text-amber-300" />
            Seller mode required
          </div>
          <h1 className="mt-4 text-3xl font-extrabold lg:text-4xl">Switch into seller mode to unlock these tools</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/76 lg:text-base">
            Publish listings, review leads, answer messages, and build trust with verification before buyers contact you.
          </p>
        </div>
        <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div className="grid gap-3">
            {[
              "Create and manage property listings",
              "Track leads, offers, and response performance",
              "Activate verification and subscription upgrades",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 lg:w-64">
            <Button onClick={onActivate} size="lg" className="rounded-2xl">
              <ShieldCheck className="h-4 w-4" />
              Activate Seller Mode
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-2xl border-slate-200 bg-white">
              <Link to="/verification">Open Verification</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerAccessGate;
