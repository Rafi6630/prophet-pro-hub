import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ShieldCheck, MapPin, BedDouble, Bath, Maximize, Heart, Share2,
  Phone, MessageCircle, FileText, AlertTriangle, TrendingUp, Coins,
  GraduationCap, Hospital, Car, Zap, Droplet, Shield, Calendar, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import {
  type PropertyWithMedia, propertyImage, pricePerM2, formatPrice,
  fairPrice, discountToFair, priceVerdict, investmentScore,
  fraudRisk, legalStatus, areaGrowthPct, areaScore,
} from "@/lib/property";
import { seededPropertyById } from "@/lib/sampleInventory";

const AREA = [
  { key: "schools", icon: GraduationCap, field: "schools_score" as const },
  { key: "hospitals", icon: Hospital, field: "hospitals_score" as const },
  { key: "roads", icon: Car, field: "roads_score" as const },
  { key: "electricity", icon: Zap, field: "electricity_score" as const },
  { key: "water", icon: Droplet, field: "water_score" as const },
  { key: "safety", icon: Shield, field: "safety_score" as const },
];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`w-1.5 h-3 rounded-sm ${i <= Math.round(n) ? "bg-gold" : "bg-secondary"}`} />
      ))}
    </div>
  );
}

export default function PropertyDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isFavorite, toggle } = useFavorites();
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);
  const [offerOpen, setOfferOpen] = useState(false);
  const [inspectOpen, setInspectOpen] = useState(false);

  const { data: p, isLoading } = useQuery({
    queryKey: ["property", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("*, property_images(*)")
        .eq("id", id!)
        .maybeSingle();
      if (!data) return seededPropertyById(id! as string) ?? null;
      const { data: seller } = await supabase
        .from("profiles").select("display_name, avatar_url, phone, whatsapp, user_id")
        .eq("user_id", data.user_id).maybeSingle();
      return { ...data, seller } as PropertyWithMedia;
    },
  });

  useEffect(() => {
    if (p) document.title = `${p.title_ar || p.title} — ${t("common.appName")}`;
  }, [p, t]);

  if (isLoading) return <div className="container-app py-12 text-center text-muted-foreground">{t("common.loading")}</div>;
  if (!p) return <div className="container-app py-12 text-center">{t("common.noResults")}</div>;

  const score = investmentScore(p);
  const verdict = priceVerdict(p);
  const disc = discountToFair(p);
  const fp = fairPrice(p);
  const risk = fraudRisk(p);
  const ls = legalStatus(p);
  const fav = user ? isFavorite(p.id) : false;
  const images = p.property_images?.length ? p.property_images : [{ id: "ph", url: propertyImage(p), sort_order: 0 } as never];

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: p.title, url });
    else { await navigator.clipboard.writeText(url); toast({ title: t("common.success") }); }
  };

  const whatsappLink = p.seller?.whatsapp ? `https://wa.me/${p.seller.whatsapp.replace(/\D/g, "")}` : null;

  return (
    <div className="pb-24 lg:pb-12">
      {/* Gallery */}
      <div className="bg-secondary/30">
        <div className="container-app py-4 lg:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 lg:gap-3">
            <div className="lg:col-span-3 aspect-[4/3] lg:aspect-[16/10] rounded-2xl overflow-hidden bg-muted">
              <img src={images[imgIdx].url} alt={p.title} className="w-full h-full object-cover" />
            </div>
            <div className="hidden lg:flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
              {images.slice(0, 6).map((img, i) => (
                <button key={img.id} onClick={() => setImgIdx(i)}
                  className={`aspect-[4/3] rounded-xl overflow-hidden border-2 ${i === imgIdx ? "border-primary" : "border-transparent"}`}>
                  <img src={img.url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div className="lg:hidden flex gap-2 overflow-x-auto py-3">
            {images.map((img, i) => (
              <button key={img.id} onClick={() => setImgIdx(i)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${i === imgIdx ? "border-primary" : "border-transparent"}`}>
                <img src={img.url} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-app py-6 grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8">
        {/* Main */}
        <div className="space-y-6">
          {/* Title block */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {(p.verification_level === "verified" || p.verification_level === "premium") && (
                <span className="trust-badge"><ShieldCheck className="w-3 h-3" />{t("property.verified")}</span>
              )}
              {p.investment_deal && <span className="gold-badge"><TrendingUp className="w-3 h-3" />{t("property.investmentDeal")}</span>}
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold">{p.title_ar || p.title}</h1>
            <div className="flex items-center gap-1.5 text-muted-foreground mt-2">
              <MapPin className="w-4 h-4" /> {p.district ? `${p.district}، ` : ""}{p.city}
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl lg:text-4xl font-extrabold">{formatPrice(p.price)}</span>
              <span className="text-sm text-muted-foreground">${pricePerM2(p)}{t("common.perM2")}</span>
            </div>
          </div>

          {/* Quick facts */}
          <div className="grid grid-cols-3 gap-3">
            {p.bedrooms > 0 && (
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <BedDouble className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <div className="font-bold">{p.bedrooms}</div>
                <div className="text-xs text-muted-foreground">{t("property.details.bedrooms")}</div>
              </div>
            )}
            {p.bathrooms > 0 && (
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <Bath className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <div className="font-bold">{p.bathrooms}</div>
                <div className="text-xs text-muted-foreground">{t("property.details.bathrooms")}</div>
              </div>
            )}
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <Maximize className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <div className="font-bold">{p.area_m2}</div>
              <div className="text-xs text-muted-foreground">{t("common.m2")}</div>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">{t("property.details.overview")}</TabsTrigger>
              <TabsTrigger value="trust">{t("property.details.trust")}</TabsTrigger>
              <TabsTrigger value="invest">{t("property.details.investment")}</TabsTrigger>
              <TabsTrigger value="area">{t("property.details.area")}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="bg-card border border-border rounded-2xl p-5 mt-4">
              <p className="text-sm leading-relaxed whitespace-pre-line">{p.description_ar || p.description || "—"}</p>
              {p.features && p.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                  {p.features.map(f => (
                    <span key={f} className="text-xs bg-secondary px-2.5 py-1 rounded-full font-medium">{f}</span>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="trust" className="space-y-3 mt-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-trust" />{t("property.verified")}</span>
                  <span className="text-sm font-bold capitalize">{t(`property.${p.verification_level === "premium" ? "premium" : p.verification_level === "verified" ? "verified" : "unverified"}`)}</span>
                </div>
                <div className="flex items-center justify-between mb-2 pt-2 border-t border-border">
                  <span className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" />{t("property.ownershipReviewed")}</span>
                  <span className="text-sm font-bold">{p.ownership_reviewed ? t("common.yes") : t("common.no")}</span>
                </div>
                <div className="flex items-center justify-between mb-2 pt-2 border-t border-border">
                  <span className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" />{t("property.legalStatus")}</span>
                  <span className={`text-sm font-bold capitalize ${ls === "clear" ? "text-trust" : ls === "disputed" ? "text-destructive" : "text-warning"}`}>{ls}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{t("property.fraudRisk")}</span>
                  <span className={`text-sm font-bold ${risk === "low" ? "text-trust" : risk === "high" ? "text-destructive" : "text-warning"}`}>{t(`property.risk.${risk}`)}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="invest" className="space-y-3 mt-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">{t("property.investmentScore")}</span>
                  <span className="text-2xl font-extrabold text-gradient-gold">{score}<span className="text-sm text-muted-foreground">/100</span></span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden mb-4">
                  <div className="h-full bg-gradient-gold" style={{ width: `${score}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-secondary/50">
                    <div className="text-xs text-muted-foreground flex items-center gap-1"><Coins className="w-3 h-3" />{t("property.fairPriceEstimate")}</div>
                    <div className="font-bold mt-1">{formatPrice(fp)}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/50">
                    <div className="text-xs text-muted-foreground">{t(verdict === "under" ? "property.undervalued" : verdict === "over" ? "property.overpriced" : "property.atFairPrice")}</div>
                    <div className={`font-bold mt-1 ${verdict === "under" ? "text-trust" : verdict === "over" ? "text-destructive" : ""}`}>
                      {disc > 0 ? "−" : disc < 0 ? "+" : ""}{Math.abs(disc).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/50">
                    <div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" />{t("property.areaGrowth")}</div>
                    <div className="font-bold mt-1 text-trust">+{areaGrowthPct(p).toFixed(1)}%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/50">
                    <div className="text-xs text-muted-foreground">{t("property.incomePotential")}</div>
                    <div className="font-bold mt-1">{p.income_potential || "—"}</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="area" className="bg-card border border-border rounded-2xl p-5 mt-4">
              <h3 className="font-bold mb-4">{t("property.areaIntelligence")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AREA.map(a => (
                  <div key={a.key} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                    <div className="w-10 h-10 rounded-lg bg-card grid place-items-center"><a.icon className="w-5 h-5 text-primary" /></div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{t(`property.${a.key}`)}</div>
                      <Stars n={areaScore(p, a.field)} />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Side panel */}
        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-navy text-white grid place-items-center font-extrabold">
                {p.seller?.display_name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <div className="font-bold truncate">{p.seller?.display_name ?? "—"}</div>
                <div className="text-xs text-muted-foreground">{t("property.details.seller")}</div>
              </div>
            </div>
            <div className="space-y-2">
              {p.seller?.phone && (
                <a href={`tel:${p.seller.phone}`} className="block">
                  <Button className="w-full gap-2"><Phone className="w-4 h-4" />{t("property.actions.contactSeller")}</Button>
                </a>
              )}
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noopener" className="block">
                  <Button variant="outline" className="w-full gap-2 border-trust/30 text-trust hover:bg-trust/10 hover:text-trust">
                    <MessageCircle className="w-4 h-4" />{t("property.actions.whatsapp")}
                  </Button>
                </a>
              )}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => user ? toggle(p.id) : navigate("/auth")} className={fav ? "text-destructive border-destructive" : ""}>
                  <Heart className={`w-4 h-4 ${fav ? "fill-destructive" : ""}`} />
                </Button>
                <Button variant="outline" size="sm" onClick={() => user ? setOfferOpen(true) : navigate("/auth")}>
                  <Send className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={share}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <Button variant="ghost" className="w-full gap-2" onClick={() => user ? setInspectOpen(true) : navigate("/auth")}>
                <Calendar className="w-4 h-4" />{t("property.actions.requestInspection")}
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Sticky mobile CTA */}
      <div className="sticky-cta">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-2 flex gap-2">
          {p.seller?.phone && (
            <a href={`tel:${p.seller.phone}`} className="flex-1">
              <Button className="w-full gap-2"><Phone className="w-4 h-4" />{t("property.actions.contactSeller")}</Button>
            </a>
          )}
          {whatsappLink && (
            <a href={whatsappLink} target="_blank" rel="noopener" className="flex-1">
              <Button className="w-full gap-2 bg-trust hover:bg-trust/90 text-trust-foreground">
                <MessageCircle className="w-4 h-4" />{t("property.actions.whatsapp")}
              </Button>
            </a>
          )}
        </div>
      </div>

      <OfferDialog open={offerOpen} onClose={() => setOfferOpen(false)} property={p} />
      <InspectionDialog open={inspectOpen} onClose={() => setInspectOpen(false)} property={p} />
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("offers").insert({
      property_id: property.id, buyer_id: user.id, seller_id: property.user_id,
      offer_price: Number(price), message,
    });
    setLoading(false);
    if (error) toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    else { toast({ title: t("offer.success") }); onClose(); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("offer.title")}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="mb-1.5 block">{t("offer.price")}</Label>
            <Input type="number" required value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">{t("offer.message")}</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">{t("offer.submit")}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InspectionDialog({ open, onClose, property }: { open: boolean; onClose: () => void; property: PropertyWithMedia }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [when, setWhen] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("inspection_requests").insert({
      property_id: property.id, buyer_id: user.id, seller_id: property.user_id,
      preferred_at: when ? new Date(when).toISOString() : null, message,
    });
    setLoading(false);
    if (error) toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    else { toast({ title: t("inspection.success") }); onClose(); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("inspection.title")}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="mb-1.5 block">{t("inspection.preferredAt")}</Label>
            <Input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">{t("inspection.message")}</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">{t("common.submit")}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
