import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import PageMeta from "@/components/common/PageMeta";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DashboardProfilePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    display_name: "",
    phone: "",
    whatsapp: "",
    city: "",
  });
  const [saving, setSaving] = useState(false);

  const { data: cities = [] } = useQuery({
    queryKey: ["cities-profile"],
    queryFn: async () => (await supabase.from("cities").select("*").eq("active", true).order("sort_order")).data ?? [],
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, phone, whatsapp, city")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            display_name: data.display_name ?? "",
            phone: data.phone ?? "",
            whatsapp: data.whatsapp ?? "",
            city: data.city ?? "",
          });
        }
      });
  }, [user]);

  const set = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      display_name: form.display_name || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      city: form.city || null,
      preferred_lang: i18n.language,
      updated_at: new Date().toISOString(),
    };

    const existing = await supabase.from("profiles").select("id").eq("user_id", user.id).maybeSingle();
    const response = existing.data?.id
      ? await supabase.from("profiles").update(payload).eq("user_id", user.id)
      : await supabase.from("profiles").insert(payload);

    setSaving(false);

    if (response.error) {
      toast({ title: t("common.error"), description: response.error.message, variant: "destructive" });
      return;
    }

    toast({ title: t("account.profileSaved") });
  };

  return (
    <div className="container-app py-6 lg:py-10 max-w-3xl">
      <PageMeta title={`${t("account.profileTitle")} | IraqProperty`} description={t("account.profileSubtitle")} noIndex />
      <div className="content-panel p-6 lg:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{t("dashboard.profile")}</p>
        <h1 className="mt-2 text-3xl font-extrabold">{t("account.profileTitle")}</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{t("account.profileSubtitle")}</p>

        <form onSubmit={saveProfile} className="mt-8 grid gap-4">
          <div>
            <Label className="mb-2 block">{t("account.displayName")}</Label>
            <Input value={form.display_name} onChange={(event) => set("display_name", event.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-2 block">{t("account.phone")}</Label>
              <Input value={form.phone} onChange={(event) => set("phone", event.target.value)} dir="ltr" />
            </div>
            <div>
              <Label className="mb-2 block">{t("account.whatsapp")}</Label>
              <Input value={form.whatsapp} onChange={(event) => set("whatsapp", event.target.value)} dir="ltr" />
            </div>
          </div>
          <div>
            <Label className="mb-2 block">{t("account.city")}</Label>
            <select
              value={form.city}
              onChange={(event) => set("city", event.target.value)}
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm"
            >
              <option value="">{t("home.hero.anyCity")}</option>
              {cities.map((city) => (
                <option key={city.id} value={city.name_en}>{city.name_ar} · {city.name_en}</option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={saving} className="mt-2 w-full sm:w-fit">
            {saving ? t("common.loading") : t("account.saveProfile")}
          </Button>
        </form>
      </div>
    </div>
  );
}
