-- AI Price Estimates Table
-- Stores fair price estimates for properties
CREATE TABLE IF NOT EXISTS ai_price_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  estimated_value BIGINT NOT NULL,
  low_estimate BIGINT NOT NULL,
  high_estimate BIGINT NOT NULL,
  price_difference BIGINT DEFAULT 0,
  price_difference_percent DECIMAL(5,2) DEFAULT 0,
  confidence INTEGER NOT NULL,
  confidence_label TEXT CHECK (confidence_label IN ('High', 'Medium', 'Low')),
  market_median BIGINT,
  avg_price_per_sqm BIGINT,
  comparables JSONB DEFAULT '[]',
  pricing_factors JSONB DEFAULT '{}',
  market_analysis JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for quick lookups
CREATE INDEX idx_ai_price_estimates_property_id ON ai_price_estimates(property_id);
CREATE INDEX idx_ai_price_estimates_created_at ON ai_price_estimates(created_at DESC);

-- RLS Policies
ALTER TABLE ai_price_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view price estimates" ON ai_price_estimates
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert estimates" ON ai_price_estimates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage estimates" ON ai_price_estimates
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE ai_price_estimates IS 'Stores AI-generated fair price estimates for properties';