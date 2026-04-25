import { sampleProperties } from "@/data/sampleProperties";

export interface SellerProfile {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  type: "Agency" | "Seller" | "Developer";
  verified: boolean;
  rating: number;
  responseTime: string;
  completedDeals: number;
  activeListings: number;
  bio: string;
  cities: string[];
  subscriptionTier: "Verified Agency" | "Featured Seller" | "Developer Promotion";
}

const groupedListings = sampleProperties.reduce<Record<string, number>>((acc, property) => {
  acc[property.seller.id] = (acc[property.seller.id] ?? 0) + 1;
  return acc;
}, {});

export const sellerProfiles: SellerProfile[] = [
  {
    id: "seller-baghdad-001",
    slug: "jadriya-prime-estates",
    name: "Jadriya Prime Estates",
    nameAr: "عقارات الجادرية برايم",
    type: "Agency",
    verified: true,
    rating: 4.9,
    responseTime: "12 minutes",
    completedDeals: 128,
    activeListings: groupedListings["seller-baghdad-001"] ?? 0,
    bio: "Premium Baghdad advisory and sales agency focused on high-trust family assets and embassy corridor homes.",
    cities: ["Baghdad"],
    subscriptionTier: "Verified Agency",
  },
  {
    id: "seller-erbil-002",
    slug: "dara-homes-agency",
    name: "Dara Homes Agency",
    nameAr: "وكالة دارا هومز",
    type: "Agency",
    verified: true,
    rating: 4.8,
    responseTime: "18 minutes",
    completedDeals: 96,
    activeListings: groupedListings["seller-erbil-002"] ?? 0,
    bio: "Erbil-focused agency known for clean-title apartment towers, villas, and international buyer support.",
    cities: ["Erbil", "Sulaymaniyah"],
    subscriptionTier: "Verified Agency",
  },
  {
    id: "seller-basra-003",
    slug: "basra-delta-investments",
    name: "Basra Delta Investments",
    nameAr: "استثمارات دلتا البصرة",
    type: "Seller",
    verified: true,
    rating: 4.7,
    responseTime: "22 minutes",
    completedDeals: 67,
    activeListings: groupedListings["seller-basra-003"] ?? 0,
    bio: "Commercial property specialist serving logistics, service retail, and mixed-use opportunities across Basra.",
    cities: ["Basra"],
    subscriptionTier: "Featured Seller",
  },
  {
    id: "seller-mosul-006",
    slug: "nineveh-asset-partners",
    name: "Nineveh Asset Partners",
    nameAr: "شركاء أصول نينوى",
    type: "Developer",
    verified: true,
    rating: 4.6,
    responseTime: "35 minutes",
    completedDeals: 41,
    activeListings: groupedListings["seller-mosul-006"] ?? 0,
    bio: "Verified redevelopment and mixed-use specialist serving strategic rebuilding opportunities in Mosul.",
    cities: ["Mosul"],
    subscriptionTier: "Developer Promotion",
  },
];
