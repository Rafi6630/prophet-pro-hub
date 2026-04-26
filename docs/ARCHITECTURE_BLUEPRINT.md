# ARCHITECTURE BLUEPRINT

**Project:** IraqProperty  
**Date:** 2026-04-27  

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│  React 18 + Vite + TypeScript                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Buyer Portal │  │ Seller Portal│  │     Admin Portal         │  │
│  │  /dashboard  │  │ /seller/*    │  │     /admin/*             │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘  │
│         │                 │                       │                  │
│  ┌──────▼─────────────────▼───────────────────────▼──────────────┐  │
│  │              React Query Cache Layer (5 min stale)             │  │
│  └──────┬─────────────────────────────────────────────────────────┘  │
└─────────┼───────────────────────────────────────────────────────────┘
          │  HTTPS + Supabase JWT
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SUPABASE PLATFORM                               │
│                                                                       │
│  ┌────────────────────┐  ┌──────────────────────────────────────┐   │
│  │   Auth Service     │  │         Edge Functions (Deno)        │   │
│  │  JWT issuance      │  │  POST /functions/v1/intelligence     │   │
│  │  Session refresh   │  │   · Fair Price CMA                   │   │
│  │  MFA (configurable)│  │   · Fraud Risk multi-signal          │   │
│  └────────────────────┘  │   · Investment Score                 │   │
│                           └──────────────────┬───────────────────┘   │
│  ┌────────────────────────────────────────────▼───────────────────┐  │
│  │                  PostgREST API                                  │  │
│  │  (auto-generated from schema + RLS policies)                    │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL 15                                │  │
│  │                                                                  │  │
│  │  ┌────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │  │
│  │  │ Core Tables│ │ Trust Layer  │ │  Intelligence Layer       │ │  │
│  │  │ properties │ │audit_events  │ │ market_prices             │ │  │
│  │  │ profiles   │ │verification  │ │ compute_property_         │ │  │
│  │  │ user_roles │ │_requests     │ │ intelligence() trigger    │ │  │
│  │  │ cities     │ │transactions  │ │ protect_computed_         │ │  │
│  │  │ offers     │ │rate_limit_   │ │ fields() trigger          │ │  │
│  │  │ messages   │ │buckets       │ │                           │ │  │
│  │  │ favorites  │ └──────────────┘ └──────────────────────────┘ │  │
│  │  └────────────┘                                                 │  │
│  │                                                                  │  │
│  │  RLS: All tables enforced. No table scan without policy.         │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                   Supabase Storage                              │  │
│  │  /property-images  /verification-docs  /contracts              │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐
│   CDN / Vercel Edge │
│   Static assets     │
│   Cache-first SW    │
└─────────────────────┘
```

---

## 2. Data Flow: Listing Creation (Hardened)

```
Seller fills form
       │
       ▼ (Zod validation, client)
Pass schema? ──No──► Show field errors
       │
      Yes
       │
       ▼
supabase.rpc("create_listing", {...})
       │
       ▼ (SECURITY DEFINER)
  1. auth.uid() guard
  2. seller role check
  3. rate_limit check (10/hour)
  4. price / area / title validation
  5. INSERT into properties (status='draft', review_status='pending_review')
       │
       ▼ (BEFORE INSERT trigger: compute_property_intelligence)
  6. Query market_prices for city/kind
  7. Compute fair_price_estimate
  8. Compute fraud_risk (7 signals)
  9. Compute investment_score
 10. Compute property_hash (duplicate detection)
       │
       ▼ (AFTER INSERT trigger: audit_property_insert)
 11. Write audit_events record
       │
       ▼
Return property_id to client
       │
       ▼
Admin sees listing in moderation queue
Admin calls admin_review_listing(id, 'approve')
       │
       ▼ (SECURITY DEFINER: admin only)
 12. SET review_status = 'approved', status = 'active'
       │
       ▼ (AFTER UPDATE trigger: audit_property_changes)
 13. Write audit record (status_changed, review_status_changed)
       │
       ▼
Listing appears in public search
```

---

## 3. Data Flow: Intelligence Scoring

```
Client (pre-submission preview)
       │
       ▼
POST /functions/v1/intelligence
  { price, area_m2, city, property_kind, description }
       │
       ▼
Edge Function validates JWT
       │
       ▼
Query market_prices (Supabase)
Query verification_requests (seller verified?)
Query properties (duplicate check)
       │
       ▼
Compute:
  fair_price_estimate  = area × market_median (CMA)
  fraud_risk           = multi-signal point accumulation → Low/Medium/High
  investment_score     = weighted: 35% price, 25% growth, 20% liquidity, 20% condition
  price_position_pct   = % delta vs market median
       │
       ▼
Return IntelligenceResponse { ... } to client
(also stored in DB by trigger on property INSERT/UPDATE)
```

---

## 4. Trust Boundary Diagram

```
╔═══════════════════════════════════════════════════════════╗
║  UNTRUSTED ZONE (client browser)                          ║
║                                                           ║
║  · User input                                             ║
║  · Zod validation (advisory only — duplicated server-side)║
║  · Display logic                                          ║
║  · Intelligence preview (read-only, from Edge Function)   ║
╚═══════════════════════╦═══════════════════════════════════╝
                        ║ HTTPS + JWT
╔═══════════════════════╩═══════════════════════════════════╗
║  TRUST BOUNDARY (Supabase API + Edge Functions)           ║
║                                                           ║
║  · JWT validation on every request                        ║
║  · RLS on every table                                     ║
║  · Role checks in SECURITY DEFINER functions              ║
║  · Rate limiting enforced server-side                     ║
║  · Input re-validation in all RPCs                        ║
╚═══════════════════════╦═══════════════════════════════════╝
                        ║ Internal Postgres
╔═══════════════════════╩═══════════════════════════════════╗
║  TRUSTED ZONE (Postgres / Supabase Service Role)          ║
║                                                           ║
║  · compute_property_intelligence() trigger                ║
║  · enforce_protected_fields() trigger                     ║
║  · audit_events writes                                    ║
║  · Canonical ground truth for all scores                  ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 5. Component Inventory

| Layer | Component | Purpose |
|---|---|---|
| Frontend | `ErrorBoundary` | Catches runtime errors, shows recovery UI |
| Frontend | `RequireAuth` | Route guard, redirect to /auth |
| Frontend | `SellerLayout` | Isolated dark portal with Outlet |
| Frontend | `SellerAccessGate` | Soft gate with seller activation |
| Frontend | `useAuth` | Auth state, signOut |
| Frontend | `useUserRoles` | Role fetching + addRole RPC |
| Frontend | `useActiveRole` | Buyer/Seller mode toggle (localStorage) |
| Frontend | `useIntelligence` | Calls Edge Function for live scoring |
| Frontend | `listingSchema` | Zod validation for all listing inputs |
| Edge Fn | `intelligence/index.ts` | Server-side CMA + fraud + investment |
| DB | `compute_property_intelligence` | Auto-scores every property on write |
| DB | `enforce_protected_fields` | Prevents seller from writing trust fields |
| DB | `audit_property_changes` | Appends to audit_events on price/status change |
| DB | `create_listing` RPC | Rate-limited, validated listing creation |
| DB | `admin_review_listing` RPC | Admin approval/rejection of listings |
| DB | `admin_review_verification` RPC | Admin approval/rejection of KYC |
| DB | `grant_self_role` RPC | Rate-safe seller role self-grant |
| DB | `check_rate_limit` | Table-based rate limiting helper |
