-- AI Area Metrics Table
-- Stores area intelligence data
CREATE TABLE IF NOT EXISTS ai_area_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT,
  property_type TEXT,
  metrics JSONB DEFAULT '{}',
  trends JSONB DEFAULT '{}',
  scores JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  recommendations_ar JSONB DEFAULT '[]',
  comparable_areas JSONB DEFAULT '[]',
  market_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city, district, property_type)
);

CREATE INDEX idx_ai_area_metrics_city ON ai_area_metrics(city);
CREATE INDEX idx_ai_area_metrics_district ON ai_area_metrics(district);
CREATE INDEX idx_ai_area_metrics_property_type ON ai_area_metrics(property_type);
CREATE INDEX idx_ai_area_metrics_created_at ON ai_area_metrics(created_at DESC);

ALTER TABLE ai_area_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view area metrics" ON ai_area_metrics
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage area metrics" ON ai_area_metrics
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE ai_area_metrics IS 'Stores AI-generated area intelligence and market insights';