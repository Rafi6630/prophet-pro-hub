-- ============================================================================
-- IraqProperty — Production Hardening Migration
-- Phase: Security · Intelligence · Audit · Lifecycle · Validation
-- ============================================================================

-- ── 1. ENUMS (safe re-creation) ─────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_review_status') THEN
    CREATE TYPE public.property_review_status AS ENUM (
      'draft', 'pending_review', 'approved', 'rejected'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
    CREATE TYPE public.transaction_status AS ENUM (
      'offer_created', 'offer_accepted', 'contract_generated',
      'payment_pending', 'payment_verified', 'ownership_transfer',
      'closed', 'cancelled'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_event_type') THEN
    CREATE TYPE public.audit_event_type AS ENUM (
      'user_login', 'user_logout', 'user_signup',
      'listing_created', 'listing_updated', 'listing_deleted',
      'price_changed', 'status_changed',
      'offer_created', 'offer_accepted', 'offer_rejected',
      'verification_submitted', 'verification_approved', 'verification_rejected',
      'role_granted', 'role_revoked',
      'admin_action', 'system_computed'
    );
  END IF;
END$$;

-- ── 2. PROPERTIES: add columns safely ────────────────────────────────────────

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS review_status  public.property_review_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS property_hash  text,
  ADD COLUMN IF NOT EXISTS area_code      text,
  ADD COLUMN IF NOT EXISTS duplicate_flag boolean NOT NULL DEFAULT false;

-- Tighten price constraint (minimum $1 000, maximum $100 M)
ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_price_check;
ALTER TABLE public.properties
  ADD CONSTRAINT properties_price_check CHECK (price >= 1000 AND price <= 100000000);

-- Tighten area_m2 (minimum 10 m², maximum 100 000 m²)
ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_area_m2_check;
ALTER TABLE public.properties
  ADD CONSTRAINT properties_area_m2_check CHECK (area_m2 >= 10 AND area_m2 <= 100000);

-- ── 3. AUDIT EVENTS (append-only) ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  public.audit_event_type NOT NULL,
  user_id     uuid,                              -- null for system events
  entity_type text        NOT NULL,              -- 'property' | 'offer' | 'user' …
  entity_id   text,                              -- uuid cast to text for flexibility
  old_value   jsonb,                             -- previous state snapshot
  new_value   jsonb,                             -- new state snapshot
  metadata    jsonb,                             -- ip_address, user_agent, etc.
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_entity    ON public.audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user      ON public.audit_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_event_type ON public.audit_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created   ON public.audit_events(created_at DESC);

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Append-only: anyone authenticated can INSERT (will be called by triggers / RPCs)
CREATE POLICY IF NOT EXISTS "auth users write audit events"
  ON public.audit_events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR user_id IS NULL);

-- Only admins can read audit events
CREATE POLICY IF NOT EXISTS "admins read audit events"
  ON public.audit_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- No UPDATE, No DELETE — ever. Immutability enforced by policy absence.

-- ── 4. TRANSACTION LIFECYCLE ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.transactions (
  id            uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   uuid              NOT NULL REFERENCES public.properties(id) ON DELETE RESTRICT,
  offer_id      uuid              REFERENCES public.offers(id) ON DELETE SET NULL,
  buyer_id      uuid              NOT NULL,
  seller_id     uuid              NOT NULL,
  status        public.transaction_status NOT NULL DEFAULT 'offer_created',
  agreed_price  numeric           NOT NULL CHECK (agreed_price > 0),
  currency      text              NOT NULL DEFAULT 'USD',
  contract_url  text,             -- Supabase Storage path
  notes         text,
  closed_at     timestamptz,
  created_at    timestamptz       NOT NULL DEFAULT now(),
  updated_at    timestamptz       NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_txn_property ON public.transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_txn_buyer    ON public.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_txn_seller   ON public.transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_txn_status   ON public.transactions(status);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "buyer reads own transactions"
  ON public.transactions FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY IF NOT EXISTS "seller reads own transactions"
  ON public.transactions FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY IF NOT EXISTS "buyer creates transaction"
  ON public.transactions FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY IF NOT EXISTS "participants update transaction"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY IF NOT EXISTS "admins manage transactions"
  ON public.transactions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER transactions_touch
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── 5. PROPERTY HASH COMPUTATION FUNCTION ────────────────────────────────────
-- Generates a deterministic fingerprint from key listing fields to flag
-- near-duplicate listings by the same or different sellers.

CREATE OR REPLACE FUNCTION public.compute_property_hash(
  p_user_id    uuid,
  p_city       text,
  p_district   text,
  p_area_m2    numeric,
  p_kind       public.property_kind
)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT md5(
    COALESCE(p_user_id::text, '') || '|' ||
    LOWER(TRIM(COALESCE(p_city, '')))    || '|' ||
    LOWER(TRIM(COALESCE(p_district, ''))) || '|' ||
    ROUND(p_area_m2, -1)::text           || '|' ||
    COALESCE(p_kind::text, '')
  );
$$;

-- ── 6. SERVER-SIDE INTELLIGENCE ENGINE ───────────────────────────────────────
-- Computes fair_price_estimate, fraud_risk, investment_score from market data.
-- Runs as SECURITY DEFINER so it can read verification_requests regardless of caller.
-- Called by trigger on every INSERT / UPDATE of properties.

CREATE OR REPLACE FUNCTION public.compute_property_intelligence()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_market_avg    numeric;
  v_price_per_sqm numeric;
  v_fair_price    numeric;
  v_risk_points   int := 0;
  v_fraud_risk    public.risk_level;
  v_invest_score  int;
  v_price_adv     numeric;
  v_pricing_score numeric;
  v_city_growth   numeric := 50.0;  -- default until cities table has growth scores
BEGIN
  -- ── a. Market average for city + kind ─────────────────────────────────────
  SELECT COALESCE(median_price_m2, 1200.0)
  INTO   v_market_avg
  FROM   public.market_prices
  WHERE  city          = NEW.city
    AND  property_kind = NEW.property_kind
  ORDER BY snapshot_date DESC
  LIMIT 1;

  IF v_market_avg IS NULL THEN v_market_avg := 1200.0; END IF;

  -- ── b. Price per m² ───────────────────────────────────────────────────────
  IF NEW.area_m2 > 0 THEN
    v_price_per_sqm := NEW.price / NEW.area_m2;
  ELSE
    v_price_per_sqm := v_market_avg;
  END IF;

  -- ── c. Fair price estimate (area × market median) ─────────────────────────
  v_fair_price := ROUND(NEW.area_m2 * v_market_avg);

  -- ── d. Fraud risk: multi-signal point accumulation ────────────────────────

  -- Thin description (< 20 chars)
  IF NEW.description IS NULL OR char_length(NEW.description) < 20 THEN
    v_risk_points := v_risk_points + 15;
  END IF;

  -- Seller has no approved verification
  IF NOT EXISTS (
    SELECT 1 FROM public.verification_requests
    WHERE user_id = NEW.user_id AND status = 'approved'
  ) THEN
    v_risk_points := v_risk_points + 20;
  END IF;

  -- Price anomaly: < 50% of market (suspiciously cheap)
  IF v_market_avg > 0 AND v_price_per_sqm < v_market_avg * 0.50 THEN
    v_risk_points := v_risk_points + 25;
  END IF;

  -- Price anomaly: > 300% of market (unrealistic ask)
  IF v_market_avg > 0 AND v_price_per_sqm > v_market_avg * 3.00 THEN
    v_risk_points := v_risk_points + 20;
  END IF;

  -- No legal status declared
  IF NEW.legal_status IS NULL THEN
    v_risk_points := v_risk_points + 15;
  END IF;

  -- Legal dispute flag
  IF NEW.legal_status = 'disputed' THEN
    v_risk_points := v_risk_points + 40;
  END IF;

  -- Near-duplicate listing by same seller
  IF EXISTS (
    SELECT 1 FROM public.properties
    WHERE  user_id = NEW.user_id
      AND  city    = NEW.city
      AND  ROUND(area_m2, -1) = ROUND(NEW.area_m2, -1)
      AND  property_kind = NEW.property_kind
      AND  status = 'active'
      AND  id <> COALESCE(NEW.id, gen_random_uuid())
  ) THEN
    v_risk_points := v_risk_points + 20;
    NEW.duplicate_flag := true;
  END IF;

  v_fraud_risk := CASE
    WHEN v_risk_points >= 55 THEN 'high'::public.risk_level
    WHEN v_risk_points >= 25 THEN 'medium'::public.risk_level
    ELSE                          'low'::public.risk_level
  END;

  -- ── e. Investment score ───────────────────────────────────────────────────
  v_price_adv := GREATEST(-20.0, LEAST(20.0,
    CASE WHEN v_market_avg > 0
      THEN ((v_market_avg - v_price_per_sqm) / v_market_avg) * 100.0
      ELSE 0.0
    END
  )) + 20.0;

  v_pricing_score := LEAST(100.0, GREATEST(0.0, (v_price_adv / 40.0) * 100.0));

  v_invest_score := ROUND(
    v_pricing_score * 0.35
    + v_city_growth * 0.25    -- will improve once cities.growth_score is populated
    + 50.0          * 0.20    -- liquidity: default 50; will use area demand data
    + 50.0          * 0.20    -- condition: default 50; will use seller-provided data
  )::int;

  -- ── f. Write server-computed values ──────────────────────────────────────
  NEW.fair_price_estimate := v_fair_price;
  NEW.fraud_risk          := v_fraud_risk;
  NEW.investment_score    := LEAST(100, GREATEST(0, v_invest_score));
  NEW.property_hash       := public.compute_property_hash(
    NEW.user_id, NEW.city, NEW.district, NEW.area_m2, NEW.property_kind
  );

  RETURN NEW;
END;
$$;

-- Attach intelligence engine to properties
DROP TRIGGER IF EXISTS properties_compute_intelligence ON public.properties;
CREATE TRIGGER properties_compute_intelligence
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.compute_property_intelligence();

-- ── 7. PROTECTED FIELDS ENFORCEMENT ─────────────────────────────────────────
-- Sellers CANNOT manually set verification_level, ownership_reviewed,
-- fraud_risk, investment_score, fair_price_estimate, or review_status to
-- a higher/protected value. Only admins can elevate these.
-- (Computed values are always overwritten by the intelligence trigger above;
--  this trigger additionally blocks verification_level and ownership_reviewed.)

CREATE OR REPLACE FUNCTION public.enforce_protected_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Is the current caller an admin?
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    -- Freeze admin-only fields to their pre-update values
    NEW.verification_level  := OLD.verification_level;
    NEW.ownership_reviewed  := OLD.ownership_reviewed;
    -- review_status: sellers may set draft→pending_review only
    IF NEW.review_status NOT IN ('draft', 'pending_review') THEN
      NEW.review_status := OLD.review_status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS properties_protect_fields ON public.properties;
CREATE TRIGGER properties_protect_fields
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.enforce_protected_fields();

-- ── 8. AUDIT TRIGGERS ────────────────────────────────────────────────────────
-- Auto-log price changes and status changes on properties.

CREATE OR REPLACE FUNCTION public.audit_property_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log price changes
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    INSERT INTO public.audit_events
      (event_type, user_id, entity_type, entity_id, old_value, new_value)
    VALUES (
      'price_changed', auth.uid(), 'property', NEW.id::text,
      jsonb_build_object('price', OLD.price, 'fair_estimate', OLD.fair_price_estimate),
      jsonb_build_object('price', NEW.price, 'fair_estimate', NEW.fair_price_estimate,
                         'delta_pct', ROUND(((NEW.price - OLD.price) / NULLIF(OLD.price, 0)) * 100, 1))
    );
  END IF;

  -- Log status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_events
      (event_type, user_id, entity_type, entity_id, old_value, new_value)
    VALUES (
      'status_changed', auth.uid(), 'property', NEW.id::text,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status)
    );
  END IF;

  -- Log review_status changes
  IF OLD.review_status IS DISTINCT FROM NEW.review_status THEN
    INSERT INTO public.audit_events
      (event_type, user_id, entity_type, entity_id, old_value, new_value)
    VALUES (
      'admin_action', auth.uid(), 'property', NEW.id::text,
      jsonb_build_object('review_status', OLD.review_status),
      jsonb_build_object('review_status', NEW.review_status)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS properties_audit ON public.properties;
CREATE TRIGGER properties_audit
  AFTER UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.audit_property_changes();

-- Audit: log new listing creation
CREATE OR REPLACE FUNCTION public.audit_property_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_events
    (event_type, user_id, entity_type, entity_id, new_value)
  VALUES (
    'listing_created', auth.uid(), 'property', NEW.id::text,
    jsonb_build_object(
      'title', NEW.title,
      'city',  NEW.city,
      'price', NEW.price,
      'kind',  NEW.property_kind
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS properties_audit_insert ON public.properties;
CREATE TRIGGER properties_audit_insert
  AFTER INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.audit_property_insert();

-- Audit: log verification approvals / rejections
CREATE OR REPLACE FUNCTION public.audit_verification_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_events
      (event_type, user_id, entity_type, entity_id, old_value, new_value)
    VALUES (
      CASE NEW.status
        WHEN 'approved' THEN 'verification_approved'::public.audit_event_type
        WHEN 'rejected' THEN 'verification_rejected'::public.audit_event_type
        ELSE                 'admin_action'::public.audit_event_type
      END,
      auth.uid(), 'verification_request', NEW.id::text,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'note', NEW.reviewer_note)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS verification_requests_audit ON public.verification_requests;
CREATE TRIGGER verification_requests_audit
  AFTER UPDATE ON public.verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.audit_verification_changes();

-- ── 9. ADMIN-ONLY RPC: approve / reject verification ─────────────────────────

CREATE OR REPLACE FUNCTION public.admin_review_verification(
  _request_id uuid,
  _action     text,           -- 'approve' | 'reject'
  _note       text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin_only';
  END IF;

  IF _action NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'invalid_action';
  END IF;

  UPDATE public.verification_requests
  SET
    status        = CASE _action WHEN 'approve' THEN 'approved' ELSE 'rejected' END,
    reviewer_note = _note,
    reviewed_at   = now()
  WHERE id = _request_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_review_verification(uuid, text, text) TO authenticated;

-- ── 10. ADMIN-ONLY RPC: approve / reject listing ─────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_review_listing(
  _property_id uuid,
  _action      text,          -- 'approve' | 'reject'
  _note        text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin_only';
  END IF;

  IF _action NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'invalid_action';
  END IF;

  UPDATE public.properties
  SET
    review_status = CASE _action WHEN 'approve' THEN 'approved'::public.property_review_status
                                 ELSE 'rejected'::public.property_review_status END,
    status        = CASE _action WHEN 'approve' THEN 'active'::public.listing_status
                                 ELSE 'draft'::public.listing_status END,
    updated_at    = now()
  WHERE id = _property_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_review_listing(uuid, text, text) TO authenticated;

-- ── 11. SUBMIT LISTING FOR REVIEW (seller self-service) ──────────────────────

CREATE OR REPLACE FUNCTION public.submit_listing_for_review(_property_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.properties
  SET review_status = 'pending_review', updated_at = now()
  WHERE id = _property_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'listing_not_found_or_not_owner';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_listing_for_review(uuid) TO authenticated;

-- ── 12. RATE LIMITING HELPER ─────────────────────────────────────────────────
-- Usage: call check_rate_limit('listing_create', auth.uid()::text, 5, interval '1 hour')
-- Returns true if allowed, false if limit exceeded.

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_key   text        NOT NULL,
  window_start timestamptz NOT NULL,
  hit_count    int         NOT NULL DEFAULT 1,
  UNIQUE (bucket_key, window_start)
);

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
-- No user-facing policies — only called via SECURITY DEFINER functions

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _action      text,
  _actor       text,
  _max_hits    int,
  _window      interval
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key    text;
  v_window timestamptz;
  v_hits   int;
BEGIN
  v_key    := _action || ':' || _actor;
  v_window := date_trunc('hour', now());   -- round to hour; adjust for finer granularity

  INSERT INTO public.rate_limit_buckets (bucket_key, window_start, hit_count)
  VALUES (_action || ':' || _actor, v_window, 1)
  ON CONFLICT (bucket_key, window_start)
  DO UPDATE SET hit_count = rate_limit_buckets.hit_count + 1
  RETURNING hit_count INTO v_hits;

  RETURN v_hits <= _max_hits;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, int, interval) TO authenticated;

-- Cleanup old rate limit buckets (run periodically via pg_cron if available)
CREATE OR REPLACE FUNCTION public.purge_old_rate_limit_buckets()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.rate_limit_buckets
  WHERE window_start < now() - interval '24 hours';
$$;

-- ── 13. LISTING CREATION RPC (rate-limited + validated) ──────────────────────
-- Replaces direct table INSERT from frontend. Enforces:
--  · Seller role required
--  · Rate limit: 10 listings per hour
--  · Price / area bounds
--  · Title length
--  · Returns the new property id

CREATE OR REPLACE FUNCTION public.create_listing(
  _title        text,
  _title_ar     text DEFAULT NULL,
  _description  text DEFAULT NULL,
  _price        numeric,
  _area_m2      numeric,
  _kind         public.property_kind,
  _city         text,
  _district     text DEFAULT NULL,
  _bedrooms     int  DEFAULT 0,
  _bathrooms    int  DEFAULT 0,
  _image_url    text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_property_id uuid;
BEGIN
  -- Auth guard
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  -- Seller role guard
  IF NOT public.has_role(auth.uid(), 'seller') THEN
    RAISE EXCEPTION 'seller_role_required';
  END IF;

  -- Rate limit: 10 listings per hour
  IF NOT public.check_rate_limit('listing_create', auth.uid()::text, 10, interval '1 hour') THEN
    RAISE EXCEPTION 'rate_limit_exceeded';
  END IF;

  -- Input validation
  IF char_length(TRIM(_title)) < 5 THEN
    RAISE EXCEPTION 'title_too_short';
  END IF;

  IF _price < 1000 OR _price > 100000000 THEN
    RAISE EXCEPTION 'price_out_of_range';
  END IF;

  IF _area_m2 < 10 OR _area_m2 > 100000 THEN
    RAISE EXCEPTION 'area_out_of_range';
  END IF;

  IF TRIM(_city) = '' THEN
    RAISE EXCEPTION 'city_required';
  END IF;

  -- Insert (intelligence trigger fires automatically)
  INSERT INTO public.properties (
    user_id, title, title_ar, description,
    price, area_m2, property_kind, city, district,
    bedrooms, bathrooms, status, review_status
  )
  VALUES (
    auth.uid(), TRIM(_title), NULLIF(TRIM(COALESCE(_title_ar, '')), ''), _description,
    _price, _area_m2, _kind, _city, NULLIF(TRIM(COALESCE(_district, '')), ''),
    COALESCE(_bedrooms, 0), COALESCE(_bathrooms, 0),
    'draft', 'pending_review'
  )
  RETURNING id INTO v_property_id;

  -- Attach image if provided
  IF _image_url IS NOT NULL AND TRIM(_image_url) <> '' THEN
    INSERT INTO public.property_images (property_id, url, sort_order)
    VALUES (v_property_id, TRIM(_image_url), 0);
  END IF;

  RETURN v_property_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_listing(text, text, text, numeric, numeric, public.property_kind, text, text, int, int, text) TO authenticated;

-- ── 14. INDEXES ──────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_properties_review_status ON public.properties(review_status);
CREATE INDEX IF NOT EXISTS idx_properties_hash          ON public.properties(property_hash);
CREATE INDEX IF NOT EXISTS idx_properties_duplicate     ON public.properties(duplicate_flag) WHERE duplicate_flag = true;
CREATE INDEX IF NOT EXISTS idx_transactions_status      ON public.transactions(status);

-- ── 15. BACKFILL: compute intelligence for existing listings ──────────────────

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.properties LOOP
    UPDATE public.properties SET updated_at = updated_at WHERE id = r.id;
  END LOOP;
END$$;

-- ── END ───────────────────────────────────────────────────────────────────────
