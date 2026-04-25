-- Opportunities module + offer documents + tier enforcement (credits/limits)

-- =========================
-- 1) Opportunities module
-- =========================

CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  investment_type TEXT DEFAULT 'buy',
  property_type TEXT DEFAULT 'residential',
  city TEXT,
  address TEXT,
  country TEXT DEFAULT 'Iraq',
  entry_price NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  estimated_dev_cost NUMERIC DEFAULT 0,
  expected_revenue NUMERIC DEFAULT 0,
  land_area NUMERIC DEFAULT 0,
  built_area NUMERIC DEFAULT 0,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  floors INTEGER DEFAULT 1,
  timeline_months INTEGER DEFAULT 12,
  risk_level TEXT DEFAULT 'medium',
  zoning TEXT,
  legal_status TEXT,
  permit_status TEXT,
  location JSONB DEFAULT '{"lat":0,"lng":0}'::jsonb,
  ai_analysis JSONB,
  investment_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own opportunities" ON public.opportunities
  FOR ALL
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON public.opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_city ON public.opportunities(city);
CREATE INDEX IF NOT EXISTS idx_opportunities_score ON public.opportunities(investment_score DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_created ON public.opportunities(created_at DESC);

CREATE TABLE IF NOT EXISTS public.development_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  budget NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  phase_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.development_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage phases on own opportunities" ON public.development_phases
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = development_phases.opportunity_id
        AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = development_phases.opportunity_id
        AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE INDEX IF NOT EXISTS idx_dev_phases_opp ON public.development_phases(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_dev_phases_user ON public.development_phases(user_id);

-- updated_at trigger reuse
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_opportunities_updated_at'
  ) THEN
    CREATE TRIGGER update_opportunities_updated_at
      BEFORE UPDATE ON public.opportunities
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_development_phases_updated_at'
  ) THEN
    CREATE TRIGGER update_development_phases_updated_at
      BEFORE UPDATE ON public.development_phases
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;


-- ==================================
-- 2) Offer proof-of-funds documents
-- ==================================

CREATE TABLE IF NOT EXISTS public.offer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  uploader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  doc_type TEXT NOT NULL DEFAULT 'proof_of_funds',
  storage_path TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.offer_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view offer documents" ON public.offer_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.offers o
      WHERE o.id = offer_documents.offer_id
        AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Participants can add offer documents" ON public.offer_documents
  FOR INSERT
  WITH CHECK (
    uploader_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.offers o
      WHERE o.id = offer_documents.offer_id
        AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
    )
  );

CREATE POLICY "Uploader can delete own offer documents" ON public.offer_documents
  FOR DELETE
  USING (uploader_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_offer_documents_offer ON public.offer_documents(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_documents_uploader ON public.offer_documents(uploader_id);

-- Controlled update of offers.proof_uploaded without opening broad UPDATE permissions
CREATE OR REPLACE FUNCTION public.set_offer_proof_uploaded(p_offer_id UUID, p_value BOOLEAN)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.offers o
    WHERE o.id = p_offer_id
      AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  ) THEN
    RAISE EXCEPTION 'Not authorized to update proof flag';
  END IF;

  UPDATE public.offers SET proof_uploaded = p_value, updated_at = now()
  WHERE id = p_offer_id;
END;
$$;


-- Storage bucket for offer documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('offer-documents', 'offer-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (path convention: {uploader_id}/{offer_id}/filename)
DO $$
BEGIN
  -- SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view offer documents storage') THEN
    CREATE POLICY "Anyone can view offer documents storage" ON storage.objects
      FOR SELECT
      USING (bucket_id = 'offer-documents');
  END IF;

  -- INSERT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload own offer documents') THEN
    CREATE POLICY "Users can upload own offer documents" ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'offer-documents'
        AND auth.role() = 'authenticated'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- DELETE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own offer documents') THEN
    CREATE POLICY "Users can delete own offer documents" ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'offer-documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END
$$;


-- =========================================
-- 3) Tier enforcement: credits + monthly limits
-- =========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_tier') THEN
    CREATE TYPE public.plan_tier AS ENUM ('free', 'pro', 'elite');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.plan_products (
  product_id TEXT PRIMARY KEY,
  plan public.plan_tier NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_plan_overrides (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan public.plan_tier NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.plan_limit_metrics (
  plan public.plan_tier NOT NULL,
  metric TEXT NOT NULL,
  monthly_limit INTEGER,
  PRIMARY KEY (plan, metric)
);

CREATE TABLE IF NOT EXISTS public.usage_monthly (
  user_id UUID NOT NULL,
  month DATE NOT NULL,
  metric TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, month, metric)
);

ALTER TABLE public.usage_monthly ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own monthly usage" ON public.usage_monthly
  FOR SELECT
  USING (auth.uid() = user_id);

-- Effective plan for a user
CREATE OR REPLACE FUNCTION public.get_effective_plan(p_user_id UUID)
RETURNS public.plan_tier
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan public.plan_tier;
  v_product_id TEXT;
BEGIN
  SELECT u.plan INTO v_plan
  FROM public.user_plan_overrides u
  WHERE u.user_id = p_user_id
    AND (u.expires_at IS NULL OR u.expires_at > now())
  LIMIT 1;

  IF v_plan IS NOT NULL THEN
    RETURN v_plan;
  END IF;

  SELECT s.product_id INTO v_product_id
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status = 'active'
    AND s.product_id IS NOT NULL
  LIMIT 1;

  IF v_product_id IS NOT NULL THEN
    SELECT p.plan INTO v_plan
    FROM public.plan_products p
    WHERE p.product_id = v_product_id
    LIMIT 1;

    IF v_plan IS NOT NULL THEN
      RETURN v_plan;
    END IF;
  END IF;

  RETURN 'free';
END;
$$;

-- Atomic usage consumption with enforcement
CREATE OR REPLACE FUNCTION public.consume_usage(p_metric TEXT, p_amount INTEGER DEFAULT 1)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_plan public.plan_tier;
  v_month DATE := date_trunc('month', now())::date;
  v_limit INTEGER;
  v_used INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_amount IS NULL OR p_amount < 1 THEN
    RAISE EXCEPTION 'p_amount must be >= 1';
  END IF;

  v_plan := public.get_effective_plan(v_user_id);

  SELECT monthly_limit INTO v_limit
  FROM public.plan_limit_metrics
  WHERE plan = v_plan AND metric = p_metric;

  -- Upsert and increment; if we raise after this, transaction rolls back.
  INSERT INTO public.usage_monthly (user_id, month, metric, used)
  VALUES (v_user_id, v_month, p_metric, p_amount)
  ON CONFLICT (user_id, month, metric)
  DO UPDATE SET used = public.usage_monthly.used + EXCLUDED.used,
                updated_at = now()
  RETURNING used INTO v_used;

  IF v_limit IS NOT NULL AND v_used > v_limit THEN
    RAISE EXCEPTION 'Monthly limit exceeded for % (plan %, limit %, used %)', p_metric, v_plan, v_limit, v_used;
  END IF;

  RETURN jsonb_build_object(
    'plan', v_plan,
    'metric', p_metric,
    'limit', v_limit,
    'used', v_used,
    'remaining', CASE WHEN v_limit IS NULL THEN NULL ELSE GREATEST(v_limit - v_used, 0) END
  );
END;
$$;

-- Seed Stripe product -> plan mapping (matches src/hooks/useSubscription.ts)
INSERT INTO public.plan_products(product_id, plan) VALUES
  ('prod_U1LnxxW5quYjSn', 'free'),
  ('prod_U1LoY0ChJHxRfM', 'pro'),
  ('prod_U1LocwDTmSN7Od', 'elite')
ON CONFLICT (product_id) DO UPDATE SET plan = EXCLUDED.plan;

-- Seed metric limits (monthly)
-- NOTE: planner_analyze is charged at 5 credits per invocation in edge function.
INSERT INTO public.plan_limit_metrics(plan, metric, monthly_limit) VALUES
  ('free',  'offer_create',        3),
  ('pro',   'offer_create',       50),
  ('elite', 'offer_create',      200),

  ('free',  'ai_property_analysis', 10),
  ('pro',   'ai_property_analysis', 200),
  ('elite', 'ai_property_analysis', 1000),

  ('free',  'opportunity_ai',       10),
  ('pro',   'opportunity_ai',       200),
  ('elite', 'opportunity_ai',       1000),

  ('free',  'planner_analyze',       2),
  ('pro',   'planner_analyze',      30),
  ('elite', 'planner_analyze',     200)
ON CONFLICT (plan, metric) DO UPDATE SET monthly_limit = EXCLUDED.monthly_limit;
