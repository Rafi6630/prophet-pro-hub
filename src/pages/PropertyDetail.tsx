import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Bath,
  BedDouble,
  Calendar,
  CarFront,
  Coins,
  LineChart,
  MapPin,
  Maximize,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageMeta from "@/components/common/PageMeta";
import PropertyGallery from "@/components/PropertyGallery";
import PropertySidebarCTA from "@/components/PropertySidebarCTA";
import TrustBadge from "@/components/TrustBadge";
import InvestmentScoreRing from "@/components/InvestmentScoreRing";
import { AIDealCard } from "@/components/ai/AIDealCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import {
  areaGrowthPct,
  areaScore,
  discountToFair,
  fairPrice,
  formatPrice,
  fraudRisk,
  investmentScore,
  legalStatus,
  propertyImage,
  pricePerM2,
  type PropertyWithMedia,
} from "@/lib/property";
import { seededPropertyById } from "@/lib/sampleInventory";

const AREA = [
  { key: "schools", label: "Schools", field: "schools_score" as const },
  { key: "hospitals", label: "Hospitals", field: "hospitals_score" as const },
  { key: "roads", label: "Roads", field: "roads_score" as const },
  { key: "power", label: "Power", field: "electricity_score" as const },
  { key: "water", label: "Water", field: "water_score" as const },
  { key: "safety", label: "Safety", field: "safety_score" as const },
];

export default function PropertyDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isFavorite, toggle } = useFavorites();
  const [offerOpen, setOfferOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("*, property_images(*)")
        .eq("id", id!)
        .maybeSingle();

      if (!data) {
        return seededPropertyById(id! as string) ?? null;
      }

      const { data: seller } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, phone, whatsapp, user_id")
        .eq("user_id", data.user_id)
        .maybeSingle();

      return { ...data, seller } as PropertyWithMedia;
    },
  });

  useEffect(() => {
    if (property) document.title = `${property.title_ar || property.title} — ${t("common.appName")}`;
  }, [property, t]);

  if (isLoading) {
    return <div className="container-app py-12 text-center text-muted-foreground">{t("common.loading")}</div>;
  }

  if (!property) {
    return <div className="container-app py-12 text-center text-muted-foreground">{t("common.noResults")}</div>;
  }

  const score = investmentScore(property);
  const fairEstimate = fairPrice(property);
  const underpricedBy = Math.max(0, discountToFair(property));
  const risk = fraudRisk(property);
  const legal = legalStatus(property);
  const growth = areaGrowthPct(property);
  const demandScore = Math.round(
    (AREA.reduce((sum, item) => sum + areaScore(property, item.field), 0) / AREA.length) * 20,
  );
  const roiPotential = Math.min(18, Math.max(6, Math.round((score / 100) * 18)));
  const favoriteActive = user ? isFavorite(property.id) : false;
  const mapEmbedUrl =
    typeof property.latitude === "number" && typeof property.longitude === "number"
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${property.longitude - 0.01}%2C${property.latitude - 0.01}%2C${property.longitude + 0.01}%2C${property.latitude + 0.01}&layer=mapnik&marker=${property.latitude}%2C${property.longitude}`
      : null;
  const images = property.property_images?.length
    ? property.property_images.map((item) => ({ id: item.id, url: item.url }))
    : [{ id: "fallback", url: propertyImage(property) }];
  const videoAsset = property.property_images?.find((item) => (item as { is_video?: boolean }).is_video);
  const whatsappLink = property.seller?.whatsapp ? `https://wa.me/${property.seller.whatsapp.replace(/\D/g, "")}` : null;
  const listedDate = new Date(property.created_at).toLocaleDateString();
  const parkingLabel = property.property_kind === "villa" || property.property_kind === "house" ? "2 spaces" : property.property_kind === "land" ? "N/A" : "1 space";

  const handleFavorite = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    toggle(property.id);
  };

  return (
    <div className="animate-fade-in pb-24 lg:pb-12">
      <PageMeta
        title={`${property.title_ar || property.title} | IraqProperty`}
        description={property.description_ar || property.description || "Premium Iraq property detail with trust, pricing, and area intelligence."}
        image={propertyImage(property)}
      />

      <section className="container-app py-6 lg:py-10">
        <PropertyGallery
          title={property.title_ar || property.title}
          images={images}
          videoUrl={videoAsset?.url ?? null}
          mapEmbedUrl={mapEmbedUrl}
        />
      </section>

      <section className="container-app grid gap-8 pb-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-16">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap gap-2">
              <TrustBadge variant="verified-seller" />
              {property.ownership_reviewed ? <TrustBadge variant="ownership-reviewed" /> : null}
              {legal !== "disputed" ? <TrustBadge variant="legal-checked" /> : null}
              {risk === "low" ? <TrustBadge variant="low-risk" /> : null}
            </div>

            <div className="mt-5 grid gap-6 xl:grid-cols-[1fr_auto] xl:items-start">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight lg:text-5xl">{property.title_ar || property.title}</h1>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  {property.district ? `${property.district}, ` : ""}{property.city}
                </div>
                <div className="mt-5 text-4xl font-extrabold lg:text-5xl">{formatPrice(property.price)}</div>
              </div>
              <InvestmentScoreRing score={score} size={84} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
              <InfoMetric icon={Maximize} label="Size" value={`${property.area_m2} sqm`} />
              <InfoMetric icon={BedDouble} label="Rooms" value={`${property.bedrooms}`} />
              <InfoMetric icon={Bath} label="Baths" value={`${property.bathrooms}`} />
              <InfoMetric icon={CarFront} label="Parking" value={parkingLabel} />
              <InfoMetric icon={Coins} label="Price / sqm" value={`$${pricePerM2(property)}`} />
              <InfoMetric icon={Calendar} label="Listed" value={listedDate} />
              <InfoMetric icon={LineChart} label="Growth Outlook" value={`+${growth.toFixed(1)}%`} />
              <InfoMetric icon={MapPin} label="Demand Score" value={`${demandScore}/100`} />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Description</div>
              <h2 className="mt-2 text-2xl font-extrabold">Readable, decision-ready property overview</h2>
              <p className="mt-5 whitespace-pre-line text-sm leading-8 text-foreground/76">
                {property.description_ar || property.description || "No description provided yet."}
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Investment Panel</div>
              <h2 className="mt-2 text-2xl font-extrabold">Premium investor snapshot</h2>
              <div className="mt-6 space-y-4">
                <SidebarMetric label="Fair Price Estimate" value={formatPrice(fairEstimate)} />
                <SidebarMetric label="Underpriced by %" value={`${underpricedBy.toFixed(1)}%`} tone={underpricedBy > 0 ? "emerald" : "slate"} />
                <SidebarMetric label="Investment Score /100" value={`${score}/100`} tone="gold" />
                <SidebarMetric label="Growth Outlook" value={`+${growth.toFixed(1)}%`} />
                <SidebarMetric label="Demand Score" value={`${demandScore}/100`} />
                <SidebarMetric label="ROI Potential" value={`${roiPotential}%`} tone="emerald" />
              </div>
            </div>
          </div>

          <AIDealCard
            propertyId={property.id}
            isAuthed={!!user}
            onAuthRequired={() => navigate("/auth")}
          />

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Area Intelligence</div>
            <h2 className="mt-2 text-2xl font-extrabold">Nearby essentials and infrastructure confidence</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {AREA.map((item) => (
                <div key={item.key} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                  <div className="mt-3 text-2xl font-extrabold">{areaScore(property, item.field).toFixed(1)}/5</div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#0f2747,#10b981)]" style={{ width: `${Math.min(100, areaScore(property, item.field) * 20)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <PropertySidebarCTA
          phone={property.seller?.phone}
          whatsappLink={whatsappLink}
          favoriteActive={favoriteActive}
          onFavorite={handleFavorite}
          onOffer={() => user ? setOfferOpen(true) : navigate("/auth")}
          onSchedule={() => user ? setVisitOpen(true) : navigate("/auth")}
          sellerName={property.seller?.display_name ?? "Verified Seller"}
          sellerSubtitle={`${legal === "clear" ? "Legal checked" : "Legal review pending"} • ${risk === "low" ? "Low risk" : "Needs closer review"}`}
        />
      </section>

      <div className="sticky-cta lg:hidden">
        <div className="grid grid-cols-2 gap-2 rounded-[1.4rem] border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.12)] md:grid-cols-4">
          {property.seller?.phone ? (
            <a href={`tel:${property.seller.phone}`}>
              <Button className="w-full gap-2 rounded-xl"><Phone className="h-4 w-4" />Call</Button>
            </a>
          ) : null}
          {whatsappLink ? (
            <a href={whatsappLink} target="_blank" rel="noopener">
              <Button className="w-full gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700"><MessageCircle className="h-4 w-4" />WhatsApp</Button>
            </a>
          ) : null}
          <Button variant="outline" className="w-full gap-2 rounded-xl border-slate-200 bg-white" onClick={handleFavorite}>
            Save
          </Button>
          <Button className="w-full gap-2 rounded-xl" onClick={() => user ? setOfferOpen(true) : navigate("/auth")}>
            <Send className="h-4 w-4" />
            Offer
          </Button>
        </div>
      </div>

      <OfferDialog open={offerOpen} onClose={() => setOfferOpen(false)} property={property} />
      <VisitDialog open={visitOpen} onClose={() => setVisitOpen(false)} property={property} />
    </div>
  );
}

function InfoMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <div className="mt-2 text-lg font-bold">{value}</div>
    </div>
  );
}

function SidebarMetric({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string;
  tone?: "slate" | "emerald" | "gold";
}) {
  const toneClasses = {
    slate: "bg-slate-50 text-slate-900",
    emerald: "bg-emerald-50 text-emerald-800",
    gold: "bg-amber-50 text-amber-900",
  };

  return (
    <div className={`rounded-[1.3rem] p-4 ${toneClasses[tone]}`}>
      <div className="text-xs uppercase tracking-[0.18em] opacity-70">{label}</div>
      <div className="mt-2 text-xl font-extrabold">{value}</div>
    </div>
  );
}

function OfferDialog({ open, onClose, property }: { open: boolean; onClose: () => void; property: PropertyWithMedia }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [price, setPrice] = useState(String(property.price));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("offers").insert({
      property_id: property.id,
      buyer_id: user.id,
      seller_id: property.user_id,
      offer_price: Number(price),
      message,
    });
    setLoading(false);
    if (error) toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    else {
      toast({ title: t("offer.success") });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-[1.75rem] border-slate-200 bg-white">
        <DialogHeader>
          <DialogTitle>{t("offer.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="mb-2 block">{t("offer.price")}</Label>
            <Input type="number" required value={price} onChange={(event) => setPrice(event.target.value)} />
          </div>
          <div>
            <Label className="mb-2 block">{t("offer.message")}</Label>
            <Textarea rows={4} value={message} onChange={(event) => setMessage(event.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-xl">
            {loading ? t("common.loading") : t("offer.submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VisitDialog({ open, onClose, property }: { open: boolean; onClose: () => void; property: PropertyWithMedia }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [when, setWhen] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("inspection_requests").insert({
      property_id: property.id,
      buyer_id: user.id,
      seller_id: property.user_id,
      preferred_at: when ? new Date(when).toISOString() : null,
      message,
    });
    setLoading(false);
    if (error) toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    else {
      toast({ title: t("inspection.success") });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-[1.75rem] border-slate-200 bg-white">
        <DialogHeader>
          <DialogTitle>Schedule Visit</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="mb-2 block">{t("inspection.preferredAt")}</Label>
            <Input type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} />
          </div>
          <div>
            <Label className="mb-2 block">{t("inspection.message")}</Label>
            <Textarea rows={4} value={message} onChange={(event) => setMessage(event.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-xl">
            {loading ? t("common.loading") : "Schedule Visit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
