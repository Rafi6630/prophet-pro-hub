
-- Create opportunities table
CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  investment_type text NOT NULL DEFAULT 'buy',
  property_type text NOT NULL DEFAULT 'residential',
  city text,
  address text,
  country text DEFAULT 'Iraq',
  location jsonb DEFAULT '{"lat":0,"lng":0}'::jsonb,
  entry_price numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  estimated_dev_cost numeric DEFAULT 0,
  expected_revenue numeric DEFAULT 0,
  land_area numeric DEFAULT 0,
  built_area numeric DEFAULT 0,
  bedrooms integer DEFAULT 0,
  bathrooms integer DEFAULT 0,
  floors integer DEFAULT 1,
  timeline_months integer DEFAULT 12,
  risk_level text DEFAULT 'medium',
  zoning text,
  legal_status text,
  permit_status text,
  status text DEFAULT 'active',
  investment_score integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  ai_analysis jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own opportunities" ON public.opportunities
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create development_phases table
CREATE TABLE public.development_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  name text NOT NULL,
  budget numeric DEFAULT 0,
  start_date date,
  end_date date,
  phase_order integer DEFAULT 0,
  progress integer DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.development_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own phases" ON public.development_phases
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add updated_at trigger to opportunities
CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
