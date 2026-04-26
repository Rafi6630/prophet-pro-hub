import { useAuth } from "../hooks/useAuth";
import SellerDashboard from "./SellerDashboard";

export default function Dashboard() {
  const { profile } = useAuth();
  if (!profile) return null;

  if (profile.active_role === "seller") return <SellerDashboard />;

  return <div>Buyer Dashboard</div>;
}
