// Frontend types mapped from Supabase tables

export interface DbProperty {
  id: string;
  user_id: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  price: number;
  price_iqd: number | null;
  currency: string;
  type: string;
  property_type: string;
  city: string;
  district: string | null;
  bedrooms: number;
  bathrooms: number;
  area: number;
  latitude: number | null;
  longitude: number | null;
  terra_score: number;
  ai_valuation: number | null;
  ai_confidence: string | null;
  verified: boolean;
  agent_name: string | null;
  agent_verified: boolean;
  features: string[];
  status: string;
  views: number;
  created_at: string;
  updated_at: string;
  // joined
  property_images?: DbPropertyImage[];
}

export interface DbPropertyImage {
  id: string;
  property_id: string;
  storage_path: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface DbOffer {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string | null;
  offer_price: number;
  currency: string;
  asking_price: number | null;
  offer_type: string;
  financing_type: string;
  closing_timeline_days: number;
  deposit_percent: number | null;
  proof_uploaded: boolean;
  message: string | null;
  seriousness_score: number;
  status: string;
  seller_note: string | null;
  counter_price: number | null;
  created_at: string;
  updated_at: string;
  // joined
  property?: DbProperty;
}

export interface DbFavorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: DbProperty;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  property_id: string | null;
  offer_id: string | null;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface DbLead {
  id: string;
  agent_id: string;
  property_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  stage: string;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbAlert {
  id: string;
  user_id: string;
  name: string;
  city: string | null;
  property_type: string | null;
  min_price: number | null;
  max_price: number | null;
  min_bedrooms: number | null;
  max_bedrooms: number | null;
  active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}
