import { Users } from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";

export function AdminUsersPage() {
  return (
    <AdminLayout title="User Management" breadcrumb="Buyers, sellers, agencies">
      <Card className="premium-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            <p className="text-sm font-semibold uppercase tracking-[0.24em]">User management</p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ["Buyers", "12,480"],
              ["Sellers", "1,094"],
              ["Agencies", "146"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-foreground/60">{label}</p>
                <p className="mt-2 text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
