import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Search, TrendingUp, Map, BarChart3, ShieldCheck, Heart, LayoutGrid, LogIn, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import LanguageToggle from "./LanguageToggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";

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

export function Header() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border">
      <div className="container-app flex items-center h-16 gap-3">
        <Link to="/" className="flex items-center gap-2 me-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-navy grid place-items-center text-white font-extrabold shadow-soft">
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
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 ms-auto">
          <LanguageToggle compact />
          {user ? (
            <Link to="/dashboard">
              <Button size="sm" className="hidden sm:inline-flex">{t("nav.dashboard")}</Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button size="sm" variant="default" className="gap-1.5">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">{t("nav.signIn")}</span>
              </Button>
            </Link>
          )}
          <button
            onClick={() => setOpen(o => !o)}
            className="lg:hidden w-9 h-9 grid place-items-center rounded-lg hover:bg-secondary"
            aria-label={t("nav.menu")}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden border-t border-border bg-card animate-fade-in">
          <nav className="container-app py-2 grid grid-cols-2 gap-1">
            {NAV.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 px-3 py-3 rounded-lg hover:bg-secondary text-sm font-medium"
              >
                <item.icon className="w-4 h-4 text-muted-foreground" />
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export function MobileBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <nav className="mobile-nav lg:hidden">
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
      <main className="flex-1 pb-nav lg:pb-0">{children}</main>
      <MobileBottomNav />
    </div>
  );
}
