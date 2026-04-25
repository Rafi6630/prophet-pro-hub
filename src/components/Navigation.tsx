import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, Globe2, LayoutDashboard, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useApp } from "@/contexts/AppContext";

const navItems = [
  { path: "/buy", label: "Buy", labelAr: "شراء" },
  { path: "/investment", label: "Investment", labelAr: "استثمار" },
  { path: "/map-search", label: "Map Search", labelAr: "بحث بالخريطة" },
  { path: "/market-prices", label: "Market Prices", labelAr: "أسعار السوق" },
  { path: "/verified-sellers", label: "Verified Sellers", labelAr: "بائعون موثوقون" },
];

export function Navigation() {
  const { currentLanguage, languages, setLanguage } = useApp();
  const enabledLanguages = languages.filter((lang) => lang.enabled);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isRtl = currentLanguage === "ar" || currentLanguage === "kr";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentLabel = (item: (typeof navItems)[number]) =>
    currentLanguage === "ar" ? item.labelAr : item.label;

  const renderNavButton = (item: (typeof navItems)[number], mobile = false) => {
    const active = location.pathname === item.path;
    return (
      <button
        key={item.path}
        type="button"
        onClick={() => {
          navigate(item.path);
          setMobileOpen(false);
        }}
        className={[
          mobile ? "text-lg" : "text-sm",
          "font-medium transition-colors",
          active ? "text-primary" : "text-foreground/78 hover:text-foreground",
          mobile ? "text-start" : "",
        ].join(" ")}
      >
        {currentLabel(item)}
      </button>
    );
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-white/10 bg-background/86 shadow-sm backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex h-[74px] items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 text-foreground">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/12 text-primary">
            <Building2 className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-xs uppercase tracking-[0.24em] text-primary/90">IraqProperty</span>
            <span className="block text-base font-bold md:text-lg">Prophet Pro Hub</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => renderNavButton(item))}
        </div>

        <div className="flex items-center gap-3">
          {enabledLanguages.length > 1 && (
            <div className="hidden items-center gap-1 rounded-full bg-white/5 p-1 md:flex">
              {enabledLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    currentLanguage === lang.code
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {lang.code.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            className="hidden border-white/10 bg-white/5 text-foreground hover:bg-white/10 md:inline-flex"
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
          <Button className="hidden md:inline-flex" onClick={() => navigate("/buy")}>
            Start Buying
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRtl ? "left" : "right"} className="border-white/10 bg-slate-950/96">
              <div className="mt-8 flex flex-col gap-6">
                <div className="flex items-center gap-3 text-primary">
                  <Globe2 className="h-4 w-4" />
                  <span className="text-sm font-semibold">Iraq-focused buyer portal</span>
                </div>
                {navItems.map((item) => renderNavButton(item, true))}
                <Button onClick={() => navigate("/dashboard")}>Open Dashboard</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
