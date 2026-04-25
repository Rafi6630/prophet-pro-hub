
-- Fix overly permissive usage_logs INSERT policy
DROP POLICY "System inserts usage" ON public.usage_logs;
CREATE POLICY "Authenticated users insert own usage" ON public.usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
