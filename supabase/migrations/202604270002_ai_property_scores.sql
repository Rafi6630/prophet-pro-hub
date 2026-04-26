-- AI Property Scores Table
-- Stores investment scores and property ratings
CREATE TABLE IF NOT EXISTS ai_property_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  grade TEXT CHECK (grade IN ('Excellent', 'Strong', 'Average', 'Weak', 'Avoid')),
  breakdown JSONB DEFAULT '{}',
  summary TEXT,
  summary_ar TEXT,
  risks JSONB DEFAULT '[]',
  opportunities JSONB DEFAULT '[]',
  timeline_recommendation TEXT,
  timeline_recommendation_ar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_property_scores_property_id ON ai_property_scores(property_id);
CREATE INDEX idx_ai_property_scores_grade ON ai_property_scores(grade);
CREATE INDEX idx_ai_property_scores_score ON ai_property_scores(score DESC);
CREATE INDEX idx_ai_property_scores_created_at ON ai_property_scores(created_at DESC);

ALTER TABLE ai_property_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view property scores" ON ai_property_scores
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage scores" ON ai_property_scores
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE ai_property_scores IS 'Stores AI-generated investment scores for properties';