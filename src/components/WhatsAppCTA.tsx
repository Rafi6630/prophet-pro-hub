import { MessageCircleMore } from "lucide-react";
import { trackWhatsAppLead } from "@/lib/leads";

interface WhatsAppCTAProps {
  phoneNumber: string;
  listingId: string;
  sellerId?: string;
  city?: string;
  message?: string;
}

export function WhatsAppCTA({
  phoneNumber,
  listingId,
  sellerId,
  city,
  message = "Hello, I want more details about this property on IraqProperty.",
}: WhatsAppCTAProps) {
  const href = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackWhatsAppLead({ listingId, sellerId, city, source: "floating-cta" })}
      className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_48px_rgba(16,185,129,0.35)] md:hidden"
      aria-label="WhatsApp Seller"
    >
      <MessageCircleMore className="h-5 w-5" />
      <span>WhatsApp Seller</span>
    </a>
  );
}
