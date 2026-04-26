import { Navigate, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutGrid, List, Users, MessageSquare, ShieldCheck,
  Settings, Plus, Home, LogOut, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useActiveRole } from "@/hooks/useActiveRole";
import LanguageToggle from "@/components/LanguageToggle";

const SELLER_NAV = [
  { to: "/seller/dashboard", icon: LayoutGrid, key: "overview", exact: true },
  { to: "/seller/listings/new", icon: Plus, key: "newListing" },
  { to: "/seller/leads", icon: Users, key: "leads" },
  { to: "/seller/messages", icon: MessageSquare, key: "messages" },
  { to: "/seller/verification", icon: ShieldCheck, key: "verification" },
  { to: "/seller/settings", icon: Settings, key: "settings" },
] as const;

const MOBILE_BOTTOM = [
  { to: "/seller/dashboard", icon: LayoutGrid, key: "overview", exact: true },
  { to: "/seller/listings/new", icon: Plus, key: "newListing" },
  { to: "/seller/leads", icon: Users, key: "leads" },
  { to: "/seller/messages", icon: MessageSquare, key: "messages" },
  { to: "/seller/verification", icon: ShieldCheck, key: "verification" },
] as const;

function LoadingShell() {
  return (
    <div className="min-h-screen bg-[#080e1c] grid place-items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
    </div>
  );
}

export default function SellerLayout() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const { isSeller, loading } = useUserRoles();
  const { switchRole } = useActiveRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (loading) return <LoadingShell />;
  // Non-sellers land on buyer dashboard; SellerAccessGate is a backup
  if (!isSeller) return <Navigate to="/dashboard" replace />;

  const isActive = (to: string, exact = false) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const handleBackToBuying = () => {
    switchRole("buyer");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex bg-[#080e1c]">
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 border-e border-white/8 bg-[#0a1220]">
        {/* Branding */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 font-extrabold text-[#0a1220] text-sm shadow-lg">
            ع
          </div>
          <div className="leading-tight overflow-hidden">
            <div className="font-extrabold text-sm text-white tracking-tight">IraqProperty</div>
            <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-widest truncate">
              {t("sellerPortal.title")}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {SELLER_NAV.map(item => {
            const active = isActive(item.to, "exact" in item && item.exact);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-amber-500/12 text-amber-400 border border-amber-500/20"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {t(`sellerPortal.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pt-3 pb-6 space-y-0.5 border-t border-white/8">
          <button
            onClick={handleBackToBuying}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/50 hover:bg-white/5 hover:text-white transition-all"
          >
            <Home className="h-4 w-4 shrink-0" />
            {t("sellerPortal.backToBuyer")}
          </button>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/35 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {t("common.signOut")}
          </button>
          <div className="px-4 pt-2">
            <LanguageToggle compact />
          </div>
        </div>
      </aside>

      {/* ── Main column (offset right on desktop) ───────────── */}
      <div className="flex-1 lg:ms-64 flex flex-col min-h-screen bg-[#f0f4f8]">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 bg-[#0a1220]/97 backdrop-blur border-b border-white/8"
          style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 font-extrabold text-[#0a1220] text-xs">
              ع
            </div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {t("sellerPortal.title")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle compact />
            <button
              onClick={() => setDrawerOpen(o => !o)}
              className="grid h-8 w-8 place-items-center rounded-xl border border-white/12 bg-white/6 text-white"
              aria-label={t("nav.menu")}
            >
              {drawerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Mobile overlay drawer */}
        {drawerOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-[#080e1c]/98 flex flex-col"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/8">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {t("sellerPortal.title")}
              </span>
              <button onClick={() => setDrawerOpen(false)} className="grid h-8 w-8 place-items-center rounded-xl border border-white/12 text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {SELLER_NAV.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-semibold transition-all ${
                    isActive(item.to, "exact" in item && item.exact)
                      ? "bg-amber-500/12 text-amber-400"
                      : "text-white/65 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {t(`sellerPortal.${item.key}`)}
                </Link>
              ))}
            </nav>
            <div className="px-3 pb-6 space-y-1 border-t border-white/8 pt-3">
              <button onClick={handleBackToBuying} className="flex w-full items-center gap-3 px-4 py-4 rounded-xl text-sm font-semibold text-white/50">
                <Home className="h-5 w-5 shrink-0" />
                {t("sellerPortal.backToBuyer")}
              </button>
              <button onClick={signOut} className="flex w-full items-center gap-3 px-4 py-4 rounded-xl text-sm font-semibold text-red-400">
                <LogOut className="h-5 w-5 shrink-0" />
                {t("common.signOut")}
              </button>
            </div>
          </div>
        )}

        {/* Page content rendered by child routes */}
        <main className="flex-1 overflow-auto" style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}>
          <Outlet />
        </main>

        {/* Mobile bottom tab bar */}
        <nav
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0a1220]/97 backdrop-blur-xl border-t border-white/8 grid"
          style={{ gridTemplateColumns: `repeat(${MOBILE_BOTTOM.length}, 1fr)`, paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {MOBILE_BOTTOM.map(item => {
            const active = isActive(item.to, "exact" in item && item.exact);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
                  active ? "text-amber-400" : "text-white/35 hover:text-white/70"
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? "text-amber-400" : ""}`} />
                <span className="text-[9px] font-semibold leading-none">
                  {t(`sellerPortal.${item.key}`)}
                </span>
                {active && <span className="w-1 h-1 rounded-full bg-amber-400" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
