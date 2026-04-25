import { Link, useNavigate } from "react-router-dom";
import { iraqCities } from "@/data/iraqCities";
import { useApp } from "@/contexts/AppContext";

export function Footer() {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();

  return (
    <footer className="mt-14 border-t border-slate-200 bg-white py-14 text-foreground">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">IraqProperty</p>
            <h3 className="mt-3 text-2xl font-bold">Know Everything Before You Buy</h3>
            <p className="mt-2 text-sm font-medium text-emerald-700">اعرف كل شيء قبل أن تشتري</p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-foreground/72">
              Iraq’s trust-first property marketplace for buyers and investors: verified sellers, Fair Price Estimate, area intelligence, and market prices built for faster decisions.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Company</h4>
            <ul className="space-y-2 text-sm text-foreground/72">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/privacy">Privacy</Link></li>
              <li><Link to="/terms">Terms</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Network</h4>
            <ul className="space-y-2 text-sm text-foreground/72">
              <li><Link to="/cities">Cities</Link></li>
              <li><Link to="/agencies">Agencies</Link></li>
              <li><Link to="/developers">Developers</Link></li>
              <li><Link to="/verified-sellers">Verified Sellers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Cities</h4>
            <ul className="space-y-2 text-sm text-foreground/72">
              {iraqCities.slice(0, 6).map((city) => (
                <li key={city.id}><Link to={`/${city.id}-properties`}>{city.nameEn}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 md:flex-row">
          <p className="text-sm text-foreground/56">
            © 2026 IraqProperty. All rights reserved.
          </p>
          <button
            type="button"
            onClick={() => navigate(isAuthenticated ? "/admin" : "/admin/login")}
            className="text-xs text-foreground/25 transition-colors hover:text-foreground/45"
          >
            admin
          </button>
        </div>
      </div>
    </footer>
  );
}
