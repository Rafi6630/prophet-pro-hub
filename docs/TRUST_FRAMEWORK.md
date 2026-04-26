# TRUST FRAMEWORK

**Project:** IraqProperty  
**Date:** 2026-04-27  

---

## 1. Trust Philosophy

IraqProperty is a **trust-first** marketplace. Every architecture decision must answer:

> "Does this prevent a bad actor from defrauding a buyer?"

Trust is not a feature — it is the product.

---

## 2. Identity Verification Pipeline

### Seller Verification Stages

```
UNVERIFIED ──► BASIC (email) ──► IDENTITY VERIFIED ──► TRUSTED
   │                │                    │                  │
   │         Email confirmed      national_id +       Admin-approved
   │                             document_url        full KYC review
   │
   └── Can submit listings (with high fraud_risk flag)
```

### Implementation

| Stage | Trigger | Effect on Listings |
|---|---|---|
| `unverified` | Default on signup | `fraud_risk` +20 pts (unverified seller signal) |
| `basic_verified` | Email confirmation (Supabase built-in) | No change to risk |
| `identity_verified` | `verification_requests.status = 'approved'` | Removes +20 from fraud signal |
| `trusted` | Admin manual grant | `verification_level = 'premium'` on profile |

### Database

```sql
-- verification_requests table (existing)
-- New: admin_review_verification() RPC
-- New: audit trigger on status change
-- New: Zod verificationSchema (12-digit NID, https:// document URL)
```

---

## 3. Listing Verification Workflow

### States

```
draft ──► pending_review ──► approved ──► (active/live)
                │
                └──► rejected ──► (seller notified, can resubmit)
```

### Rules

| Actor | Allowed Transitions |
|---|---|
| Seller | `draft → pending_review` (via `submit_listing_for_review` RPC) |
| Admin | `pending_review → approved` or `pending_review → rejected` |
| System trigger | `approved` also sets `status = 'active'` |

### Pre-publish checks (automatic, server-side)

1. **Ownership proof** — `verification_level ≠ 'unverified'` or `fraud_risk = 'low'`
2. **Price anomaly** — `price_per_m2` vs `market_prices.median_price_m2`
3. **Duplicate detection** — `property_hash` check for near-identical listings
4. **Description quality** — minimum 20 characters
5. **Legal status** — declared or flagged as missing

All checks run in `compute_property_intelligence()` trigger. Results stored in `fraud_risk` and `duplicate_flag` columns.

---

## 4. Immutable Audit System

### `audit_events` Table

```sql
CREATE TABLE public.audit_events (
  id          uuid PRIMARY KEY,
  event_type  audit_event_type NOT NULL,  -- enum, see below
  user_id     uuid,              -- null for system events
  entity_type text NOT NULL,    -- 'property' | 'offer' | 'user' | ...
  entity_id   text,             -- uuid as text
  old_value   jsonb,            -- pre-change snapshot
  new_value   jsonb,            -- post-change snapshot
  metadata    jsonb,            -- ip, user_agent, etc.
  created_at  timestamptz NOT NULL DEFAULT now()
);
-- RLS: INSERT for authenticated, SELECT for admin only
-- NO UPDATE, NO DELETE policies → append-only by design
```

### Event Types Tracked

| Event | Trigger |
|---|---|
| `listing_created` | AFTER INSERT on properties |
| `price_changed` | AFTER UPDATE where price changed |
| `status_changed` | AFTER UPDATE where status changed |
| `admin_action` | AFTER UPDATE where review_status changed |
| `verification_submitted` | Manual (frontend) |
| `verification_approved` | AFTER UPDATE on verification_requests |
| `verification_rejected` | AFTER UPDATE on verification_requests |
| `role_granted` | Manual (grant_self_role RPC) |

### Immutability Guarantee

RLS has no UPDATE or DELETE policy on `audit_events`. Postgres itself cannot delete a row without bypassing RLS (requires `service_role` key, which is never in client code).

For compliance, enable `WORM` (Write-Once-Read-Many) on the Supabase Storage bucket used for contracts.

---

## 5. Digital Evidence Trail

All the following must be stored with verifiable timestamps:

| Artifact | Storage Location | Retention |
|---|---|---|
| Verification documents | `supabase/storage/verification-docs/{user_id}/` | 7 years |
| Signed contracts | `supabase/storage/contracts/{transaction_id}/` | 10 years |
| Property photos | `supabase/storage/property-images/` | Duration of listing |
| Audit log | `public.audit_events` | Indefinite (append-only) |
| Price history | `public.audit_events` (price_changed events) | Indefinite |

---

## 6. Fraud Risk Scoring Specification

### Signal Weights (server-side, `compute_property_intelligence`)

| Signal | Points | Rationale |
|---|---|---|
| Description < 20 chars | +15 | Low-effort listings are higher risk |
| Seller unverified | +20 | No identity check |
| Price < 50% of market median | +25 | Bait-and-switch / scam indicator |
| Price > 300% of market median | +20 | Unrealistic, blocks serious buyers |
| Legal status not declared | +15 | Missing disclosure |
| Legal status = 'disputed' | +40 | Active dispute = high risk |
| Near-duplicate listing by same seller | +20 | Spam / price manipulation |

### Thresholds

| Score | Level | Display | Effect |
|---|---|---|---|
| 0–24 | Low | Green badge | Normal visibility |
| 25–54 | Medium | Amber badge | Warning shown to buyers |
| 55+ | High | Red badge | Admin review required before publish |

---

## 7. Required Next Steps (Not Yet Implemented)

| Item | Priority |
|---|---|
| Phone SMS verification (Twilio via Edge Function) | HIGH |
| Face-match ID validation (3rd party API) | HIGH |
| Supabase Storage for document uploads (replace URL field) | HIGH |
| Auto-notify seller on verification status change (Edge Function + email) | MEDIUM |
| Machine-learning fraud signal (description NLP, image hashing) | FUTURE |
