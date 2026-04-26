import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import RequireAuth from "@/components/guards/RequireAuth";

import "@/i18n";

const queryClient = new QueryClient();
const Home = lazy(() => import("@/pages/Home"));
const Buy = lazy(() => import("@/pages/Buy"));
const Investment = lazy(() => import("@/pages/Investment"));
const MapSearch = lazy(() => import("@/pages/MapSearch"));
const MarketPrices = lazy(() => import("@/pages/MarketPrices"));
const VerifiedSellers = lazy(() => import("@/pages/VerifiedSellers"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const PropertyDetail = lazy(() => import("@/pages/PropertyDetail"));
const CreateListing = lazy(() => import("@/pages/CreateListing"));
const Verification = lazy(() => import("@/pages/Verification"));
const Auth = lazy(() => import("@/pages/Auth"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const CityLandingPage = lazy(() => import("@/pages/CityLandingPage").then((module) => ({ default: module.CityLandingPage })));
const StaticContentPage = lazy(() => import("@/pages/StaticContentPage").then((module) => ({ default: module.StaticContentPage })));
const SellerDashboardPage = lazy(() => import("@/pages/SellerDashboardPage").then((module) => ({ default: module.SellerDashboardPage })));
const SellerProfilePage = lazy(() => import("@/pages/SellerProfilePage").then((module) => ({ default: module.SellerProfilePage })));
const DashboardProfilePage = lazy(() => import("@/pages/DashboardProfilePage"));
const DashboardSettingsPage = lazy(() => import("@/pages/DashboardSettingsPage"));
const DashboardSubscriptionPage = lazy(() => import("@/pages/DashboardSubscriptionPage"));
const AdminAnalytics = lazy(() => import("@/pages/AdminAnalytics").then((module) => ({ default: module.AdminAnalytics })));
const AdminModeration = lazy(() => import("@/pages/AdminModeration").then((module) => ({ default: module.AdminModeration })));
const AdminReports = lazy(() => import("@/pages/AdminReports").then((module) => ({ default: module.AdminReports })));
const AdminVerification = lazy(() => import("@/pages/AdminVerification").then((module) => ({ default: module.AdminVerification })));
const AdminUsersPage = lazy(() => import("@/pages/AdminUsersPage").then((module) => ({ default: module.AdminUsersPage })));
const AdminRevenuePage = lazy(() => import("@/pages/AdminRevenuePage").then((module) => ({ default: module.AdminRevenuePage })));
const AdminCityAnalyticsPage = lazy(() => import("@/pages/AdminCityAnalyticsPage").then((module) => ({ default: module.AdminCityAnalyticsPage })));
const AdminLeadsPage = lazy(() => import("@/pages/AdminLeadsPage").then((module) => ({ default: module.AdminLeadsPage })));
const AdminSupportPage = lazy(() => import("@/pages/AdminSupportPage").then((module) => ({ default: module.AdminSupportPage })));

const LoadingShell = () => (
  <div className="min-h-[50vh] grid place-items-center">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense fallback={<LoadingShell />}>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/buy" element={<Layout><Buy /></Layout>} />
            <Route path="/investment" element={<Layout><Investment /></Layout>} />
            <Route path="/map" element={<Layout><MapSearch /></Layout>} />
            <Route path="/map-search" element={<Layout><MapSearch /></Layout>} />
            <Route path="/market" element={<Layout><MarketPrices /></Layout>} />
            <Route path="/market-prices" element={<Layout><MarketPrices /></Layout>} />
            <Route path="/sellers" element={<Layout><VerifiedSellers /></Layout>} />
            <Route path="/verified-sellers" element={<Layout><VerifiedSellers /></Layout>} />
            <Route path="/sellers/:sellerSlug" element={<Layout><SellerProfilePage /></Layout>} />
            <Route path="/property/:id" element={<Layout><PropertyDetail /></Layout>} />
            <Route path="/:citySlug-properties" element={<Layout><CityLandingPage /></Layout>} />

            <Route path="/about" element={<Layout><StaticContentPage title="About IraqProperty" description="IraqProperty helps buyers and investors know everything before they buy." body={["IraqProperty is a trust-first marketplace built for Iraqi buyer psychology: clear pricing, cleaner sellers, and better neighborhood context before serious money moves.", "The product combines verified sellers, fair price benchmarks, legal confidence signals, and decision-ready area intelligence for buyers, agencies, and regional investors entering Iraq."]} /></Layout>} />
            <Route path="/privacy" element={<Layout><StaticContentPage title="Privacy" description="How IraqProperty protects marketplace and buyer data." body={["We collect only the information needed to support listings, saved searches, messages, offers, and marketplace trust workflows.", "Verification, moderation, and fraud-review records are retained to help protect buyers and keep public listings more reliable."]} /></Layout>} />
            <Route path="/terms" element={<Layout><StaticContentPage title="Terms" description="Marketplace terms for buyers, sellers, agencies, and developers." body={["All listings are subject to moderation, verification review, and public visibility standards before trust badges are shown.", "Sellers, agencies, and developers are responsible for pricing accuracy, ownership documentation, communication quality, and lawful marketing claims."]} /></Layout>} />
            <Route path="/contact" element={<Layout><StaticContentPage title="Contact" description="Reach IraqProperty for support, partnerships, and agency onboarding." body={["Contact IraqProperty for buyer support, verified agency onboarding, developer promotions, market reports, or investment partnerships.", "The platform is built for Iraq first, with expansion paths for UAE, Saudi, Jordan, and Turkey investors evaluating Iraqi opportunities."]} /></Layout>} />
            <Route path="/cities" element={<Layout><StaticContentPage title="Cities" description="Explore IraqProperty city coverage across Iraq." body={["Baghdad, Erbil, Mosul, Basra, Najaf, and Sulaymaniyah lead our initial trust-first coverage strategy.", "Each city experience combines live listings, pricing context, and local infrastructure signals so buyers can compare opportunities faster."]} /></Layout>} />
            <Route path="/agencies" element={<Layout><StaticContentPage title="Agencies" description="Verified agencies and seller network on IraqProperty." body={["Verified agencies receive premium trust placement, listing tools, lead workflows, and reputation-building support inside the marketplace.", "Agency verification prioritizes licensing, seller quality, response reliability, and cleaner ownership workflows."]} /></Layout>} />
            <Route path="/developers" element={<Layout><StaticContentPage title="Developers" description="Developer promotions and project visibility on IraqProperty." body={["Developers can promote new projects through premium placements, launch storytelling, and targeted visibility for serious Iraqi buyers and investors.", "Enterprise sponsorships, banner placements, and premium investor memberships support project discovery at scale."]} /></Layout>} />

            <Route path="/favorites" element={<RequireAuth><Layout><Favorites /></Layout></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth><Layout><Dashboard /></Layout></RequireAuth>} />
            <Route path="/dashboard/profile" element={<RequireAuth><Layout><DashboardProfilePage /></Layout></RequireAuth>} />
            <Route path="/dashboard/settings" element={<RequireAuth><Layout><DashboardSettingsPage /></Layout></RequireAuth>} />
            <Route path="/dashboard/subscription" element={<RequireAuth><Layout><DashboardSubscriptionPage /></Layout></RequireAuth>} />
            {/* /seller is a common bookmark — redirect to the real dashboard */}
            <Route path="/seller" element={<Navigate to="/seller/dashboard" replace />} />
            <Route path="/seller/dashboard" element={<RequireAuth><Layout><SellerDashboardPage /></Layout></RequireAuth>} />
            <Route path="/listings/new" element={<RequireAuth><Layout><CreateListing /></Layout></RequireAuth>} />
            <Route path="/verification" element={<RequireAuth><Layout><Verification /></Layout></RequireAuth>} />

            <Route path="/admin" element={<RequireAuth><AdminAnalytics /></RequireAuth>} />
            <Route path="/admin/moderation" element={<RequireAuth><AdminModeration /></RequireAuth>} />
            <Route path="/admin/reports" element={<RequireAuth><AdminReports /></RequireAuth>} />
            <Route path="/admin/verification" element={<RequireAuth><AdminVerification /></RequireAuth>} />
            <Route path="/admin/users" element={<RequireAuth><AdminUsersPage /></RequireAuth>} />
            <Route path="/admin/revenue" element={<RequireAuth><AdminRevenuePage /></RequireAuth>} />
            <Route path="/admin/city-analytics" element={<RequireAuth><AdminCityAnalyticsPage /></RequireAuth>} />
            <Route path="/admin/leads" element={<RequireAuth><AdminLeadsPage /></RequireAuth>} />
            <Route path="/admin/support" element={<RequireAuth><AdminSupportPage /></RequireAuth>} />

            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
