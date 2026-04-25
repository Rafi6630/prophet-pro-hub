import { Link, useNavigate } from "react-router-dom";
import { MapPin, PhoneCall, ShieldCheck } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export function Footer() {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();

  return (
    <footer className="mt-14 border-t border-white/10 bg-secondary/85 py-14 text-secondary-foreground backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-[1.25fr_0.9fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">IraqProperty</p>
            <h3 className="mt-3 text-2xl font-bold">Know Everything Before You Buy</h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-secondary-foreground/76">
              Serious Iraq-focused real estate research, trusted sellers, Fair Price Estimate, and ownership checks for confident buyers and investors.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Explore</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/78">
              <li><Link to="/buy">Buy</Link></li>
              <li><Link to="/investment">Investment</Link></li>
              <li><Link to="/market-prices">Market Prices</Link></li>
              <li><Link to="/verified-sellers">Verified Sellers</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Trust Signals</h4>
            <ul className="space-y-3 text-sm text-secondary-foreground/78">
              <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />Ownership review workflow for higher confidence</li>
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" />Coverage across Baghdad, Erbil, Basra, Najaf, and more</li>
              <li className="flex items-start gap-2"><PhoneCall className="mt-0.5 h-4 w-4 text-primary" />Lead tracking for calls, WhatsApp, offers, and saves</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-secondary-foreground/20 pt-6 md:flex-row">
          <p className="text-sm text-secondary-foreground/60">
            © 2026 IraqProperty. All rights reserved.
          </p>
          <button
            type="button"
            onClick={() => navigate(isAuthenticated ? "/admin" : "/admin/login")}
            className="text-xs text-secondary-foreground/20 transition-colors hover:text-secondary-foreground/45"
          >
            admin
          </button>
        </div>
      </div>
    </footer>
  );
}
