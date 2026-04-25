import type { ReactNode } from "react";
import { HomePage } from "./pages/HomePage";
import { SearchResultsPage } from "./pages/SearchResultsPage";
import { MapSearchPage } from "./pages/MapSearchPage";
import { PropertyDetailPage } from "./pages/PropertyDetailPage";
import { VerifiedSellersPage } from "./pages/VerifiedSellersPage";
import { SellerProfilePage } from "./pages/SellerProfilePage";
import { DashboardPage } from "./pages/DashboardPage";
import { SellerDashboardPage } from "./pages/SellerDashboardPage";
import { CityLandingPage } from "./pages/CityLandingPage";
import { StaticContentPage } from "./pages/StaticContentPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminAnalytics } from "./pages/AdminAnalytics";
import { AdminModeration } from "./pages/AdminModeration";
import { AdminReports } from "./pages/AdminReports";
import { AdminVerification } from "./pages/AdminVerification";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { AdminRevenuePage } from "./pages/AdminRevenuePage";
import { AdminCityAnalyticsPage } from "./pages/AdminCityAnalyticsPage";
import { AdminLeadsPage } from "./pages/AdminLeadsPage";
import { AdminSupportPage } from "./pages/AdminSupportPage";

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  protected?: boolean;
}

const routes: RouteConfig[] = [
  { name: "Home", path: "/", element: <HomePage />, visible: true },
  { name: "Buy Property", path: "/buy", element: <SearchResultsPage mode="buy" />, visible: true },
  { name: "Investment Deals", path: "/investment", element: <SearchResultsPage mode="investment" />, visible: true },
  { name: "Map Search", path: "/map-search", element: <MapSearchPage />, visible: true },
  { name: "Market Prices", path: "/market-prices", element: <SearchResultsPage mode="market" />, visible: true },
  { name: "Verified Sellers", path: "/verified-sellers", element: <VerifiedSellersPage />, visible: true },
  { name: "Favorites", path: "/favorites", element: <SearchResultsPage mode="favorites" />, visible: true },
  { name: "Dashboard", path: "/dashboard", element: <DashboardPage />, visible: true },
  { name: "Seller Dashboard", path: "/seller/dashboard", element: <SellerDashboardPage /> },
  { name: "Property Detail", path: "/property/:slug", element: <PropertyDetailPage /> },
  { name: "Seller Profile", path: "/sellers/:sellerSlug", element: <SellerProfilePage /> },
  { name: "City Landing", path: "/:citySlug-properties", element: <CityLandingPage /> },
  {
    name: "About",
    path: "/about",
    element: (
      <StaticContentPage
        title="About IraqProperty"
        description="IraqProperty helps buyers know more before they buy."
        body={[
          "IraqProperty is built for the way serious buyers actually decide in Iraq: they need trust, local context, and pricing clarity before they commit time or money.",
          "The platform combines verified sellers, Fair Price Estimate, area intelligence, and investment signals in one premium experience.",
        ]}
      />
    ),
  },
  {
    name: "Privacy",
    path: "/privacy",
    element: (
      <StaticContentPage
        title="Privacy"
        description="How IraqProperty handles user, listing, and lead data."
        body={[
          "We collect the minimum information needed to power favorites, alerts, offers, and seller communication.",
          "Verification and moderation records are retained to protect marketplace trust and reduce fraud.",
        ]}
      />
    ),
  },
  {
    name: "Terms",
    path: "/terms",
    element: (
      <StaticContentPage
        title="Terms"
        description="Marketplace terms for buyers, sellers, agencies, and developers."
        body={[
          "All listings are subject to moderation, public visibility review, and trust policy checks.",
          "Sellers and agencies are responsible for price accuracy, ownership information, and communication quality.",
        ]}
      />
    ),
  },
  {
    name: "Contact",
    path: "/contact",
    element: (
      <StaticContentPage
        title="Contact"
        description="Reach IraqProperty for buyer support, agency onboarding, and market intelligence."
        body={[
          "For buyer support, agency onboarding, market reports, or enterprise partnerships, IraqProperty operates as a trust-first marketplace team.",
          "We support Iraq first, with expansion paths for UAE, Saudi, Jordan, and Turkey investors into Iraq.",
        ]}
      />
    ),
  },
  {
    name: "Cities",
    path: "/cities",
    element: (
      <StaticContentPage
        title="Cities"
        description="Explore IraqProperty city coverage across Iraq."
        body={[
          "Baghdad, Erbil, Mosul, Basra, Najaf, and Sulaymaniyah lead the platform's core investment and buyer discovery experience.",
          "Each city page combines listings, pricing context, and local neighborhood demand signals.",
        ]}
      />
    ),
  },
  {
    name: "Agencies",
    path: "/agencies",
    element: (
      <StaticContentPage
        title="Agencies"
        description="Verified agencies on IraqProperty."
        body={[
          "Verified agencies get premium trust placement, lead tools, and cleaner buyer conversion paths.",
          "Agency verification focuses on licensing, ownership workflow quality, and response reliability.",
        ]}
      />
    ),
  },
  {
    name: "Developers",
    path: "/developers",
    element: (
      <StaticContentPage
        title="Developers"
        description="Developer partnerships and promotions on IraqProperty."
        body={[
          "Developer promotions help new projects reach serious buyers using premium placement, market narratives, and trust-led launch support.",
          "Second-phase expansion also supports regional investors evaluating Iraq through a more institutional lens.",
        ]}
      />
    ),
  },
  { name: "Admin Login", path: "/admin/login", element: <AdminLoginPage /> },
  { name: "Admin Analytics", path: "/admin", element: <AdminAnalytics />, protected: true },
  { name: "Admin Verification", path: "/admin/verification", element: <AdminVerification />, protected: true },
  { name: "Admin Moderation", path: "/admin/moderation", element: <AdminModeration />, protected: true },
  { name: "Admin Reports", path: "/admin/reports", element: <AdminReports />, protected: true },
  { name: "Admin Users", path: "/admin/users", element: <AdminUsersPage />, protected: true },
  { name: "Admin Revenue", path: "/admin/revenue", element: <AdminRevenuePage />, protected: true },
  { name: "Admin City Analytics", path: "/admin/city-analytics", element: <AdminCityAnalyticsPage />, protected: true },
  { name: "Admin Leads", path: "/admin/leads", element: <AdminLeadsPage />, protected: true },
  { name: "Admin Support", path: "/admin/support", element: <AdminSupportPage />, protected: true },
];

export default routes;
