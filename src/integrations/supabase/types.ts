export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          active: boolean
          city: string | null
          created_at: string
          id: string
          max_price: number | null
          min_bedrooms: number | null
          min_price: number | null
          name: string
          property_kind: Database["public"]["Enums"]["property_kind"] | null
          user_id: string
        }
        Insert: {
          active?: boolean
          city?: string | null
          created_at?: string
          id?: string
          max_price?: number | null
          min_bedrooms?: number | null
          min_price?: number | null
          name: string
          property_kind?: Database["public"]["Enums"]["property_kind"] | null
          user_id: string
        }
        Update: {
          active?: boolean
          city?: string | null
          created_at?: string
          id?: string
          max_price?: number | null
          min_bedrooms?: number | null
          min_price?: number | null
          name?: string
          property_kind?: Database["public"]["Enums"]["property_kind"] | null
          user_id?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          active: boolean
          country_code: string
          id: string
          latitude: number | null
          longitude: number | null
          name_ar: string
          name_en: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          country_code?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name_ar: string
          name_en: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          country_code?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name_ar?: string
          name_en?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_requests: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          message: string | null
          preferred_at: string | null
          property_id: string
          seller_id: string
          status: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          message?: string | null
          preferred_at?: string | null
          property_id: string
          seller_id: string
          status?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          message?: string | null
          preferred_at?: string | null
          property_id?: string
          seller_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      market_prices: {
        Row: {
          city: string
          id: string
          median_price_m2: number
          property_kind: Database["public"]["Enums"]["property_kind"]
          sample_size: number | null
          snapshot_date: string
          yoy_change_pct: number | null
        }
        Insert: {
          city: string
          id?: string
          median_price_m2: number
          property_kind: Database["public"]["Enums"]["property_kind"]
          sample_size?: number | null
          snapshot_date?: string
          yoy_change_pct?: number | null
        }
        Update: {
          city?: string
          id?: string
          median_price_m2?: number
          property_kind?: Database["public"]["Enums"]["property_kind"]
          sample_size?: number | null
          snapshot_date?: string
          yoy_change_pct?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          property_id: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          property_id?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          property_id?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          buyer_id: string
          created_at: string
          currency: string
          id: string
          message: string | null
          offer_price: number
          property_id: string
          seller_id: string
          status: Database["public"]["Enums"]["offer_status"]
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          currency?: string
          id?: string
          message?: string | null
          offer_price: number
          property_id: string
          seller_id: string
          status?: Database["public"]["Enums"]["offer_status"]
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          currency?: string
          id?: string
          message?: string | null
          offer_price?: number
          property_id?: string
          seller_id?: string
          status?: Database["public"]["Enums"]["offer_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          preferred_lang: string
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          preferred_lang?: string
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          preferred_lang?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          area_growth_pct: number | null
          area_m2: number
          bathrooms: number
          bedrooms: number
          city: string
          created_at: string
          currency: string
          description: string | null
          description_ar: string | null
          district: string | null
          electricity_score: number | null
          fair_price_estimate: number | null
          featured: boolean
          features: string[]
          fraud_risk: Database["public"]["Enums"]["risk_level"] | null
          hospitals_score: number | null
          id: string
          income_potential: string | null
          investment_deal: boolean
          investment_score: number | null
          latitude: number | null
          legal_status: string | null
          longitude: number | null
          ownership_reviewed: boolean
          price: number
          price_iqd: number | null
          property_kind: Database["public"]["Enums"]["property_kind"]
          roads_score: number | null
          safety_score: number | null
          schools_score: number | null
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          title_ar: string | null
          updated_at: string
          user_id: string
          verification_level: Database["public"]["Enums"]["verification_level"]
          views: number
          water_score: number | null
        }
        Insert: {
          address?: string | null
          area_growth_pct?: number | null
          area_m2: number
          bathrooms?: number
          bedrooms?: number
          city: string
          created_at?: string
          currency?: string
          description?: string | null
          description_ar?: string | null
          district?: string | null
          electricity_score?: number | null
          fair_price_estimate?: number | null
          featured?: boolean
          features?: string[]
          fraud_risk?: Database["public"]["Enums"]["risk_level"] | null
          hospitals_score?: number | null
          id?: string
          income_potential?: string | null
          investment_deal?: boolean
          investment_score?: number | null
          latitude?: number | null
          legal_status?: string | null
          longitude?: number | null
          ownership_reviewed?: boolean
          price: number
          price_iqd?: number | null
          property_kind: Database["public"]["Enums"]["property_kind"]
          roads_score?: number | null
          safety_score?: number | null
          schools_score?: number | null
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          title_ar?: string | null
          updated_at?: string
          user_id: string
          verification_level?: Database["public"]["Enums"]["verification_level"]
          views?: number
          water_score?: number | null
        }
        Update: {
          address?: string | null
          area_growth_pct?: number | null
          area_m2?: number
          bathrooms?: number
          bedrooms?: number
          city?: string
          created_at?: string
          currency?: string
          description?: string | null
          description_ar?: string | null
          district?: string | null
          electricity_score?: number | null
          fair_price_estimate?: number | null
          featured?: boolean
          features?: string[]
          fraud_risk?: Database["public"]["Enums"]["risk_level"] | null
          hospitals_score?: number | null
          id?: string
          income_potential?: string | null
          investment_deal?: boolean
          investment_score?: number | null
          latitude?: number | null
          legal_status?: string | null
          longitude?: number | null
          ownership_reviewed?: boolean
          price?: number
          price_iqd?: number | null
          property_kind?: Database["public"]["Enums"]["property_kind"]
          roads_score?: number | null
          safety_score?: number | null
          schools_score?: number | null
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          title_ar?: string | null
          updated_at?: string
          user_id?: string
          verification_level?: Database["public"]["Enums"]["verification_level"]
          views?: number
          water_score?: number | null
        }
        Relationships: []
      }
      property_images: {
        Row: {
          created_at: string
          id: string
          is_video: boolean
          property_id: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_video?: boolean
          property_id: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_video?: boolean
          property_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          created_at: string
          document_url: string | null
          full_name: string
          id: string
          national_id: string | null
          reviewed_at: string | null
          reviewer_note: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_url?: string | null
          full_name: string
          id?: string
          national_id?: string | null
          reviewed_at?: string | null
          reviewer_note?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_url?: string | null
          full_name?: string
          id?: string
          national_id?: string | null
          reviewed_at?: string | null
          reviewer_note?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "seller" | "buyer"
      listing_status: "draft" | "active" | "sold" | "archived"
      offer_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "countered"
        | "withdrawn"
      property_kind:
        | "house"
        | "apartment"
        | "villa"
        | "land"
        | "commercial"
        | "office"
        | "shop"
      risk_level: "low" | "medium" | "high"
      verification_level: "unverified" | "pending" | "verified" | "premium"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "seller", "buyer"],
      listing_status: ["draft", "active", "sold", "archived"],
      offer_status: [
        "pending",
        "accepted",
        "rejected",
        "countered",
        "withdrawn",
      ],
      property_kind: [
        "house",
        "apartment",
        "villa",
        "land",
        "commercial",
        "office",
        "shop",
      ],
      risk_level: ["low", "medium", "high"],
      verification_level: ["unverified", "pending", "verified", "premium"],
    },
  },
} as const
