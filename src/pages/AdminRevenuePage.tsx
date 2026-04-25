import { BadgeDollarSign } from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";

export function AdminRevenuePage() {
  return (
    <AdminLayout title="Revenue Dashboard" breadcrumb="Monetization engine">
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          ["Featured Listings", "$41,300 MRR"],
          ["Verified Agency Subscription", "$23,900 MRR"],
          ["Pay Per Lead", "$17,120 MRR"],
          ["Developer Promotions", "$11,800 MRR"],
          ["Market Reports", "$5,600 MRR"],
          ["Premium Investor Membership", "$8,450 MRR"],
        ].map(([label, value]) => (
          <Card key={label} className="premium-card">
            <CardContent className="p-6">
              <BadgeDollarSign className="h-5 w-5 text-primary" />
              <p className="mt-4 text-sm text-foreground/60">{label}</p>
              <p className="mt-2 text-3xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
