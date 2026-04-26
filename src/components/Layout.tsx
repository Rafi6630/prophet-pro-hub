import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home, Search, TrendingUp, Map, BarChart3, ShieldCheck, Heart,
  LayoutGrid, LogIn, Menu, X, Building2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import LanguageToggle from "./LanguageToggle";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useActiveRole } from "@/hooks/useActiveRole";
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

// ─── Role switcher ────────────────────────────────────────────────────────────

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
    <div className="flex items-center rounded-full border border-border/80 bg-secondary/60 p-0.5 text-xs font-semibold">
      {(["buyer", "seller"] as const).map(role => (
        <button
          key={role}
          onClick={() => handleSwitch(role)}
          aria-pressed={activeRole === role}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all ${
            activeRole === role
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {role === "buyer" ? <Heart className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
          {role === "buyer" ? t("roleSwitch.buyer") : t("roleSwitch.seller")}
        </button>
      ))}
    </div>
  );
}

function SidebarRoleSwitcher() {
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
    <div className="flex rounded-xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent))] p-1">
      {(["buyer", "seller"] as const).map(role => (
        <button
          key={role}
          onClick={() => handleSwitch(role)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
            activeRole === role
              ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-background))] shadow-sm"
              : "text-[hsl(var(--sidebar-foreground))]/55 hover:text-[hsl(var(--sidebar-foreground))]"
          }`}
        >
          {role === "buyer" ? <Heart className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
          {role === "buyer" ? t("roleSwitch.buyerMode") : t("roleSwitch.sellerMode")}
        </button>
      ))}
    </div>
  );
}

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const isRTL = i18n.dir() === "rtl";

  return (
    <aside
      className={[
        "sidebar-shell fixed inset-y-0 z-50 hidden lg:flex flex-col",
        "bg-[hsl(var(--sidebar-background))]",
        isRTL ? "right-0 border-l border-[hsl(var(--sidebar-border))]"
               : "left-0 border-r border-[hsl(var(--sidebar-border))]",
        "transition-all duration-300 ease-in-out",
        collapsed ? "sidebar-collapsed" : "",
      ].join(" ")}
    >
      {/* Logo */}
      <div
        className={[
          "flex items-center border-b border-[hsl(var(--sidebar-border))] h-[60px]",
          collapsed ? "justify-center px-3" : "px-4 gap-3",
        ].join(" ")}
      >
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[hsl(var(--sidebar-primary))] to-amber-300 text-[hsl(var(--sidebar-background))] font-bold text-sm shadow-[0_8px_24px_rgba(245,158,11,0.38)]">
            ع
          </div>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <div className="font-extrabold text-sm tracking-tight text-[hsl(var(--sidebar-foreground))] truncate">
                {t("common.appName")}
              </div>
              <div className="text-[9px] text-[hsl(var(--sidebar-foreground))]/40 truncate">
                {t("common.tagline")}
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map(item => {
          const active =
            location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? t(`nav.${item.key}`) : undefined}
              className={[
                "relative flex items-center rounded-xl text-sm font-semibold transition-all duration-150",
                collapsed ? "h-10 w-10 justify-center mx-auto" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-[hsl(var(--sidebar-primary))]/12 text-[hsl(var(--sidebar-primary))]"
                  : "text-[hsl(var(--sidebar-foreground))]/55 hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]",
              ].join(" ")}
            >
              {active && !collapsed && <span className="sidebar-active-bar" />}
              <item.icon className="flex-shrink-0 w-[18px] h-[18px]" />
              {!collapsed && <span className="truncate">{t(`nav.${item.key}`)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={[
          "border-t border-[hsl(var(--sidebar-border))]",
          collapsed ? "p-2 flex flex-col items-center gap-2" : "p-3 space-y-2",
        ].join(" ")}
      >
        {!collapsed && (
          <>
            <SidebarRoleSwitcher />
            <div className="flex items-center gap-2">
              <LanguageToggle compact />
              {user ? (
                <Link to="/dashboard" className="flex-1">
                  <Button
                    size="sm"
                    className="w-full rounded-lg bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-background))] text-xs hover:opacity-90"
                  >
                    {t("nav.dashboard")}
                  </Button>
                </Link>
              ) : (
                <Link to="/auth" className="flex-1">
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
          </>
        )}

        {collapsed && (
          <button
            className="grid h-9 w-9 place-items-center rounded-xl text-[hsl(var(--sidebar-foreground))]/45 hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))] transition-all"
            title={user ? t("nav.dashboard") : t("nav.signIn")}
          >
            {user
              ? <Link to="/dashboard"><LayoutGrid className="w-4 h-4" /></Link>
              : <Link to="/auth"><LogIn className="w-4 h-4" /></Link>
            }
          </button>
        )}

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={[
            "flex items-center rounded-xl transition-all",
            "text-[hsl(var(--sidebar-foreground))]/30 hover:text-[hsl(var(--sidebar-foreground))]/70 hover:bg-[hsl(var(--sidebar-accent))]",
            collapsed ? "h-9 w-9 justify-center" : "w-full gap-2 px-3 py-2",
          ].join(" ")}
        >
          {collapsed
            ? (isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)
            : (isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />)
          }
        </button>
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

export function Header({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-[60px] flex items-center border-b border-border/60 bg-background/85 backdrop-blur-2xl px-4 gap-3">
      {/* Mobile logo */}
      <Link to="/" className="flex items-center gap-2 lg:hidden">
        <div className="grid h-8 w-8 place-items-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary to-amber-300 text-white shadow-[0_6px_18px_rgba(245,158,11,0.28)] text-sm font-bold">
          ع
        </div>
        <span className="font-extrabold text-base tracking-tight">{t("common.appName")}</span>
      </Link>

      {/* Spacer — desktop page area is handled by sidebar */}
      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* Role switcher — compact, topbar only */}
        <div className="hidden sm:block">
          <RoleSwitcher />
        </div>

        {/* Language toggle visible on mobile; sidebar has it on desktop */}
        <div className="lg:hidden">
          <LanguageToggle compact />
        </div>

        {/* Auth button on desktop (sidebar also has it, this is a shortcut) */}
        {!user && (
          <Link to="/auth" className="hidden lg:block">
            <Button
              size="sm"
              variant="default"
              className="gap-1.5 rounded-full px-4 shadow-[0_8px_20px_rgba(245,158,11,0.22)]"
            >
              <LogIn className="w-3.5 h-3.5" />
              {t("nav.signIn")}
            </Button>
          </Link>
        )}

        {/* Mobile hamburger */}
        <button
          onClick={onMenuOpen}
          className="grid h-9 w-9 place-items-center rounded-xl border border-border/60 bg-white/80 hover:bg-secondary transition-colors lg:hidden"
          aria-label={t("nav.menu")}
        >
          <Menu className="w-5 h-5" />
        </button>
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

// ─── Mobile drawer ────────────────────────────────────────────────────────────

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

        {/* Footer */}
        <div className="border-t border-[hsl(var(--sidebar-border))] p-4 space-y-3">
          <SidebarRoleSwitcher />
          <div className="flex items-center gap-3">
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem("sidebar-collapsed") === "true"; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem("sidebar-collapsed", String(next)); } catch { /* noop */ }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Mobile drawer */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Content area — offset by sidebar on desktop */}
      <div
        className={[
          "flex flex-col min-h-screen sidebar-main-offset",
          sidebarCollapsed ? "sidebar-collapsed-offset" : "",
        ].join(" ")}
      >
        <Header onMenuOpen={() => setMobileOpen(true)} />

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
    </div>
  );
}
