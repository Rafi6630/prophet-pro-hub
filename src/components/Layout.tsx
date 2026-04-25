import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2, LayoutDashboard, Users, MessageSquare, TrendingUp,
  Shield, Heart, Bell, Search, X, ChevronRight,
  BadgeDollarSign, GitCompareArrows, Plus, BarChart3, LogOut,
  Settings, CreditCard, Briefcase, User, LifeBuoy, Sparkles,
  Menu, ChevronDown, Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LanguageToggle from "@/components/LanguageToggle";
import NotificationBell from "@/components/NotificationBell";
import PageTransition from "@/components/PageTransition";
import MobileNav from "@/components/MobileNav";
import InstallBanner from "@/components/InstallBanner";

type NavRole = "buyer" | "seller" | "developer" | "admin";
const SHARED_PATHS = ["/settings", "/profile", "/support", "/pricing", "/property"];

function getRoleFromPath(pathname: string): NavRole | null {
  if (pathname.startsWith("/buyer"))     return "buyer";
  if (pathname.startsWith("/seller"))    return "seller";
  if (pathname.startsWith("/developer")) return "developer";
  if (pathname.startsWith("/admin"))     return "admin";
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const buyerNav = (t: any) => [
  { label: t("nav.home"), items: [
    { path: "/buyer", icon: LayoutDashboard, label: t("nav.dashboard") },
  ]},
  { label: t("nav.marketplace"), items: [
    { path: "/buyer/discover",  icon: Search,           label: t("nav.discover") },
    { path: "/buyer/compare",   icon: GitCompareArrows, label: t("nav.compare") },
    { path: "/buyer/favorites", icon: Heart,            label: t("nav.favorites") },
    { path: "/buyer/alerts",    icon: Bell,             label: t("nav.alerts") },
  ]},
  { label: t("nav.offersDeals"), items: [
    { path: "/buyer/offers",   icon: BadgeDollarSign, label: t("nav.myOffers") },
    { path: "/buyer/messages", icon: MessageSquare,   label: t("common.messages") },
  ]},
  { label: t("nav.investorTools"), items: [
    { path: "/buyer/investor",            icon: Zap,       label: t("nav.aiIntelligence") },
    { path: "/buyer/market-intelligence", icon: BarChart3, label: t("nav.marketIntelligence") },
    { path: "/buyer/valuation",           icon: Sparkles,  label: t("nav.aiValuation") },
  ]},
  { label: t("nav.support"), items: [
    { path: "/support", icon: LifeBuoy, label: t("support.title") },
  ]},
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sellerNav = (t: any) => [
  { label: t("nav.home"), items: [
    { path: "/seller", icon: LayoutDashboard, label: t("nav.dashboard") },
  ]},
  { label: t("nav.listings"), items: [
    { path: "/seller/listings", icon: Building2, label: t("nav.myListings") },
    { path: "/seller/create",   icon: Plus,      label: t("nav.newListing") },
  ]},
  { label: t("nav.salesPipeline"), items: [
    { path: "/seller/offers",   icon: BadgeDollarSign, label: t("nav.offerInbox") },
    { path: "/seller/crm",      icon: Users,           label: t("nav.crmLeads") },
    { path: "/seller/messages", icon: MessageSquare,   label: t("common.messages") },
  ]},
  { label: t("nav.performance"), items: [
    { path: "/seller/analytics",    icon: BarChart3,  label: t("nav.analytics") },
    { path: "/seller/verification", icon: Shield,     label: t("nav.verification") },
  ]},
  { label: t("nav.aiTools"), items: [
    { path: "/seller/investor",            icon: Zap,       label: t("nav.investorIntelligence") },
    { path: "/seller/market-intelligence", icon: BarChart3, label: t("nav.marketIntelligence") },
    { path: "/seller/valuation",           icon: Sparkles,  label: t("nav.aiValuation") },
  ]},
  { label: t("nav.support"), items: [
    { path: "/support", icon: LifeBuoy, label: t("support.title") },
  ]},
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const developerNav = (t: any) => [
  { label: t("nav.home"), items: [
    { path: "/developer", icon: LayoutDashboard, label: t("nav.dashboard") },
  ]},
  { label: t("nav.opportunities"), items: [
    { path: "/developer/opportunities", icon: Briefcase,  label: t("nav.opportunityFeed") },
    { path: "/developer/portfolio",     icon: TrendingUp, label: t("nav.portfolioInsights") },
  ]},
  { label: t("nav.planning"), items: [
    { path: "/developer/analyze", icon: Search,    label: t("nav.analyzeLand") },
    { path: "/developer/plans",   icon: Building2, label: t("nav.allPlans") },
  ]},
  { label: t("nav.tools"), items: [
    { path: "/developer/messages",            icon: MessageSquare, label: t("common.messages") },
    { path: "/developer/market-intelligence", icon: BarChart3,     label: t("nav.marketIntelligence") },
    { path: "/developer/valuation",           icon: Sparkles,      label: t("nav.aiValuation") },
  ]},
  { label: t("nav.support"), items: [
    { path: "/support", icon: LifeBuoy, label: t("support.title") },
  ]},
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HeadphonesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adminNav = (t: any) => [
  { label: t("nav.governance"), items: [
    { path: "/admin",               icon: Shield,         label: t("nav.console") },
    { path: "/admin/verifications", icon: Shield,         label: t("nav.sellerVerifications") },
    { path: "/admin/support",       icon: HeadphonesIcon, label: t("nav.supportTickets") },
  ]},
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNavForRole(role: NavRole, t: any) {
  switch (role) {
    case "buyer":     return buyerNav(t);
    case "seller":    return sellerNav(t);
    case "developer": return developerNav(t);
    case "admin":     return adminNav(t);
  }
}

// ── Accordion Nav Group ──────────────────────────────────────────────────────
function NavGroup({
  section, isOpen, onToggle, pathname, onNav, isRTL,
}: {
  section: { label: string; items: { path: string; icon: React.ElementType; label: string }[] };
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  onNav: () => void;
  isRTL: boolean;
}) {
  const hasActive  = section.items.some(item => pathname === item.path);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="overflow-hidden">
      {/* Group header */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-bold
          uppercase tracking-[0.07em] transition-all duration-150 group ${
            hasActive
              ? "opacity-100"
              : "opacity-45 hover:opacity-70"
          }`}
        style={{ color: "hsl(var(--sidebar-foreground))" }}
      >
        {/* Accent pip */}
        <span className={`w-1 h-3.5 rounded-full shrink-0 transition-all duration-200 ${
          hasActive ? "bg-sidebar-primary" : "bg-white/15"
        }`} style={hasActive ? { background: "hsl(var(--sidebar-primary))" } : {}} />
        <span className="flex-1 text-start truncate">{section.label}</span>
        <ChevronDown
          className={`w-3 h-3 shrink-0 transition-transform duration-200 opacity-60 ${
            isOpen ? "rotate-180" : ""
          } ${isRTL ? "me-auto ms-0" : ""}`}
        />
      </button>

      {/* Items panel */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-250 ease-in-out"
        style={{
          maxHeight: isOpen ? `${contentRef.current?.scrollHeight ?? 500}px` : "0px",
          opacity:   isOpen ? 1 : 0,
        }}
      >
        <div className="pt-0.5 pb-1 ps-1.5 space-y-0.5">
          {section.items.map((navItem) => {
            const isActive = pathname === navItem.path;
            const NavIcon  = navItem.icon;
            return (
              <Link
                key={navItem.path}
                to={navItem.path}
                onClick={onNav}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium
                  transition-all duration-150 relative group/item ${
                    isActive ? "text-white" : "hover:text-white/90"
                  }`}
                style={{
                  color: isActive
                    ? "#fff"
                    : "hsl(var(--sidebar-foreground) / 0.72)",
                  background: isActive
                    ? "linear-gradient(135deg, hsl(var(--sidebar-primary) / 0.28), hsl(var(--sidebar-primary) / 0.16))"
                    : undefined,
                  boxShadow: isActive
                    ? "inset 0 0 0 1px hsl(var(--sidebar-primary) / 0.22), 0 1px 3px hsl(0 0% 0% / 0.12)"
                    : undefined,
                }}
                onMouseEnter={e => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.background = "hsl(var(--sidebar-accent))";
                }}
                onMouseLeave={e => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.background = "";
                }}
              >
                {/* Left accent bar */}
                {isActive && (
                  <span
                    className="absolute start-0 top-1/2 -translate-y-1/2 w-0.5 h-[18px] rounded-full"
                    style={{ background: "hsl(var(--sidebar-primary))" }}
                  />
                )}

                {/* Icon */}
                <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                  isActive
                    ? "bg-white/20"
                    : "bg-white/5 group-hover/item:bg-white/10"
                }`}>
                  <NavIcon className="w-3.5 h-3.5" />
                </div>

                <span className="flex-1 truncate">{navItem.label}</span>

                {/* Active dot */}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "hsl(var(--sidebar-primary))" }} />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Layout ──────────────────────────────────────────────────────────────
export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroup, setOpenGroup]     = useState<string | null>(null);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const lastRoleRef = useRef<NavRole>("buyer");
  useEffect(() => {
    const detected = getRoleFromPath(location.pathname);
    if (detected) lastRoleRef.current = detected;
  }, [location.pathname]);

  const isShared   = SHARED_PATHS.some(p => location.pathname.startsWith(p));
  const activeRole = isShared
    ? lastRoleRef.current
    : (getRoleFromPath(location.pathname) ?? lastRoleRef.current);
  const nav = getNavForRole(activeRole, t);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const activeSection = nav.find(s => s.items.some(item => location.pathname === item.path));
    if (activeSection) setOpenGroup(activeSection.label);
  }, [location.pathname, activeRole]);

  const handleGroupToggle = useCallback((label: string) => {
    setOpenGroup(prev => prev === label ? null : label);
  }, []);

  const displayName = user?.user_metadata?.display_name ?? user?.email ?? "";
  const initials    = displayName.slice(0, 2).toUpperCase() || "T";
  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const sidebarHiddenClass = isRTL ? "translate-x-full" : "-translate-x-full";
  const sidebarSideClass   = isRTL ? "right-0" : "left-0";

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 bottom-0 z-50 w-[264px] flex flex-col transform transition-all duration-300 ease-out
          lg:translate-x-0 lg:static lg:w-60 lg:z-auto lg:bottom-auto lg:top-auto
          ${sidebarSideClass}
          ${sidebarOpen ? "translate-x-0 shadow-2xl" : sidebarHiddenClass}
          sidebar-dark`}
        style={{
          borderInlineEnd: "1px solid hsl(var(--sidebar-border))",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* ── Logo ── */}
        <div
          className="flex items-center justify-between px-4 py-3.5 shrink-0"
          style={{ borderBottom: "1px solid hsl(var(--sidebar-border))" }}
        >
          <Link to="/" className="flex items-center gap-3 group/logo">
            {/* Logo mark */}
            <div className="relative w-9 h-9 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold shrink-0 group-hover/logo:scale-105 transition-transform">
              <Building2 className="w-4.5 h-4.5 text-white" style={{ width: "1.1rem", height: "1.1rem" }} />
            </div>
            <div>
              <span
                className="text-[15px] font-display font-bold leading-tight block"
                style={{
                  background: "var(--gradient-gold)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                AqarAI
              </span>
              <span
                className="text-[9px] leading-none tracking-[0.08em] uppercase block mt-0.5 font-medium"
                style={{ color: "hsl(var(--sidebar-foreground) / 0.38)" }}
              >
                {activeRole}
              </span>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: "hsl(var(--sidebar-foreground) / 0.6)" }}
            aria-label={t("common.close")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5" style={{ minHeight: 0 }}>
          {nav.map((section) => (
            <NavGroup
              key={section.label}
              section={section}
              isOpen={openGroup === section.label}
              onToggle={() => handleGroupToggle(section.label)}
              pathname={location.pathname}
              onNav={() => setSidebarOpen(false)}
              isRTL={isRTL}
            />
          ))}
        </nav>

        {/* ── Account strip ── */}
        <div
          className="shrink-0 px-2.5 py-3 space-y-0.5 mb-20 lg:mb-0"
          style={{
            borderTop: "1px solid hsl(var(--sidebar-border))",
            background: "hsl(var(--sidebar-background))",
          }}
        >
          {/* User chip */}
          <Link
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl mb-1 transition-all group/user"
            style={{ color: "hsl(var(--sidebar-foreground) / 0.75)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "hsl(var(--sidebar-accent))"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
              style={{ background: "var(--gradient-primary)" }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium leading-none truncate text-white/80">
                {displayName.split("@")[0] || t("common.account")}
              </p>
              <p className="text-[10px] mt-0.5 truncate" style={{ color: "hsl(var(--sidebar-foreground) / 0.4)" }}>
                {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover/user:opacity-70 shrink-0 flip-rtl" />
          </Link>

          {[
            { to: "/pricing",  icon: CreditCard, label: t("common.pricing") },
            { to: "/settings", icon: Settings,   label: t("common.settings") },
          ].map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px]
                  font-medium transition-all duration-150 relative ${
                    isActive ? "text-white" : "opacity-60 hover:opacity-85"
                  }`}
                style={{
                  color: "hsl(var(--sidebar-foreground))",
                  background: isActive
                    ? "linear-gradient(135deg, hsl(var(--sidebar-primary) / 0.25), hsl(var(--sidebar-primary) / 0.12))"
                    : undefined,
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "hsl(var(--sidebar-accent))";
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "";
                }}
              >
                {isActive && <span className="absolute start-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full" style={{ background: "hsl(var(--sidebar-primary))" }} />}
                <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? "bg-white/20" : "bg-white/5"}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="flex-1">{label}</span>
              </Link>
            );
          })}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px]
              font-medium transition-all opacity-50 hover:opacity-80"
            style={{ color: "hsl(var(--sidebar-foreground))" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "hsl(350 80% 45% / 0.15)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
          >
            <div className="p-1.5 rounded-lg bg-white/5 shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            {t("common.signOut")}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-2.5 shrink-0 header-frosted lg:px-6">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-1 rounded-xl text-muted-foreground
              hover:text-foreground hover:bg-secondary/70 transition-all active:scale-95"
            aria-label={t("common.openMenu")}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span
              className="text-sm font-display font-bold"
              style={{
                background: "var(--gradient-gold)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              AqarAI
            </span>
          </Link>

          <div className="flex-1" />

          {/* Header controls */}
          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <NotificationBell />
            <Link
              to="/profile"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white
                shrink-0 hover:scale-105 transition-transform"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-primary)" }}
            >
              {initials}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-6 pb-nav lg:pb-6 overflow-x-hidden">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>

      <MobileNav />
      <InstallBanner />
    </div>
  );
}
