import { PhoneCall } from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";

export function AdminLeadsPage() {
  return (
    <AdminLayout title="Lead Analytics" breadcrumb="Calls, WhatsApp, offers">
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          ["WhatsApp Leads", "1,108"],
          ["Call Leads", "902"],
          ["Offer Leads", "114"],
        ].map(([label, value]) => (
          <Card key={label} className="premium-card">
            <CardContent className="p-6">
              <PhoneCall className="h-5 w-5 text-primary" />
              <p className="mt-4 text-sm text-foreground/60">{label}</p>
              <p className="mt-2 text-3xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
