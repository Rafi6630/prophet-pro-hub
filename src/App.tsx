import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import SellerDashboard from "./pages/SellerDashboard";
import CreateListing from "./pages/CreateListing";
import RequireAuth from "./components/guards/RequireAuth";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/buy" element={<div>Buy</div>} />

          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/seller/create" element={<CreateListing />} />
          </Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
