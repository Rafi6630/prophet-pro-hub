export interface PropertyTypeOption {
  id: string;
  labelEn: string;
  labelAr: string;
}

export const propertyTypes: PropertyTypeOption[] = [
  { id: "house", labelEn: "House", labelAr: "منزل" },
  { id: "apartment", labelEn: "Apartment", labelAr: "شقة" },
  { id: "land", labelEn: "Land", labelAr: "أرض" },
  { id: "commercial-shop", labelEn: "Commercial Shop", labelAr: "محل تجاري" },
  { id: "building", labelEn: "Building", labelAr: "بناية" },
  { id: "farm", labelEn: "Farm", labelAr: "مزرعة" },
  { id: "villa", labelEn: "Villa", labelAr: "فيلا" },
];
