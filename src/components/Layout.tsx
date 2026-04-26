import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import RoleSwitcher from "./RoleSwitcher";

export default function Layout({ children }) {
  const { profile } = useAuth();
  const role = profile?.active_role || "buyer";

  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/buy">Buy</Link>
        {role === "seller" && <Link to="/seller">Seller</Link>}
        <Link to="/dashboard">Dashboard</Link>
        <RoleSwitcher />
      </nav>
      {children}
    </div>
  );
}
