import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Search, TrendingUp, Map, BarChart3, ShieldCheck, Heart, LayoutGrid, LogIn, Menu, Sparkles, X, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import LanguageToggle from "./LanguageToggle";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useActiveRole } from "@/hooks/useActiveRole";
import { Button } from "./ui/button";
import { iraqCities } from "@/data/iraqCities";

const NAV = [
  { to: "/", icon: Home, key: "home" },
  { to: "/buy", icon: Search, key: "buy" },
  { to: "/investment", icon: TrendingUp, key: "investment" },
  { to: "/map", icon: Map, key: "map" },
  { to: "/market", icon: BarChart3, key: "marketPrices" },
  { to: "/sellers", icon: ShieldCheck, key: "verifiedSellers" },
  { to: "/favorites", icon: Heart, key: "favorites" },
  { to: "/dashboard", icon: LayoutGrid, key: "dashboard" },
] as const;

// Mobile bottom nav — most-used 5
const MOBILE_NAV = [
  { to: "/", icon: Home, key: "home" },
  { to: "/buy", icon: Search, key: "buy" },
  { to: "/investment", icon: TrendingUp, key: "investment" },
  { to: "/favorites", icon: Heart, key: "favorites" },
  { to: "/dashboard", icon: LayoutGrid, key: "dashboard" },
] as const;

/**
 * Segmented "Buyer | Seller" toggle shown in the header for users who hold
 * the seller role. Switches the active UI context instantly without a reload.
 */
function RoleSwitcher() {
  const { t } = useTranslation();
  const { isSeller, loading } = useUserRoles();
  const { activeRole, switchRole } = useActiveRole();
  const navigate = useNavigate();

  if (loading || !isSeller) return null;

  const handleSwitch = (role: "buyer" | "seller") => {
    switchRole(role);
    if (role === "seller") navigate("/seller/dashboard");
  };

  return (
    <div className="hidden sm:flex items-center rounded-full border border-border/80 bg-secondary/60 p-0.5 text-xs font-semibold">
      <button
        onClick={() => handleSwitch("buyer")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all ${
          activeRole === "buyer"
            ? "bg-foreground text-background shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={activeRole === "buyer"}
      >
        <Heart className="h-3 w-3" />
        {t("roleSwitch.buyer")}
      </button>
      <button
        onClick={() => handleSwitch("seller")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all ${
          activeRole === "seller"
            ? "bg-foreground text-background shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={activeRole === "seller"}>
        <Building2 className="h-3 w-3" />
        {t("roleSwitch.seller")}
      </button>
    </div>
  );
}

export function Header() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-2xl">
      <div className="container-app flex min-h-[4.5rem] items-center gap-3 py-2">
        <Link to="/" className="flex items-center gap-2 me-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary to-amber-300 text-white shadow-[0_12px_30px_rgba(245,158,11,0.32)]">
            ع
          </div>
          <div className="leading-tight">
            <div className="font-extrabold text-lg tracking-tight">{t("common.appName")}</div>
            <div className="text-[10px] text-muted-foreground hidden sm:block">{t("common.tagline")}</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {NAV.slice(0, 7).map(item => {
            const active = location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link-shell ${
                  active
                    ? "bg-foreground text-background shadow-[0_10px_30px_rgba(15,23,42,0.18)]"
                    : "text-muted-foreground hover:bg-white hover:text-foreground"
                }`}
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 ms-auto">
          <LanguageToggle compact />
          {/* Role switcher — only visible when user is a seller */}
          <RoleSwitcher />
          <div className="hidden xl:flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-foreground/72">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {t("common.tagline")}
          </div>
          {user ? (
            <Link to="/dashboard">
              <Button size="sm" className="hidden rounded-full px-4 sm:inline-flex">{t("nav.dashboard")}</Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button size="sm" variant="default" className="gap-1.5 rounded-full px-4 shadow-[0_12px_30px_rgba(245,158,11,0.24)]">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">{t("nav.signIn")}</span>
              </Button>
            </Link>
          )}
          <button
            onClick={() => setOpen(o => !o)}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-border/60 bg-white/80 hover:bg-secondary lg:hidden"
            aria-label={t("nav.menu")}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="animate-fade-in border-t border-border bg-card/95 backdrop-blur-xl lg:hidden">
          <div className="container-app py-3">
            <div className="mb-3 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground/72">
              {t("nav.browseInfo")}
            </div>
            <nav className="grid grid-cols-2 gap-2">
              {NAV.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2 rounded-2xl border border-border/70 bg-white px-3 py-3 text-sm font-medium shadow-sm hover:bg-secondary"
                >
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </nav>
            {/* Mobile role switcher */}
            <MobileRoleSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}

function MobileRoleSwitcher() {
  const { t } = useTranslation();
  const { isSeller, loading } = useUserRoles();
  const { activeRole, switchRole } = useActiveRole();
  const navigate = useNavigate();

  if (loading || !isSeller) return null;

  const handleSwitch = (role: "buyer" | "seller") => {
    switchRole(role);
    if (role === "seller") navigate("/seller/dashboard");
  };

  return (
    <div className="mt-3 flex rounded-2xl border border-border/70 bg-white p-1 shadow-sm">
      {(["buyer", "seller"] as const).map(role => (
        <button
          key={role}
          onClick={() => handleSwitch(role)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
            activeRole === role
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          {role === "buyer" ? <Heart className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
          {role === "buyer" ? t("roleSwitch.buyerMode") : t("roleSwitch.sellerMode")}
        </button>
      ))}
    </div>
  );
}

export function MobileBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <nav className="mobile-nav border-t border-border/70 bg-white/92 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5 max-w-md mx-auto">
        {MOBILE_NAV.map(item => {
          const active = location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? "stroke-[2.4]" : ""}`} />
              <span className="text-[10px] font-medium leading-none">{t(`nav.${item.key}`)}</span>
              {active && <span className="w-1 h-1 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pb-nav lg:pb-0">
        <div className="mx-auto w-full max-w-[1600px]">{children}</div>
      </main>
      <footer className="mt-14 border-t border-slate-200/80 bg-white/80 py-14 text-foreground backdrop-blur-sm">
        <div className="container-app">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">IraqProperty</p>
              <h3 className="mt-3 text-2xl font-bold">Know Everything Before You Buy</h3>
              <p className="mt-2 text-sm font-medium text-emerald-700">اعرف كل شيء قبل أن تشتري</p>
              <p className="mt-4 max-w-xl text-sm leading-7 text-foreground/72">
                Iraq's trust-first property marketplace for serious buyers and investors, built around verified sellers,
                pricing clarity, and stronger decision confidence.
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
                <li><Link to="/sellers">Verified Sellers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Core Cities</h4>
              <ul className="grid grid-cols-2 gap-y-2 text-sm text-foreground/72">
                {iraqCities.slice(0, 6).map((city) => (
                  <li key={city.id}><Link to={`/buy?city=${city.nameEn}`}>{city.nameEn}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-foreground/56">
            © 2026 IraqProperty. Built for Iraq first, with a path to regional investors into Iraq.
          </div>
        </div>
      </footer>
      <MobileBottomNav />
    </div>
  );
}
