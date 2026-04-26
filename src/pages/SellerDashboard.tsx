import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function SellerDashboard() {
  const { profile } = useAuth();
  if (!profile) return null;

  return (
    <div>
      <h1>Seller Dashboard</h1>
      <Link to="/seller/create">Create Listing</Link>
    </div>
  );
}
