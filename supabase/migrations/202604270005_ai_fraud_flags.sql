-- AI Fraud Flags Table
-- Stores fraud detection results
CREATE TABLE IF NOT EXISTS ai_fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  risk_level TEXT CHECK (risk_level IN ('Low', 'Medium', 'High')) NOT NULL,
  risk_score INTEGER NOT NULL,
  flags JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  recommendations_ar JSONB DEFAULT '[]',
  verification_checks JSONB DEFAULT '[]',
  is_suspicious BOOLEAN DEFAULT false,
  reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_fraud_flags_property_id ON ai_fraud_flags(property_id);
CREATE INDEX idx_ai_fraud_flags_seller_id ON ai_fraud_flags(seller_id);
CREATE INDEX idx_ai_fraud_flags_risk_level ON ai_fraud_flags(risk_level);
CREATE INDEX idx_ai_fraud_flags_is_suspicious ON ai_fraud_flags(is_suspicious) WHERE is_suspicious = true;
CREATE INDEX idx_ai_fraud_flags_reviewed ON ai_fraud_flags(reviewed) WHERE reviewed = false;
CREATE INDEX idx_ai_fraud_flags_created_at ON ai_fraud_flags(created_at DESC);

ALTER TABLE ai_fraud_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view fraud flags" ON ai_fraud_flags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage fraud flags" ON ai_fraud_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    ) OR auth.jwt()->>'role' = 'service_role'
  );

CREATE POLICY "Service role can manage fraud flags" ON ai_fraud_flags
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE ai_fraud_flags IS 'Stores AI-generated fraud risk assessments';
COMMENT ON COLUMN ai_fraud_flags.is_suspicious IS 'Flag for admin review queue';