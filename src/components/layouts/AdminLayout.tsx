import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Flag, LogOut, ShieldCheck, ShieldEllipsis } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumb?: string;
}

export function AdminLayout({ children, title, breadcrumb }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    { path: "/admin", label: "Analytics", icon: BarChart3 },
    { path: "/admin/verification", label: "Verification", icon: ShieldCheck },
    { path: "/admin/moderation", label: "Moderation", icon: ShieldEllipsis },
    { path: "/admin/reports", label: "Reports", icon: Flag },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-[264px] shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">IraqProperty Admin</p>
          <h2 className="mt-3 text-2xl font-bold">Trust Operations</h2>

          <nav className="mt-10 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-10 space-y-2 border-t border-sidebar-border pt-8">
            <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to portal
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/65 hover:text-destructive"
              onClick={() => {
                void signOut();
                navigate("/auth");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">{title}</h1>
            {breadcrumb ? (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">{breadcrumb}</span>
              </>
            ) : null}
          </div>
          <Badge variant="secondary">admin</Badge>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
