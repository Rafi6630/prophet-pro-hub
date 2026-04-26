# TRANSACTION LIFECYCLE

**Project:** IraqProperty  
**Date:** 2026-04-27  

---

## 1. State Machine

```
LISTING PUBLISHED
       │
       ▼
  offer_created ──────────────────────────► cancelled
       │
       ▼ (seller accepts)
  offer_accepted
       │
       ▼ (system or admin generates)
  contract_generated
       │
       ▼ (buyer initiates payment)
  payment_pending
       │
       ▼ (bank/escrow confirms)
  payment_verified
       │
       ▼ (legal transfer)
  ownership_transfer
       │
       ▼
     closed
```

---

## 2. Database Schema

```sql
CREATE TYPE public.transaction_status AS ENUM (
  'offer_created',
  'offer_accepted',
  'contract_generated',
  'payment_pending',
  'payment_verified',
  'ownership_transfer',
  'closed',
  'cancelled'
);

CREATE TABLE public.transactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   uuid NOT NULL REFERENCES public.properties(id) ON DELETE RESTRICT,
  offer_id      uuid REFERENCES public.offers(id) ON DELETE SET NULL,
  buyer_id      uuid NOT NULL,
  seller_id     uuid NOT NULL,
  status        transaction_status NOT NULL DEFAULT 'offer_created',
  agreed_price  numeric NOT NULL CHECK (agreed_price > 0),
  currency      text NOT NULL DEFAULT 'USD',
  contract_url  text,       -- Supabase Storage path
  notes         text,
  closed_at     timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
```

### RLS Policies

| Policy | Condition |
|---|---|
| Buyer reads own | `auth.uid() = buyer_id` |
| Seller reads own | `auth.uid() = seller_id` |
| Buyer creates | `auth.uid() = buyer_id` |
| Participants update | `auth.uid() IN (buyer_id, seller_id)` |
| Admin manages all | `has_role(auth.uid(), 'admin')` |

---

## 3. Offer Engine

### Offer Validation Rules (Zod + DB)

| Rule | Enforcement |
|---|---|
| `offer_price >= 1000` | `offerSchema` + DB trigger (future) |
| `offer_price <= 100,000,000` | `offerSchema` |
| Currency must be USD or IQD | `offerSchema` enum |
| Message max 1000 chars | `offerSchema` |
| One active offer per buyer per property | DB unique constraint (future) |

### Offer Status Transitions

```
pending ──► accepted  (seller action)
        ──► rejected  (seller action)
        ──► countered (seller action → new offer)
        ──► withdrawn (buyer action)
```

### Transition to Transaction

When an offer is `accepted`, the system should (next implementation step):
1. Create a `transactions` row with `status = 'offer_accepted'`, `agreed_price = offer.offer_price`
2. Update the property `status = 'sold'` or `status = 'draft'` (under review)
3. Emit audit event `offer_accepted`

---

## 4. Contract Engine (Planned)

### Generation Flow

```
transaction.status = 'offer_accepted'
       │
       ▼
Edge Function: generate-contract
  · Fill contract template (bilingual AR/EN)
  · Stamp with transaction_id, timestamp, buyer/seller names
  · Sign with server key (HMAC-SHA256)
  · Upload to supabase/storage/contracts/{transaction_id}/contract.pdf
  · SET transactions.contract_url = storage_path
  · SET transactions.status = 'contract_generated'
  · Notify both parties (email/SMS via Edge Function)
```

### Contract Contents (Minimum)

- Property description (title, city, area, kind)
- Agreed price + currency
- Buyer identity (name, national_id)
- Seller identity (name, national_id)
- Transaction ID and timestamp
- Terms & conditions (bilingual)
- Signature fields (digital: user_id + timestamp hash)

---

## 5. Payment Validation (Escrow Model)

**Not implemented as direct payment.** IraqProperty acts as an escrow facilitator:

```
Buyer → Bank Transfer → IraqProperty Escrow Account
  │
  ▼ (bank confirms)
transactions.status = 'payment_pending'
  │
  ▼ (admin verifies receipt)
transactions.status = 'payment_verified'
  │
  ▼ (legal transfer complete)
transactions.status = 'ownership_transfer'
  │
  ▼ (all docs signed)
transactions.status = 'closed'
property.status     = 'sold'
```

### Payment Providers (Future Integration)

| Provider | Market | Status |
|---|---|---|
| Iraqi Payments Consortium | Iraq | Planned |
| Wise / SWIFT | International | Planned |
| Cryptocurrency (USDT) | Alternative | Under review |

---

## 6. Lifecycle Coverage by Role

| Event | Buyer | Seller | Admin |
|---|---|---|---|
| Create offer | ✓ | View | View |
| Accept/reject offer | View | ✓ | View |
| Generate contract | — | — | ✓ |
| Confirm payment | ✓ | View | ✓ |
| Mark transfer | — | — | ✓ |
| Close transaction | — | — | ✓ |
| View audit trail | — | — | ✓ |
