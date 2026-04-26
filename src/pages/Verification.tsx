import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { verificationSchema, type VerificationFormData } from "@/lib/validation/listingSchema";

export default function Verification() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    document.title = `${t("verification.title")} — ${t("common.appName")}`;
  }, [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    mode: "onBlur",
  });

  const { data: existing, refetch } = useQuery({
    queryKey: ["verification", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("verification_requests")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    staleTime: 60_000,
  });

  const onSubmit = async (data: VerificationFormData) => {
    if (!user) return;

    // Prevent duplicate pending submissions
    if (existing && existing.status === "pending") {
      toast({ title: t("verification.alreadyPending"), variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("verification_requests").insert({
      user_id:      user.id,
      full_name:    data.full_name.trim(),
      national_id:  data.national_id || null,
      document_url: data.document_url || null,
    });

    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("common.success") });
      reset();
      refetch();
    }
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
              <span className="trust-badge">
                <ShieldCheck className="w-4 h-4" />{t("verification.approved")}
              </span>
            ) : existing.status === "rejected" ? (
              <span className="text-xs font-bold bg-destructive/10 text-destructive px-2.5 py-1 rounded-full">
                {t("verification.rejected")}
              </span>
            ) : (
              <span className="gold-badge">
                <Clock className="w-3.5 h-3.5" />{t("verification.pending")}
              </span>
            )}
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">{t("verification.fullName")}: </span>
              {existing.full_name}
            </div>
            {existing.reviewer_note && (
              <div className="p-3 bg-secondary/50 rounded-xl mt-3">{existing.reviewer_note}</div>
            )}
          </div>
          {existing.status === "rejected" && (
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => refetch()}
            >
              {t("verification.resubmit")}
            </Button>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 bg-card border border-border rounded-2xl p-6 shadow-card"
        >
          <div>
            <Label className="mb-1.5 block">{t("verification.fullName")}</Label>
            <Input {...register("full_name")} />
            {errors.full_name && (
              <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1.5 block">
              {t("verification.nationalId")}
              <span className="ml-1 text-xs text-muted-foreground">(12 digits)</span>
            </Label>
            <Input {...register("national_id")} inputMode="numeric" maxLength={12} dir="ltr" />
            {errors.national_id && (
              <p className="mt-1 text-xs text-destructive">{errors.national_id.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1.5 block">{t("verification.documentUrl")}</Label>
            <Input {...register("document_url")} placeholder="https://…" dir="ltr" />
            {errors.document_url && (
              <p className="mt-1 text-xs text-destructive">{errors.document_url.message}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{t("verification.documentHint")}</p>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? t("common.loading") : t("verification.submit")}
          </Button>
        </form>
      )}
    </div>
  );
}
