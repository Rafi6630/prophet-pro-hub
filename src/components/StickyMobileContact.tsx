import { Heart, MessageCircleMore, Phone, ReceiptText } from "lucide-react";
import { trackCallLead, trackOfferLead, trackSaveLead, trackWhatsAppLead } from "@/lib/leads";

interface StickyMobileContactProps {
  listingId: string;
  phoneNumber: string;
  whatsappNumber: string;
  sellerId?: string;
  city?: string;
}

export function StickyMobileContact({
  listingId,
  phoneNumber,
  whatsappNumber,
  sellerId,
  city,
}: StickyMobileContactProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/96 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-4 gap-2">
        <a
          href={`tel:${phoneNumber}`}
          onClick={() => trackCallLead({ listingId, sellerId, city, source: "sticky-contact" })}
          className="flex flex-col items-center gap-1 rounded-2xl bg-white/5 px-2 py-3 text-xs font-medium text-white"
        >
          <Phone className="h-4 w-4 text-sky-300" />
          <span>Call</span>
        </a>
        <a
          href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackWhatsAppLead({ listingId, sellerId, city, source: "sticky-contact" })}
          className="flex flex-col items-center gap-1 rounded-2xl bg-emerald-500 px-2 py-3 text-xs font-semibold text-white"
        >
          <MessageCircleMore className="h-4 w-4" />
          <span>WhatsApp</span>
        </a>
        <button
          type="button"
          onClick={() => trackSaveLead({ listingId, sellerId, city, source: "sticky-contact" })}
          className="flex flex-col items-center gap-1 rounded-2xl bg-white/5 px-2 py-3 text-xs font-medium text-white"
        >
          <Heart className="h-4 w-4 text-rose-300" />
          <span>Save</span>
        </button>
        <button
          type="button"
          onClick={() => trackOfferLead({ listingId, sellerId, city, source: "sticky-contact" })}
          className="flex flex-col items-center gap-1 rounded-2xl bg-amber-500/90 px-2 py-3 text-xs font-semibold text-slate-950"
        >
          <ReceiptText className="h-4 w-4" />
          <span>Offer</span>
        </button>
      </div>
    </div>
  );
}
