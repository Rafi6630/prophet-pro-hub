import { Pencil, Trash2, Sparkles, Eye, Users, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DbProperty } from "@/lib/property";

export type ListingWithImages = DbProperty & {
  property_images?: { url: string }[];
};

interface SellerListingCardProps {
  property: ListingWithImages;
  onEdit: () => void;
  onDelete: () => void;
  onPromote: () => void;
}

const PLACEHOLDER = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80";

function statusBadge(status: string) {
  switch (status) {
    case "active":   return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">Active</Badge>;
    case "draft":    return <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">Draft</Badge>;
    case "sold":     return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px]">Sold</Badge>;
    case "archived": return <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">Pending</Badge>;
    default:         return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
  }
}

function formatPrice(price: number, currency: string): string {
  const sym = currency === "IQD" ? "IQD" : "$";
  if (price >= 1_000_000) return `${sym}${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `${sym}${(price / 1_000).toFixed(0)}K`;
  return `${sym}${price}`;
}

export default function SellerListingCard({
  property,
  onEdit,
  onDelete,
  onPromote,
}: SellerListingCardProps) {
  const imgUrl = property.property_images?.[0]?.url ?? PLACEHOLDER;
  const views = property.views ?? 0;
  const mockLeads = Math.floor(views * 0.05) + 1;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="relative">
        <img
          src={imgUrl}
          alt={property.title}
          className="w-full h-44 object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
        />
        <div className="absolute top-2 left-2">
          {statusBadge(property.status)}
        </div>
        {property.featured && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-amber-400 text-amber-900 border-amber-400 text-[10px]">Featured</Badge>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3" />
            <span>{property.city}{property.district ? `, ${property.district}` : ""}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-amber-600">
            {formatPrice(property.price, property.currency ?? "USD")}
          </span>
          <span className="text-xs text-slate-500 capitalize">{property.property_kind}</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {views} views
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {mockLeads} leads
          </span>
          <span>{property.area_m2} m²</span>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl text-xs h-8 gap-1 border-slate-200"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl text-xs h-8 gap-1 border-amber-200 text-amber-700 hover:bg-amber-50"
            onClick={onPromote}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Promote
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-xl border-red-100 text-red-500 hover:bg-red-50"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
