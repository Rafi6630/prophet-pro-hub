# ERROR FIX REPORT

**Project:** IraqProperty  
**Date:** 2026-04-27  
**Audited by:** Principal System Architect  

---

## Summary

| Category | Issues Found | Fixed |
|---|---|---|
| Security — Auth / RLS | 4 | 4 |
| Security — Input Validation | 6 | 6 |
| Logic — Intelligence Engines | 3 | 3 |
| Logic — State / Hooks | 2 | 2 |
| Architecture — Backend | 5 | 5 |
| UI / UX — Error Handling | 2 | 2 |
| Tests | 1 | 1 |
| **Total** | **23** | **23** |

---

## Detailed Findings

### SECURITY

---

**ERR-001**  
**File:** `src/hooks/useUserRoles.ts`  
**Problem:** `addRole()` performed a direct `INSERT` into `user_roles`. The table has RLS enabled with no INSERT policy, causing a runtime RLS violation (`new row violates row-level security policy`).  
**Fix Applied:** Replaced direct insert with `supabase.rpc("grant_self_role", { _role })` calling a `SECURITY DEFINER` Postgres function that validates the role and blocks self-assignment of `admin`.  
**Risk Level:** CRITICAL  

---

**ERR-002**  
**File:** `src/pages/CreateListing.tsx`  
**Problem:** Sellers could set `fraud_risk`, `investment_score`, `verification_level`, and `fair_price_estimate` directly by crafting a Supabase insert/update. These are trust-layer fields that must only be set by the system.  
**Fix Applied:**
1. Added `BEFORE INSERT OR UPDATE` trigger `properties_compute_intelligence` that always overwrites these fields with server-computed values.
2. Added `BEFORE UPDATE` trigger `properties_protect_fields` that resets `verification_level` and `ownership_reviewed` to old values for non-admin callers.
3. Replaced direct table INSERT with `supabase.rpc("create_listing", ...)` RPC.  
**Risk Level:** CRITICAL  

---

**ERR-003**  
**File:** `supabase/migrations/` (properties table)  
**Problem:** `price` column had `CHECK (price >= 0)` — accepting $0 and negative values.  
**Fix Applied:** Migration `20260427000001` drops the old constraint and adds `CHECK (price >= 1000 AND price <= 100000000)`.  
**Risk Level:** HIGH  

---

**ERR-004**  
**File:** `src/pages/Verification.tsx`  
**Problem:** No validation on `national_id` format. A string of any length and content was accepted. No duplicate submission guard (seller could spam verification requests).  
**Fix Applied:** Added Zod schema with `/^\d{12}$/` regex. Added guard that blocks re-submission when status is `pending`.  
**Risk Level:** MEDIUM  

---

### INPUT VALIDATION

---

**ERR-005**  
**File:** `src/pages/CreateListing.tsx`  
**Problem:** No bounds validation on `price`, `area_m2`, `bedrooms`, `bathrooms`. Values like `price = -1`, `area_m2 = 0.001` were accepted.  
**Fix Applied:** Zod schema `listingSchema` enforces all bounds. Passed to `zodResolver` in `react-hook-form`. Errors shown inline.  
**Risk Level:** HIGH  

---

**ERR-006**  
**File:** `src/pages/CreateListing.tsx`  
**Problem:** `image_url` accepted any string including `javascript:` protocol, non-HTTPS URLs, and malware links.  
**Fix Applied:** Zod `imageUrlSchema` requires `https:` protocol and max 2000 chars.  
**Risk Level:** HIGH  

---

**ERR-007**  
**File:** `src/lib/validation/listingSchema.ts` (new)  
**Problem:** No centralized validation schema existed. Each form did its own ad-hoc checks or none at all.  
**Fix Applied:** Created `src/lib/validation/listingSchema.ts` with `listingSchema`, `offerSchema`, `verificationSchema`.  
**Risk Level:** MEDIUM  

---

**ERR-008**  
**File:** `supabase/migrations/` (properties table)  
**Problem:** `area_m2` had no upper bound. A seller could list a property of 1 billion m².  
**Fix Applied:** Migration adds `CHECK (area_m2 >= 10 AND area_m2 <= 100000)`.  
**Risk Level:** MEDIUM  

---

**ERR-009**  
**File:** `supabase/migrations/` (offers table)  
**Problem:** `offer_price` had no validation. A buyer could submit an offer of $0 or negative.  
**Fix Applied:** `offerSchema` enforces `offer_price >= 1000`. DB constraint documented for future migration.  
**Risk Level:** MEDIUM  

---

**ERR-010**  
**File:** `src/pages/CreateListing.tsx`  
**Problem:** No rate limiting on listing creation. A bot could create thousands of listings per minute.  
**Fix Applied:** `create_listing` RPC calls `check_rate_limit('listing_create', auth.uid(), 10, interval '1 hour')`.  
**Risk Level:** HIGH  

---

### INTELLIGENCE ENGINES

---

**ERR-011**  
**File:** `src/lib/fairPrice.ts`, `src/lib/fraudRisk.ts`, `src/lib/investmentScore.ts`  
**Problem:** All intelligence calculations ran client-side. A seller could inspect devtools, understand the scoring formula, and engineer inputs to game the score (e.g., pass `condition = "excellent"` to inflate fair price).  
**Fix Applied:**
1. Created `supabase/functions/intelligence/index.ts` Edge Function with server-side CMA, fraud multi-signal, and investment scoring.
2. Added `compute_property_intelligence()` Postgres trigger that overwrites DB fields on every INSERT/UPDATE.
3. Added `src/hooks/useIntelligence.ts` for front-end to call the Edge Function.  
**Risk Level:** HIGH  

---

**ERR-012**  
**File:** `src/lib/fraudRisk.ts`  
**Problem:** Fraud risk used only 4 boolean signals. Missing: price-to-market ratio anomaly, duplicate listing detection, legal status check.  
**Fix Applied:** Edge Function `intelligence/index.ts` adds 7 signals including price anomaly (< 50% market, > 300% market), duplicate detection, thin description, legal dispute flag.  
**Risk Level:** HIGH  

---

**ERR-013**  
**File:** `src/lib/investmentScore.ts`  
**Problem:** `locationGrowth` and `liquidity` inputs were assumed and caller-provided; they could be anything from 0 to infinity. No fallback for when `marketAverage = 0`.  
**Fix Applied:** Edge Function validates all inputs, clamps all scores, uses `market_prices` table for real market average, and falls back to 1200 USD/m² for unknown cities.  
**Risk Level:** MEDIUM  

---

### STATE / HOOKS

---

**ERR-014**  
**File:** `src/hooks/useAuth.tsx`  
**Problem:** Auth race condition: `onAuthStateChange` subscription and `getSession()` both fired on mount. If `getSession()` resolved after the subscription event, it could overwrite `user` with `null` from a stale response.  
**Fix Applied:** `setUser(prev => prev ?? session?.user ?? null)` — subscription result takes priority. `mounted` guard prevents state updates after unmount.  
**Risk Level:** HIGH  

---

**ERR-015**  
**File:** `src/pages/Dashboard.tsx`  
**Problem:** `.filter(t => t.show)` — callback parameter `t` shadowed the `t` function from `useTranslation()`, causing silent translation breakage.  
**Fix Applied:** Renamed callback parameter to `.filter(tab => tab.show)`.  
**Risk Level:** MEDIUM  

---

### ARCHITECTURE

---

**ERR-016**  
**File:** `src/App.tsx`  
**Problem:** `QueryClient` instantiated with default `staleTime: 0`. Every navigation re-fetched all data regardless of whether it was fresh.  
**Fix Applied:** `QueryClient` configured with `staleTime: 5min`, `gcTime: 10min`, smart retry (no retry on 4xx).  
**Risk Level:** MEDIUM  

---

**ERR-017**  
**File:** `public/sw.js`  
**Problem:** Cache name was `"terravista-v2"` — old product name. Old caches never evicted because the filter matched `"terravista-"` prefix.  
**Fix Applied:** Cache renamed to `"iraqproperty-v1"`. Activate handler filter updated to match `"iraqproperty-"`.  
**Risk Level:** LOW  

---

**ERR-018**  
**File:** `src/components/Layout.tsx`  
**Problem:** 4 hardcoded English strings bypassed i18n: `"Buyer"`, `"Seller"`, `"Buyer Mode"`, `"Seller Mode"`, `"Trusted property intelligence"`, `"Browse verified listings..."`.  
**Fix Applied:** All replaced with `t("roleSwitch.*")`, `t("common.tagline")`, `t("nav.browseInfo")`.  
**Risk Level:** LOW  

---

**ERR-019**  
**File:** `supabase/` (missing)  
**Problem:** No audit trail existed for sensitive operations (price changes, verification approvals, role grants).  
**Fix Applied:** `audit_events` table created (append-only, no UPDATE/DELETE RLS). Triggers on `properties`, `verification_requests`. Admin-only read policy.  
**Risk Level:** HIGH  

---

**ERR-020**  
**File:** `supabase/` (missing)  
**Problem:** No transaction lifecycle model existed. Offers existed but had no escalation path to contract → payment → transfer.  
**Fix Applied:** `transactions` table created with `transaction_status` enum and full lifecycle states. RLS policies for buyer/seller/admin.  
**Risk Level:** HIGH  

---

### ERROR HANDLING

---

**ERR-021**  
**File:** `src/App.tsx`  
**Problem:** No React Error Boundary. A runtime error in any route-level component caused the entire app to become a blank white screen with no recovery path.  
**Fix Applied:** `ErrorBoundary` class component wraps the entire `App`. Shows user-friendly error UI with a "Try again" reset button. Integrates with Sentry when `window.__SENTRY__` is present.  
**Risk Level:** HIGH  

---

**ERR-022**  
**File:** `src/pages/CreateListing.tsx`  
**Problem:** RPC error codes (`seller_role_required`, `rate_limit_exceeded`, `price_out_of_range`) were shown raw to users.  
**Fix Applied:** Error code mapping to i18n-translated messages in `onSubmit` catch block.  
**Risk Level:** MEDIUM  

---

### TESTS

---

**ERR-023**  
**File:** `src/test/example.test.ts`  
**Problem:** Only one placeholder test existed. No coverage for any business logic.  
**Fix Applied:** Added 4 test files:
- `fairPrice.test.ts` (10 tests)
- `investmentScore.test.ts` (9 tests)
- `riskScore.test.ts` (10 tests)
- `listingSchema.test.ts` (16 tests)

Total: 45 new test cases covering all intelligence engines and validation schemas.  
**Risk Level:** HIGH  

---

## Remaining Technical Debt

| Item | Priority | Effort |
|---|---|---|
| Move `sampleProperties.ts` (18K lines) out of bundle to Supabase | HIGH | 2 days |
| Add E2E tests (Playwright) for seller onboarding flow | HIGH | 1 day |
| Add Supabase image upload (Storage) instead of URL input | MEDIUM | 1 day |
| Enable `strictNullChecks: true` in tsconfig | MEDIUM | 3 days |
| Add pg_cron job to purge `rate_limit_buckets` | LOW | 2 hours |
| Add `city.growth_score` column for accurate investment scoring | MEDIUM | 4 hours |
