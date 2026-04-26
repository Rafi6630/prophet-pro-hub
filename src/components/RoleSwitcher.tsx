import { useAuth } from "../hooks/useAuth";

export default function RoleSwitcher() {
  const { profile, switchRole } = useAuth();
  if (!profile) return null;

  return (
    <div>
      <button onClick={() => switchRole("buyer")}>Buyer</button>
      <button onClick={() => switchRole("seller")}>Seller</button>
    </div>
  );
}
