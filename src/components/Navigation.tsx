import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, Globe2, LayoutDashboard, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useApp } from "@/contexts/AppContext";

const navItems = [
  { path: "/", label: "Home", labelAr: "الرئيسية" },
  { path: "/buy", label: "Buy Property", labelAr: "شراء عقار" },
  { path: "/investment", label: "Investment Deals", labelAr: "فرص استثمارية" },
  { path: "/map-search", label: "Map Search", labelAr: "بحث بالخريطة" },
  { path: "/market-prices", label: "Market Prices", labelAr: "أسعار السوق" },
  { path: "/verified-sellers", label: "Verified Sellers", labelAr: "بائعون موثوقون" },
  { path: "/favorites", label: "Favorites", labelAr: "المفضلة" },
  { path: "/dashboard", label: "Dashboard", labelAr: "لوحة التحكم" },
];

export function Navigation() {
  const { currentLanguage, languages, setLanguage } = useApp();
  const enabledLanguages = languages.filter((lang) => lang.enabled);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isRtl = currentLanguage === "ar" || currentLanguage === "ku" || currentLanguage === "ckb";

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
          active ? "text-primary" : "text-foreground/72 hover:text-foreground",
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
        scrolled ? "border-b border-slate-200 bg-white/92 shadow-sm backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex h-[76px] items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 text-foreground">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/12 text-primary">
            <Building2 className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-xs uppercase tracking-[0.24em] text-primary/90">IraqProperty</span>
            <span className="block text-base font-bold md:text-lg">Know Everything Before You Buy</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 xl:flex">
          {navItems.map((item) => renderNavButton(item))}
        </div>

        <div className="flex items-center gap-3">
          {enabledLanguages.length > 1 ? (
            <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm md:flex">
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
          ) : null}

          <Button
            variant="outline"
            className="hidden border-slate-200 bg-white text-foreground hover:bg-slate-50 md:inline-flex"
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
          <Button className="hidden md:inline-flex" onClick={() => navigate("/buy")}>
            Start Search
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRtl ? "left" : "right"} className="border-slate-200 bg-white">
              <div className="mt-8 flex flex-col gap-6">
                <div className="flex items-center gap-3 text-primary">
                  <Globe2 className="h-4 w-4" />
                  <span className="text-sm font-semibold">اعرف كل شيء قبل أن تشتري</span>
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
