import { Calendar, Heart, MessageCircle, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertySidebarCTAProps {
  phone?: string | null;
  whatsappLink?: string | null;
  favoriteActive: boolean;
  onFavorite: () => void;
  onOffer: () => void;
  onSchedule: () => void;
  sellerName?: string | null;
  sellerSubtitle?: string | null;
}

export function PropertySidebarCTA({
  phone,
  whatsappLink,
  favoriteActive,
  onFavorite,
  onOffer,
  onSchedule,
  sellerName,
  sellerSubtitle,
}: PropertySidebarCTAProps) {
  return (
    <div className="space-y-4">
      <div className="premium-card sticky top-24 overflow-hidden p-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-500" />
        <div className="mb-5">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Contact seller</div>
          <div className="mt-3 text-lg font-bold">{sellerName ?? "Verified Seller"}</div>
          <div className="text-sm text-muted-foreground">{sellerSubtitle ?? "Faster replies improve conversion confidence."}</div>
        </div>

        <div className="space-y-3">
          {phone ? (
            <a href={`tel:${phone}`} className="block">
              <Button className="w-full gap-2 rounded-2xl">
                <Phone className="h-4 w-4" />
                Call Seller
              </Button>
            </a>
          ) : null}
          {whatsappLink ? (
            <a href={whatsappLink} target="_blank" rel="noopener" className="block">
              <Button variant="outline" className="w-full gap-2 rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            </a>
          ) : null}
          <Button className="w-full gap-2 rounded-2xl" variant="outline" onClick={onOffer}>
            <Send className="h-4 w-4" />
            Make Offer
          </Button>
          <Button className="w-full gap-2 rounded-2xl" variant="ghost" onClick={onSchedule}>
            <Calendar className="h-4 w-4" />
            Schedule Visit
          </Button>
          <Button className="w-full gap-2 rounded-2xl" variant="outline" onClick={onFavorite}>
            <Heart className={`h-4 w-4 transition ${favoriteActive ? "fill-destructive text-destructive animate-pulse" : ""}`} />
            {favoriteActive ? "Saved" : "Save Property"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PropertySidebarCTA;
