
-- Seller verification table
CREATE TABLE public.seller_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  verification_type text NOT NULL DEFAULT 'id_card',
  status text NOT NULL DEFAULT 'pending',
  document_url text,
  storage_path text,
  notes text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seller_verifications ENABLE ROW LEVEL SECURITY;

-- Sellers can manage their own verifications
CREATE POLICY "Users manage own verifications"
  ON public.seller_verifications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all verifications
CREATE POLICY "Admins view all verifications"
  ON public.seller_verifications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Property documents table
CREATE TABLE public.property_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  document_type text NOT NULL DEFAULT 'deed',
  file_name text NOT NULL,
  storage_path text NOT NULL,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own documents"
  ON public.property_documents FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Storage bucket for seller documents (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('seller-documents', 'seller-documents', false);

-- Storage policies for seller-documents bucket
CREATE POLICY "Users upload own docs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'seller-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users read own docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'seller-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own docs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'seller-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
