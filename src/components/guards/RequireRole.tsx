import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles, type AppRole, getBestHomeRoute } from "@/hooks/useUserRoles";

type RequireRoleProps = PropsWithChildren<{
  /** One or more roles allowed to access this route */
  allow: AppRole | AppRole[];
}>;

export default function RequireRole({ allow, children }: RequireRoleProps) {
  const { user, loading } = useAuth();
  const { data: roles, isLoading: rolesLoading } = useUserRoles();
  const allowed = Array.isArray(allow) ? allow : [allow];

  if (loading || rolesLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const userRoles = roles ?? [];
  const ok = allowed.some((r) => userRoles.includes(r));
  if (!ok) {
    return <Navigate to={getBestHomeRoute(userRoles)} replace />;
  }

  return <>{children}</>;
}
