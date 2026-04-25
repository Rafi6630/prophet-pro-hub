import { LifeBuoy } from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";

export function AdminSupportPage() {
  return (
    <AdminLayout title="Support Tickets" breadcrumb="Buyer and seller operations">
      <Card className="premium-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-primary">
            <LifeBuoy className="h-5 w-5" />
            <p className="text-sm font-semibold uppercase tracking-[0.24em]">Support queue</p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              "Buyer cannot verify deed upload",
              "Agency requesting featured listing credit",
              "Seller asking for verification update",
              "Investor wants market report invoice",
            ].map((ticket) => (
              <div key={ticket} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-foreground/72">{ticket}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
