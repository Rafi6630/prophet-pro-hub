import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles, addRole } from "@/hooks/useUserRoles";
import { useToast } from "@/hooks/use-toast";
import type { PropertyKind } from "@/lib/property";
import SellerAccessGate from "@/components/SellerAccessGate";

export default function CreateListing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSeller, loading: rolesLoading, refetchRoles } = useUserRoles();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", title_ar: "", description: "", price: "", kind: "house" as PropertyKind,
    city: "", district: "", area_m2: "", bedrooms: "", bathrooms: "", image_url: "",
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities-create"],
    queryFn: async () => (await supabase.from("cities").select("*").eq("active", true).order("sort_order")).data ?? [],
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      // Auto-grant seller role if missing
      if (!isSeller) await addRole(user.id, "seller");

      const { data, error } = await supabase.from("properties").insert({
        user_id: user.id,
        title: form.title || form.title_ar,
        title_ar: form.title_ar || null,
        description: form.description || null,
        price: Number(form.price),
        property_kind: form.kind,
        city: form.city,
        district: form.district || null,
        area_m2: Number(form.area_m2),
        bedrooms: Number(form.bedrooms || 0),
        bathrooms: Number(form.bathrooms || 0),
        status: "active",
      }).select().single();
      if (error) throw error;
      if (form.image_url && data) {
        await supabase.from("property_images").insert({
          property_id: data.id, url: form.image_url, sort_order: 0,
        });
      }
      toast({ title: t("listing.successCreated") });
      navigate(`/property/${data.id}`);
    } catch (err) {
      toast({ title: t("common.error"), description: err instanceof Error ? err.message : String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const activateSellerMode = async () => {
    if (!user) return;
    const { error } = await addRole(user.id, "seller");
    if (error && !error.message.includes("duplicate")) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: t("dashboard.sellerActivated") });
    refetchRoles();
  };

  return (
    <SellerAccessGate isSeller={isSeller} loading={rolesLoading} onActivate={activateSellerMode}>
      <div className="container-app py-6 lg:py-10 max-w-2xl">
        <h1 className="text-2xl lg:text-3xl font-extrabold mb-6">{t("listing.create")}</h1>

        <form onSubmit={submit} className="space-y-4 bg-card border border-border rounded-2xl p-5 lg:p-6 shadow-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">{t("listing.title")} (EN)</Label>
              <Input value={form.title} onChange={e => set("title", e.target.value)} required />
            </div>
            <div>
              <Label className="mb-1.5 block">{t("listing.title")} (AR)</Label>
              <Input value={form.title_ar} onChange={e => set("title_ar", e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">{t("listing.description")}</Label>
            <Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">{t("listing.price")}</Label>
              <Input type="number" required value={form.price} onChange={e => set("price", e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">{t("listing.area")}</Label>
              <Input type="number" required value={form.area_m2} onChange={e => set("area_m2", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-2">
              <Label className="mb-1.5 block">{t("listing.kind")}</Label>
              <select value={form.kind} onChange={e => set("kind", e.target.value)} className="w-full h-10 px-3 rounded-md bg-background border border-input">
                {(["house","apartment","villa","land","commercial","office","shop"] as const).map(k => (
                  <option key={k} value={k}>{t(`property.kind.${k}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block">{t("listing.bedrooms")}</Label>
              <Input type="number" value={form.bedrooms} onChange={e => set("bedrooms", e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">{t("listing.bathrooms")}</Label>
              <Input type="number" value={form.bathrooms} onChange={e => set("bathrooms", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">{t("listing.city")}</Label>
              <select required value={form.city} onChange={e => set("city", e.target.value)} className="w-full h-10 px-3 rounded-md bg-background border border-input">
                <option value="">—</option>
                {cities.map(c => <option key={c.id} value={c.name_en}>{c.name_ar} · {c.name_en}</option>)}
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block">{t("listing.district")}</Label>
              <Input value={form.district} onChange={e => set("district", e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">{t("listing.imageUrl")}</Label>
            <Input value={form.image_url} onChange={e => set("image_url", e.target.value)} placeholder="https://…" dir="ltr" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? t("common.loading") : t("listing.publish")}</Button>
        </form>
      </div>
    </SellerAccessGate>
  );
}
