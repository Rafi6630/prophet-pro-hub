import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Verification() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", national_id: "", document_url: "" });
  useEffect(() => { document.title = `${t("verification.title")} — ${t("common.appName")}`; }, [t]);

  const { data: existing, refetch } = useQuery({
    queryKey: ["verification", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("verification_requests").select("*")
        .eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("verification_requests").insert({
      user_id: user.id,
      full_name: form.full_name,
      national_id: form.national_id || null,
      document_url: form.document_url || null,
    });
    setLoading(false);
    if (error) toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    else { toast({ title: t("common.success") }); refetch(); }
  };

  return (
    <div className="container-app py-6 lg:py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-extrabold flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-trust" />
          {t("verification.title")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{t("verification.subtitle")}</p>
      </div>

      {existing ? (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            {existing.status === "approved" ? (
              <span className="trust-badge"><ShieldCheck className="w-4 h-4" />{t("verification.approved")}</span>
            ) : existing.status === "rejected" ? (
              <span className="text-xs font-bold bg-destructive/10 text-destructive px-2.5 py-1 rounded-full">{t("verification.rejected")}</span>
            ) : (
              <span className="gold-badge"><Clock className="w-3.5 h-3.5" />{t("verification.pending")}</span>
            )}
          </div>
          <div className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">{t("verification.fullName")}: </span>{existing.full_name}</div>
            {existing.reviewer_note && (
              <div className="p-3 bg-secondary/50 rounded-xl mt-3">{existing.reviewer_note}</div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 bg-card border border-border rounded-2xl p-6 shadow-card">
          <div>
            <Label className="mb-1.5 block">{t("verification.fullName")}</Label>
            <Input required value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <Label className="mb-1.5 block">{t("verification.nationalId")}</Label>
            <Input value={form.national_id} onChange={e => setForm(f => ({ ...f, national_id: e.target.value }))} />
          </div>
          <div>
            <Label className="mb-1.5 block">{t("verification.documentUrl")}</Label>
            <Input value={form.document_url} onChange={e => setForm(f => ({ ...f, document_url: e.target.value }))} placeholder="https://…" dir="ltr" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">{t("verification.submit")}</Button>
        </form>
      )}
    </div>
  );
}
