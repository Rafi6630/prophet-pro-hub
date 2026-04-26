/**
 * useListingWriter — calls /functions/v1/ai-listing-writer to generate
 * bilingual title + description from raw seller inputs.
 */

import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ListingWriterInput {
  property_kind: string;
  city: string;
  district?: string;
  area_m2: number;
  bedrooms?: number;
  bathrooms?: number;
  price: number;
  features?: string[];
  notes?: string;
  audience?: "buyer" | "investor" | "family";
}

export interface ListingWriterResult {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  highlights_en: string[];
  highlights_ar: string[];
  seo_keywords_en?: string[];
  seo_keywords_ar?: string[];
}

export function useListingWriter() {
  const [result, setResult] = useState<ListingWriterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (input: ListingWriterInput) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("ai-listing-writer", {
        body: input,
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
      });
      if (response.error) throw new Error(response.error.message);
      const data = response.data as ListingWriterResult;
      setResult(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "writer_error";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, result, loading, error, reset: () => setResult(null) };
}
