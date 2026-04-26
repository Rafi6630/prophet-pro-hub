# SECURITY HARDENING REPORT

**Project:** IraqProperty  
**Date:** 2026-04-27  

---

## 1. Database Security

### Row Level Security Audit

| Table | RLS Enabled | Policies | Status |
|---|---|---|---|
| `profiles` | ✓ | public read, owner insert/update | ✓ |
| `user_roles` | ✓ | owner read, admin read, admin manage | ✓ |
| `properties` | ✓ | active/owner/admin read, owner insert/update/delete, admin all | ✓ |
| `property_images` | ✓ | public read, owner insert/delete | ✓ |
| `favorites` | ✓ | owner CRUD | ✓ |
| `offers` | ✓ | buyer/seller read, buyer insert/update, seller update | ✓ |
| `messages` | ✓ | participants read, sender insert, recipient update | ✓ |
| `alerts` | ✓ | owner all | ✓ |
| `inspection_requests` | ✓ | buyer/seller scoped | ✓ |
| `verification_requests` | ✓ | owner read/insert, admin read/update | ✓ |
| `market_prices` | ✓ | public read, admin manage | ✓ |
| `transactions` | ✓ | buyer/seller/admin scoped | ✓ NEW |
| `audit_events` | ✓ | authenticated insert, admin read, NO UPDATE/DELETE | ✓ NEW |
| `rate_limit_buckets` | ✓ | service-role only (via SECURITY DEFINER) | ✓ NEW |

### Protected Column Enforcement

The following columns on `properties` can only be set by server-side triggers or admin RPCs:

| Column | Protected By |
|---|---|
| `fraud_risk` | `compute_property_intelligence` trigger (overwrites on every write) |
| `investment_score` | `compute_property_intelligence` trigger |
| `fair_price_estimate` | `compute_property_intelligence` trigger |
| `property_hash` | `compute_property_intelligence` trigger |
| `duplicate_flag` | `compute_property_intelligence` trigger |
| `verification_level` | `enforce_protected_fields` trigger (non-admin reset) |
| `ownership_reviewed` | `enforce_protected_fields` trigger |
| `review_status` | `enforce_protected_fields` trigger (sellers: draft/pending_review only) |

---

## 2. Input Validation Layers

```
Layer 1 (Client): Zod schema (advisory — UX only)
Layer 2 (RPC):    Input validation in SECURITY DEFINER Postgres functions
Layer 3 (DB):     CHECK constraints on price, area_m2, investment_score
Layer 4 (Trigger): compute_property_intelligence overwrites computed fields
```

Never rely on a single layer. Compromise of the client bypasses Layer 1. All critical validation is duplicated in Layers 2–4.

---

## 3. Rate Limiting

| Action | Limit | Window | Enforcement |
|---|---|---|---|
| Listing creation | 10 | per hour | `check_rate_limit` in `create_listing` RPC |
| Verification submission | 3 | per day | Manual (add to RPC, future) |
| Auth (login attempts) | 10 | per 5 min | Supabase Auth built-in |
| API (Supabase) | 10 req/sec | per user | Supabase project settings |

`rate_limit_buckets` table uses `UPSERT` with `ON CONFLICT` for atomic counter increment. Old buckets cleaned by `purge_old_rate_limit_buckets()` (run via pg_cron or scheduled job).

---

## 4. Secrets Management

| Secret | Location | Exposure Risk |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env` + CI secret | LOW — public URL, safe in client |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env` + CI secret | LOW — anon key, gated by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (Edge Functions env) | NEVER in client code |
| `SUPABASE_DB_URL` | CI secret (GitHub Actions) | NEVER committed |
| `SUPABASE_ACCESS_TOKEN` | CI secret | NEVER committed |
| `VERCEL_TOKEN` | CI secret | NEVER committed |

**Rules:**
- The `service_role` key MUST never appear in `src/` or any frontend code.
- `.env` files must be in `.gitignore`. Verify with `git check-ignore -v .env`.
- Rotate all keys every 90 days via Supabase Dashboard.

---

## 5. Authentication Security

| Feature | Status | Notes |
|---|---|---|
| JWT validation on every request | ✓ | Supabase built-in |
| Session persistence (localStorage) | ✓ | Acceptable for anon key |
| Token auto-refresh | ✓ | `autoRefreshToken: true` in client config |
| Auth race condition fix | ✓ | `mounted` guard + priority merge in `useAuth` |
| Admin MFA | Recommended | Enable in Supabase Auth settings |
| Password policy | Recommended | Min 12 chars, require mix via Supabase settings |
| Email verification required | Recommended | Enable in Supabase Auth settings |

---

## 6. Transport Security

| Control | Status |
|---|---|
| HTTPS enforced | ✓ (Vercel + Supabase both enforce HTTPS) |
| CSP headers | Needs configuration in `vercel.json` |
| HSTS | ✓ (Vercel default) |
| Image URL validation (https only) | ✓ (Zod imageUrlSchema) |
| Document URL validation (https only) | ✓ (Zod verificationSchema) |

### Recommended `vercel.json` CSP addition

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co; img-src 'self' https: data:; style-src 'self' 'unsafe-inline';"
        },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## 7. Admin Role Protection

| Control | Implementation |
|---|---|
| `grant_self_role` blocks `admin` self-assignment | SQL: `IF _role = 'admin' THEN RAISE EXCEPTION` |
| All admin RPCs check `has_role(auth.uid(), 'admin')` | `admin_review_listing`, `admin_review_verification` |
| Admin panel routes protected by `RequireAuth` | Needs `RequireAdmin` guard (future) |
| Audit trail for admin actions | `audit_events` with `admin_action` event type |

---

## 8. Open Security Items

| Item | Priority | Effort |
|---|---|---|
| Add `RequireAdmin` guard for `/admin/*` routes | CRITICAL | 1 hour |
| Add CSP headers to `vercel.json` | HIGH | 30 min |
| Enable Supabase email verification requirement | HIGH | 10 min (config) |
| Add `pg_cron` for rate limit bucket cleanup | MEDIUM | 1 hour |
| Implement brute-force protection on verification submit | MEDIUM | 2 hours |
| Audit Supabase Storage bucket policies | HIGH | 2 hours |
| Add OWASP dependency scan to CI pipeline | MEDIUM | 2 hours |
| Replace URL text input with Supabase Storage upload | HIGH | 1 day |
