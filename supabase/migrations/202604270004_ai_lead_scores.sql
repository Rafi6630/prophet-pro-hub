-- AI Lead Scores Table
-- Stores lead scores for seller dashboard
CREATE TABLE IF NOT EXISTS ai_lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  tier TEXT CHECK (tier IN ('Hot', 'Warm', 'Cold')),
  breakdown JSONB DEFAULT '{}',
  summary TEXT,
  summary_ar TEXT,
  action TEXT,
  action_ar TEXT,
  priority INTEGER DEFAULT 0,
  conversion_probability DECIMAL(5,3),
  estimated_close_date DATE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_lead_scores_lead_id ON ai_lead_scores(lead_id);
CREATE INDEX idx_ai_lead_scores_seller_id ON ai_lead_scores(seller_id);
CREATE INDEX idx_ai_lead_scores_tier ON ai_lead_scores(tier);
CREATE INDEX idx_ai_lead_scores_priority ON ai_lead_scores(priority DESC);
CREATE INDEX idx_ai_lead_scores_created_at ON ai_lead_scores(created_at DESC);

ALTER TABLE ai_lead_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own lead scores" ON ai_lead_scores
  FOR SELECT USING (auth.uid() = seller_id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Authenticated users can insert lead scores" ON ai_lead_scores
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage lead scores" ON ai_lead_scores
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE ai_lead_scores IS 'Stores AI-generated lead scores for seller prioritization';