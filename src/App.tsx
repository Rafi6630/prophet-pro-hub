import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import RequireAuth from "@/components/guards/RequireAuth";

import Home from "@/pages/Home";
import Buy from "@/pages/Buy";
import Investment from "@/pages/Investment";
import MapSearch from "@/pages/MapSearch";
import MarketPrices from "@/pages/MarketPrices";
import VerifiedSellers from "@/pages/VerifiedSellers";
import Favorites from "@/pages/Favorites";
import Dashboard from "@/pages/Dashboard";
import PropertyDetail from "@/pages/PropertyDetail";
import CreateListing from "@/pages/CreateListing";
import Verification from "@/pages/Verification";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";

import "@/i18n";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/buy" element={<Layout><Buy /></Layout>} />
          <Route path="/investment" element={<Layout><Investment /></Layout>} />
          <Route path="/map" element={<Layout><MapSearch /></Layout>} />
          <Route path="/market" element={<Layout><MarketPrices /></Layout>} />
          <Route path="/sellers" element={<Layout><VerifiedSellers /></Layout>} />
          <Route path="/property/:id" element={<Layout><PropertyDetail /></Layout>} />

          <Route path="/favorites" element={
            <RequireAuth><Layout><Favorites /></Layout></RequireAuth>
          } />
          <Route path="/dashboard" element={
            <RequireAuth><Layout><Dashboard /></Layout></RequireAuth>
          } />
          <Route path="/listings/new" element={
            <RequireAuth><Layout><CreateListing /></Layout></RequireAuth>
          } />
          <Route path="/verification" element={
            <RequireAuth><Layout><Verification /></Layout></RequireAuth>
          } />

          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
