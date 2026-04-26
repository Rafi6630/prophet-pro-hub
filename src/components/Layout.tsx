import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home, Search, TrendingUp, Map, BarChart3, ShieldCheck, Heart,
  LayoutGrid, LogIn, Menu, X, Building2,
} from "lucide-react";
import { useState, useEffect } from "react";
import LanguageToggle from "./LanguageToggle";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/contexts/RolesContext";
import { useActiveRoleCtx } from "@/contexts/ActiveRoleContext";
import { Button } from "./ui/button";
import { iraqCities } from "@/data/iraqCities";

const NAV = [
  { to: "/",           icon: Home,        key: "home" },
  { to: "/buy",        icon: Search,      key: "buy" },
  { to: "/investment", icon: TrendingUp,  key: "investment" },
  { to: "/map",        icon: Map,         key: "map" },
  { to: "/market",     icon: BarChart3,   key: "marketPrices" },
  { to: "/sellers",    icon: ShieldCheck, key: "verifiedSellers" },
  { to: "/favorites",  icon: Heart,       key: "favorites" },
  { to: "/dashboard",  icon: LayoutGrid,  key: "dashboard" },
] as const;

const MOBILE_NAV = [
  { to: "/",           icon: Home,       key: "home" },
  { to: "/buy",        icon: Search,     key: "buy" },
  { to: "/investment", icon: TrendingUp, key: "investment" },
  { to: "/favorites",  icon: Heart,      key: "favorites" },
  { to: "/dashboard",  icon: LayoutGrid, key: "dashboard" },
] as const;

// ─── Role switcher (topbar + drawer) ─────────────────────────────────────────

function RoleSwitcher({ dark = false }: { dark?: boolean }) {
  const { t } = useTranslation();
  const { isSeller, loading } = useRoles();
  const { activeRole, switchRole } = useActiveRoleCtx();
  const navigate = useNavigate();

  if (loading || !isSeller) return null;

  const handleSwitch = (role: "buyer" | "seller") => {
    switchRole(role);
    navigate(role === "seller" ? "/seller/dashboard" : "/dashboard");
  };

  const base = dark
    ? "flex items-center rounded-xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent))] p-0.5 text-xs font-semibold"
    : "flex items-center rounded-full border border-border/80 bg-secondary/60 p-0.5 text-xs font-semibold";

  const activeClass = dark
    ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-background))] shadow-sm"
    : "bg-foreground text-background shadow-sm";

  const inactiveClass = dark
    ? "text-[hsl(var(--sidebar-foreground))]/55 hover:text-[hsl(var(--sidebar-foreground))]"
    : "text-muted-foreground hover:text-foreground";

  const btnShape = dark ? "rounded-lg" : "rounded-full";

  return (
    <div className={base}>
      {(["buyer", "seller"] as const).map(role => (
        <button
          key={role}
          onClick={() => handleSwitch(role)}
          aria-pressed={activeRole === role}
          className={`flex items-center gap-1.5 ${btnShape} px-3 py-1.5 transition-all ${
            activeRole === role ? activeClass : inactiveClass
          }`}
        >
          {role === "buyer" ? <Heart className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
          {role === "buyer" ? t("roleSwitch.buyer") : t("roleSwitch.seller")}
        </button>
      ))}
    </div>
  );
}

// ─── Desktop topbar ───────────────────────────────────────────────────────────

export function Header({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-2xl">
      <div className="container-app flex min-h-[4.5rem] items-center gap-3 py-2">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 me-2 shrink-0">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary to-amber-300 text-white shadow-[0_12px_30px_rgba(245,158,11,0.32)] font-bold">
            ع
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="font-extrabold text-lg tracking-tight">{t("common.appName")}</div>
            <div className="text-[10px] text-muted-foreground hidden xl:block">{t("common.tagline")}</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {NAV.map(item => {
            const active =
              location.pathname === item.to ||
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

        {/* Right: role switcher, language, auth */}
        <div className="flex items-center gap-2 ms-auto">
          <RoleSwitcher />
          <LanguageToggle compact />
          {user ? (
            <Link to="/dashboard" className="hidden sm:block">
              <Button size="sm" className="rounded-full px-4">{t("nav.dashboard")}</Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button
                size="sm"
                variant="default"
                className="gap-1.5 rounded-full px-4 shadow-[0_12px_30px_rgba(245,158,11,0.24)]"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">{t("nav.signIn")}</span>
              </Button>
            </Link>
          )}
          {/* Mobile hamburger */}
          <button
            onClick={onMenuOpen}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-border/60 bg-white/80 hover:bg-secondary transition-colors lg:hidden"
            aria-label={t("nav.menu")}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── Mobile bottom nav ────────────────────────────────────────────────────────

export function MobileBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <nav className="mobile-nav border-t border-border/70 bg-white/92 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5 max-w-md mx-auto">
        {MOBILE_NAV.map(item => {
          const active =
            location.pathname === item.to ||
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

// ─── Mobile drawer (dark sidebar) ────────────────────────────────────────────

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => { onClose(); }, [location.pathname]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="absolute inset-y-0 start-0 w-72 bg-[hsl(var(--sidebar-background))] flex flex-col shadow-2xl animate-slide-in-from-left">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-[60px] border-b border-[hsl(var(--sidebar-border))]">
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[hsl(var(--sidebar-primary))] to-amber-300 text-[hsl(var(--sidebar-background))] font-bold text-sm shadow-[0_6px_18px_rgba(245,158,11,0.36)]">
              ع
            </div>
            <span className="font-extrabold text-sm text-[hsl(var(--sidebar-foreground))] tracking-tight">
              {t("common.appName")}
            </span>
          </Link>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl text-[hsl(var(--sidebar-foreground))]/50 hover:bg-[hsl(var(--sidebar-accent))] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map(item => {
            const active =
              location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={[
                  "relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all",
                  active
                    ? "bg-[hsl(var(--sidebar-primary))]/12 text-[hsl(var(--sidebar-primary))]"
                    : "text-[hsl(var(--sidebar-foreground))]/60 hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]",
                ].join(" ")}
              >
                {active && <span className="sidebar-active-bar" />}
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        {/* Footer: role switcher + auth */}
        <div className="border-t border-[hsl(var(--sidebar-border))] p-4 space-y-3">
          <RoleSwitcher dark />
          <div className="flex items-center gap-2">
            <LanguageToggle compact />
            {user ? (
              <Link to="/dashboard" className="flex-1" onClick={onClose}>
                <Button
                  size="sm"
                  className="w-full rounded-lg bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-background))] text-xs hover:opacity-90"
                >
                  {t("nav.dashboard")}
                </Button>
              </Link>
            ) : (
              <Link to="/auth" className="flex-1" onClick={onClose}>
                <Button
                  size="sm"
                  className="w-full gap-1 rounded-lg bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-background))] text-xs hover:opacity-90"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {t("nav.signIn")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onMenuOpen={() => setMobileOpen(true)} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="flex-1 pb-nav lg:pb-0">
        <div className="mx-auto w-full max-w-[1600px]">{children}</div>
      </main>

      <footer className="mt-14 border-t border-slate-200/80 bg-white/80 py-10 text-foreground backdrop-blur-sm">
        <div className="container-app">
          {/* Desktop: full 4-column grid — hidden on mobile */}
          <div className="hidden md:grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
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

          <div className="mt-6 border-t border-slate-200 pt-5 text-sm text-foreground/56">
            © 2026 IraqProperty. Built for Iraq first, with a path to regional investors into Iraq.
          </div>
        </div>
      </footer>

      <MobileBottomNav />
    </div>
  );
}
