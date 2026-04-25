import type { ReactNode } from "react";
import { HomePage } from "./pages/HomePage";
import { PortalPage } from "./pages/PortalPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminAnalytics } from "./pages/AdminAnalytics";
import { AdminModeration } from "./pages/AdminModeration";
import { AdminVerification } from "./pages/AdminVerification";

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  protected?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: "Home",
    path: "/",
    element: <HomePage />,
    visible: true,
  },
  {
    name: "Buy",
    path: "/buy",
    element: <PortalPage pageKey="buy" />,
    visible: true,
  },
  {
    name: "Investment",
    path: "/investment",
    element: <PortalPage pageKey="investment" />,
    visible: true,
  },
  {
    name: "Map Search",
    path: "/map-search",
    element: <PortalPage pageKey="map-search" />,
    visible: true,
  },
  {
    name: "Market Prices",
    path: "/market-prices",
    element: <PortalPage pageKey="market-prices" />,
    visible: true,
  },
  {
    name: "Verified Sellers",
    path: "/verified-sellers",
    element: <PortalPage pageKey="verified-sellers" />,
    visible: true,
  },
  {
    name: "Favorites",
    path: "/favorites",
    element: <PortalPage pageKey="favorites" />,
    visible: true,
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    element: <DashboardPage />,
    visible: true,
  },
  {
    name: "Admin Login",
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
  {
    name: "Admin Analytics",
    path: "/admin",
    element: <AdminAnalytics />,
    protected: true,
  },
  {
    name: "Admin Verification",
    path: "/admin/verification",
    element: <AdminVerification />,
    protected: true,
  },
  {
    name: "Admin Moderation",
    path: "/admin/moderation",
    element: <AdminModeration />,
    protected: true,
  },
];

export default routes;
