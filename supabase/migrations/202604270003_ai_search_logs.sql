-- AI Search Logs Table
-- Tracks user search queries for analytics
CREATE TABLE IF NOT EXISTS ai_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  raw_query TEXT NOT NULL,
  parsed_query JSONB DEFAULT '{}',
  filters_applied JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  language TEXT DEFAULT 'en',
  device_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_search_logs_user_id ON ai_search_logs(user_id);
CREATE INDEX idx_ai_search_logs_created_at ON ai_search_logs(created_at DESC);
CREATE INDEX idx_ai_search_logs_raw_query ON ai_search_logs(raw_query);
CREATE INDEX idx_ai_search_logs_language ON ai_search_logs(language);

ALTER TABLE ai_search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own search logs" ON ai_search_logs
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Authenticated users can insert search logs" ON ai_search_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage search logs" ON ai_search_logs
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE ai_search_logs IS 'Tracks search queries for AI optimization and analytics';