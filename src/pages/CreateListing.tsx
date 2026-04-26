import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, AlertTriangle, Info, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { addRole } from "@/hooks/useUserRoles";
import { useRoles } from "@/contexts/RolesContext";
import { useActiveRoleCtx } from "@/contexts/ActiveRoleContext";
import { useIntelligence } from "@/hooks/useIntelligence";
import { useListingWriter } from "@/hooks/useListingWriter";
import { useToast } from "@/hooks/use-toast";
import SellerAccessGate from "@/components/SellerAccessGate";
import { listingSchema, type ListingFormData } from "@/lib/validation/listingSchema";
import type { PropertyKind } from "@/lib/property";

// ── Score pill ────────────────────────────────────────────────────────────────
function ScorePill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border/60 bg-white px-4 py-3 shadow-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`mt-1 text-lg font-extrabold ${color}`}>{value}</span>
    </div>
  );
}

const RISK_COLOR: Record<string, string> = {
  low:    "text-emerald-600",
  medium: "text-amber-600",
  high:   "text-red-600",
};

// ── Form ──────────────────────────────────────────────────────────────────────
export default function CreateListing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSeller, loading: rolesLoading, refetchRoles } = useRoles();
  const { switchRole } = useActiveRoleCtx();
  const { toast } = useToast();
  const { compute: computeIntelligence, result: intelligence, loading: intelligenceLoading } = useIntelligence();
  const { generate: generateCopy, loading: writerLoading } = useListingWriter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    mode: "onChange",
    defaultValues: {
      kind: "house",
      bedrooms: 0,
      bathrooms: 0,
    },
  });

  const handleAIWrite = async () => {
    const price = watch("price");
    const area_m2 = watch("area_m2");
    const city = watch("city");
    const kind = watch("kind");
    if (!price || !area_m2 || !city || !kind) {
      toast({
        title: t("listing.aiNeedsBasics", "Add basics first"),
        description: t("listing.aiNeedsBasicsDesc", "We need price, area, city, and type to write a great listing."),
        variant: "destructive",
      });
      return;
    }
    const data = await generateCopy({
      property_kind: kind,
      city,
      district: watch("district") ?? undefined,
      area_m2,
      bedrooms: watch("bedrooms") ?? undefined,
      bathrooms: watch("bathrooms") ?? undefined,
      price,
      notes: watch("description") ?? undefined,
    });
    if (!data) {
      toast({
        title: t("listing.aiFailed", "AI write failed"),
        description: t("listing.aiFailedDesc", "Please try again in a moment."),
        variant: "destructive",
      });
      return;
    }
    setValue("title", data.title_en, { shouldValidate: true });
    setValue("title_ar", data.title_ar, { shouldValidate: true });
    setValue("description", data.description_en, { shouldValidate: true });
    toast({
      title: t("listing.aiWriteSuccess", "AI copy ready"),
      description: t("listing.aiWriteSuccessDesc", "Review the suggestions and edit before publishing."),
    });
  };

  const { data: cities = [] } = useQuery({
    queryKey: ["cities-create"],
    queryFn: async () =>
      (await supabase.from("cities").select("*").eq("active", true).order("sort_order")).data ?? [],
    staleTime: 10 * 60 * 1000,
  });

  // ── Live intelligence preview (debounced) ────────────────────────────────
  const watchedPrice  = watch("price");
  const watchedArea   = watch("area_m2");
  const watchedCity   = watch("city");
  const watchedKind   = watch("kind");
  const watchedDesc   = watch("description");

  const refreshIntelligence = useCallback(async () => {
    if (!watchedPrice || !watchedArea || !watchedCity || !watchedKind) return;
    if (watchedPrice < 1000 || watchedArea < 10) return;
    await computeIntelligence({
      price:         watchedPrice,
      area_m2:       watchedArea,
      city:          watchedCity,
      property_kind: watchedKind,
      description:   watchedDesc ?? "",
      seller_id:     user?.id,
    });
  }, [watchedPrice, watchedArea, watchedCity, watchedKind, watchedDesc, user?.id, computeIntelligence]);

  useEffect(() => {
    const t = setTimeout(refreshIntelligence, 800);
    return () => clearTimeout(t);
  }, [refreshIntelligence]);

  // ── Submit via secure RPC ────────────────────────────────────────────────
  const onSubmit = async (data: ListingFormData) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const { data: propertyId, error } = await supabase.rpc("create_listing", {
        _title:       data.title,
        _title_ar:    data.title_ar ?? null,
        _description: data.description ?? null,
        _price:       data.price,
        _area_m2:     data.area_m2,
        _kind:        data.kind as PropertyKind,
        _city:        data.city,
        _district:    data.district ?? null,
        _bedrooms:    data.bedrooms ?? 0,
        _bathrooms:   data.bathrooms ?? 0,
        _image_url:   data.image_url || null,
      });

      if (error) throw error;

      toast({
        title: t("listing.successCreated"),
        description: t("listing.pendingReviewDesc"),
      });

      navigate(`/property/${propertyId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const friendly =
        msg === "seller_role_required" ? t("listing.error.sellerRequired") :
        msg === "rate_limit_exceeded"  ? t("listing.error.rateLimited") :
        msg === "price_out_of_range"   ? t("listing.error.priceRange") :
        msg === "area_out_of_range"    ? t("listing.error.areaRange") :
        msg === "title_too_short"      ? t("listing.error.titleShort") :
        t("common.error");

      toast({ title: friendly, description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const activateSellerMode = async () => {
    if (!user) return;
    const { error } = await addRole(user.id, "seller");
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      return;
    }
    await refetchRoles();
    switchRole("seller");
    toast({ title: t("dashboard.sellerActivated") });
  };

  return (
    <SellerAccessGate isSeller={isSeller} loading={rolesLoading} onActivate={activateSellerMode}>
      <div className="container-app py-6 lg:py-10 max-w-2xl">
        <h1 className="text-2xl lg:text-3xl font-extrabold mb-2">{t("listing.create")}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t("listing.pendingReviewNote")}</p>

        {/* Intelligence preview */}
        {intelligence && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {t("listing.liveIntelligence")}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <ScorePill
                label={t("listing.fairPrice")}
                value={`$${intelligence.fair_price_estimate.toLocaleString()}`}
                color="text-slate-900"
              />
              <ScorePill
                label={t("listing.investScore")}
                value={`${intelligence.investment_score}/100`}
                color="text-primary"
              />
              <ScorePill
                label={t("listing.fraudRisk")}
                value={intelligence.fraud_risk.toUpperCase()}
                color={RISK_COLOR[intelligence.fraud_risk] ?? "text-slate-900"}
              />
            </div>
            {intelligence.fraud_signals.length > 0 && (
              <div className="mt-3 space-y-1">
                {intelligence.fraud_signals.map((sig) => (
                  <div key={sig} className="flex items-start gap-2 text-xs text-amber-700">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {sig}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Info className="h-3 w-3" />
              {t("listing.intelligenceNote")}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-card border border-border rounded-2xl p-5 lg:p-6 shadow-card">
          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">{t("listing.title")} (EN)</Label>
              <Input {...register("title")} />
              {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block">{t("listing.title")} (AR)</Label>
              <Input {...register("title_ar")} dir="rtl" />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="mb-1.5 block">{t("listing.description")}</Label>
            <Textarea {...register("description")} rows={4} />
            {errors.description && (
              <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Price + Area */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">{t("listing.price")} (USD)</Label>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    min={1000}
                    max={100000000}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block">{t("listing.area")} (m²)</Label>
              <Controller
                name="area_m2"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    min={10}
                    max={100000}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {errors.area_m2 && <p className="mt-1 text-xs text-destructive">{errors.area_m2.message}</p>}
            </div>
          </div>

          {/* Kind + Bedrooms + Bathrooms */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-2">
              <Label className="mb-1.5 block">{t("listing.kind")}</Label>
              <select
                {...register("kind")}
                className="w-full h-10 px-3 rounded-md bg-background border border-input text-sm"
              >
                {(["house", "apartment", "villa", "land", "commercial", "office", "shop"] as const).map((k) => (
                  <option key={k} value={k}>{t(`property.kind.${k}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block">{t("listing.bedrooms")}</Label>
              <Controller
                name="bedrooms"
                control={control}
                render={({ field }) => (
                  <Input type="number" min={0} max={50} {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))} />
                )}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">{t("listing.bathrooms")}</Label>
              <Controller
                name="bathrooms"
                control={control}
                render={({ field }) => (
                  <Input type="number" min={0} max={50} {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))} />
                )}
              />
            </div>
          </div>

          {/* City + District */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">{t("listing.city")}</Label>
              <select
                {...register("city")}
                className="w-full h-10 px-3 rounded-md bg-background border border-input text-sm"
              >
                <option value="">—</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.name_en}>{c.name_ar} · {c.name_en}</option>
                ))}
              </select>
              {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block">{t("listing.district")}</Label>
              <Input {...register("district")} />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <Label className="mb-1.5 block">{t("listing.imageUrl")}</Label>
            <Input {...register("image_url")} placeholder="https://…" dir="ltr" />
            {errors.image_url && (
              <p className="mt-1 text-xs text-destructive">{errors.image_url.message}</p>
            )}
          </div>

          {/* Review notice */}
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-800 leading-relaxed">{t("listing.reviewNotice")}</p>
          </div>

          <Button
            type="submit"
            disabled={submitting || !isValid || intelligenceLoading}
            className="w-full"
          >
            {submitting ? t("common.loading") : t("listing.publish")}
          </Button>
        </form>
      </div>
    </SellerAccessGate>
  );
}
