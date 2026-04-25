// Canonical frontend property — all consumers use this, never DbProperty directly

export interface Property {
  id:           string;
  userId:       string;
  title:        string;
  titleAr:      string | null;
  description:  string | null;
  price:        number;
  currency:     string;
  type:         "sale" | "rent";
  propertyType: string;
  city:         string;
  district:     string | null;
  bedrooms:     number;
  bathrooms:    number;
  area:         number;
  latitude:     number | null;
  longitude:    number | null;
  terraScore:   number;
  aiValuation:  number | null;
  verified:     boolean;
  agentName:    string | null;
  features:     string[];
  status:       string;
  views:        number;
  images:       PropertyImage[];
  createdAt:    string;
  updatedAt:    string;
}

export interface PropertyImage {
  id:        string;
  url:       string;
  sortOrder: number;
}
