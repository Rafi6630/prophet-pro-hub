-- AI Generated Content Table
-- Stores AI-generated listing content
CREATE TABLE IF NOT EXISTS ai_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('listing', 'description', 'title', 'seo', 'translation')),
  language TEXT DEFAULT 'en',
  title TEXT,
  title_ar TEXT,
  description TEXT,
  description_ar TEXT,
  highlights JSONB DEFAULT '[]',
  highlights_ar JSONB DEFAULT '[]',
  seo_keywords JSONB DEFAULT '[]',
  seo_keywords_ar JSONB DEFAULT '[]',
  call_to_action TEXT,
  call_to_action_ar TEXT,
  quality TEXT CHECK (quality IN ('premium', 'standard', 'basic')),
  improvement_suggestions JSONB DEFAULT '[]',
  used BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_generated_content_property_id ON ai_generated_content(property_id);
CREATE INDEX idx_ai_generated_content_content_type ON ai_generated_content(content_type);
CREATE INDEX idx_ai_generated_content_language ON ai_generated_content(language);
CREATE INDEX idx_ai_generated_content_used ON ai_generated_content(used) WHERE used = false;
CREATE INDEX idx_ai_generated_content_created_at ON ai_generated_content(created_at DESC);

ALTER TABLE ai_generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view generated content" ON ai_generated_content
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert content" ON ai_generated_content
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Sellers can view own content" ON ai_generated_content
  FOR SELECT USING (
    created_by = auth.uid() OR 
    auth.jwt()->>'role' = 'service_role'
  );

CREATE POLICY "Service role can manage content" ON ai_generated_content
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE ai_generated_content IS 'Stores AI-generated content for listings';