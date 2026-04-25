# TerraVista — Technical Blueprint

> **Version:** 1.0  
> **Last updated:** 2026-03-20

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Client (SPA)                    │
│  React 18 + Vite + TypeScript + Tailwind CSS    │
│  React Router v6 (role-based nested routes)     │
│  TanStack Query (server state)                  │
│  Framer Motion (animations)                     │
│  i18next (en / ar / ku)                         │
└────────────────────┬────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────┐
│              Lovable Cloud (Supabase)            │
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐ │
│  │ Auth     │  │ Postgres  │  │ Storage      │ │
│  │ (JWT)    │  │ + RLS     │  │ (images/docs)│ │
│  └──────────┘  └───────────┘  └──────────────┘ │
│  ┌──────────────────────────────────────────┐   │
│  │         Edge Functions (Deno)            │   │
│  │  • planner-analyze   • create-checkout   │   │
│  │  • planner-plans     • check-subscription│   │
│  │  • ai-property-analysis • create-offer   │   │
│  │  • customer-portal   • opportunity-ai    │   │
│  └──────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │  Lovable AI Gateway     │
        │  (Gemini / GPT models)  │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Stripe API             │
        │  (Billing & Checkout)   │
        └─────────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 with TypeScript |
| **Build** | Vite 5 + SWC |
| **Styling** | Tailwind CSS 3 + `tailwindcss-animate` + shadcn/ui |
| **Routing** | React Router v6 (nested, role-scoped) |
| **State** | TanStack Query v5 (server), React useState (local) |
| **Forms** | React Hook Form + Zod validation |
| **Animation** | Framer Motion |
| **Maps** | Leaflet + leaflet.markercluster |
| **Charts** | Recharts |
| **i18n** | i18next + react-i18next (EN, AR, KU) |
| **Export** | jsPDF + jspdf-autotable (PDF), xlsx (Excel) |
| **Backend** | Lovable Cloud (Supabase): Postgres, Auth, Edge Functions, Storage |
| **AI** | Lovable AI Gateway (google/gemini-2.5-pro, openai/gpt-5) |
| **Payments** | Stripe (Checkout, Customer Portal, Webhooks) |
| **Testing** | Vitest + Testing Library |

---

## 3. Project Structure

```
src/
├── assets/              # Static images
├── components/
│   ├── ui/              # shadcn/ui primitives (50+ components)
│   ├── guards/          # RequireAuth, RequireRole
│   ├── plan-results/    # Feasibility report tabs
│   ├── settings/        # RoleSwitcher, etc.
│   └── *.tsx            # Feature components
├── data/                # Mock data & support data
├── hooks/               # Custom hooks
│   ├── useAuth.tsx      # Auth state
│   ├── useUserRoles.ts  # Role fetching
│   ├── useSubscription.ts # Stripe tier state
│   ├── useProperties.ts # Property CRUD
│   ├── useOffers.ts     # Offer management
│   ├── useFavorites.ts  # Favorites toggle
│   ├── useLeads.ts      # CRM leads
│   ├── useMessages.ts   # Messaging
│   ├── useNotifications.ts # Notification bell
│   ├── useProfile.ts    # Profile CRUD
│   └── usePlanLimits.ts # Subscription gating
├── i18n/                # Translation files (en.json, ar.json, ku.json)
├── integrations/
│   └── supabase/        # Auto-generated client & types
├── pages/               # Route-level page components (30+ pages)
├── services/            # Business logic engines
│   ├── valuationEngine.ts
│   ├── investmentEngine.ts
│   ├── dealDiscovery.ts
│   └── dataMoat.ts
├── types/               # Shared TypeScript interfaces
└── test/                # Test setup & specs

supabase/
├── config.toml
├── functions/
│   ├── _shared/         # Shared utilities (auth, cors, usage)
│   ├── planner-analyze/ # AI feasibility analysis
│   ├── planner-plans/   # CRUD for project plans
│   ├── ai-property-analysis/
│   ├── create-checkout/
│   ├── check-subscription/
│   ├── customer-portal/
│   ├── create-offer/
│   └── opportunity-ai/
└── migrations/          # Database migrations (read-only)
```

---

## 4. Authentication & Authorization

### Flow
1. User signs up/in via `/auth` page → Supabase Auth (email + password)
2. `onAuthStateChange` listener sets user in `useAuth` hook
3. Default role `buyer` assigned via DB trigger on signup
4. `RequireAuth` guard redirects unauthenticated users to `/auth`
5. `RequireRole` guard checks `user_roles` table and redirects if role missing

### Security Model
- **RLS** enabled on all public tables
- **`has_role()`** — `SECURITY DEFINER` function bypasses RLS to check roles without recursion
- **`is_platform_admin()`** — checks `platform_admin_users` table
- **Edge functions** validate JWT via `requireUser()` shared helper
- **Usage tracking** via `consumeUsage()` to enforce rate limits

---

## 5. Database Schema (Key Relationships)

```
auth.users (managed by Supabase)
    │
    ├── profiles (1:1, user_id)
    ├── user_roles (1:N, user_id + role enum)
    ├── properties (1:N, user_id = owner)
    │       ├── property_images (1:N)
    │       ├── property_documents (1:N)
    │       ├── favorites (N:M via user_id)
    │       ├── offers (1:N, buyer_id + seller_id)
    │       └── leads (1:N, agent_id)
    ├── messages (sender_id / recipient_id)
    ├── notifications (user_id)
    ├── alerts (user_id)
    ├── project_plans (user_id, result: JSONB)
    ├── opportunities (user_id)
    │       └── development_phases (1:N)
    ├── seller_verifications (user_id)
    ├── subscriptions (user_id, stripe IDs)
    └── usage_logs (user_id)
```

---

## 6. Edge Functions

| Function | Method | Purpose | Auth | AI |
|----------|--------|---------|------|-----|
| `planner-analyze` | POST | Run AI feasibility analysis on land parcel | ✅ | ✅ (Gemini 2.5 Pro) |
| `planner-plans` | GET/PUT/DELETE | CRUD for saved project plans | ✅ | — |
| `ai-property-analysis` | POST | Deep AI analysis of a property | ✅ | ✅ |
| `create-checkout` | POST | Create Stripe Checkout session | ✅ | — |
| `check-subscription` | POST | Verify subscription status | ✅ | — |
| `customer-portal` | POST | Open Stripe billing portal | ✅ | — |
| `create-offer` | POST | Submit purchase offer with validation | ✅ | — |
| `opportunity-ai` | POST | AI analysis for development opportunities | ✅ | ✅ |

### Shared Utilities (`_shared/`)
- **`auth.ts`** — `requireUser(req)` extracts and validates JWT
- **`cors.ts`** — Standard CORS headers
- **`usage.ts`** — `consumeUsage(token, function_name, credits)` for rate limiting

---

## 7. State Management

| Concern | Solution |
|---------|----------|
| Server data (properties, offers, plans) | TanStack Query with `queryKey` conventions |
| Auth state | `useAuth()` hook with `onAuthStateChange` |
| User roles | `useUserRoles()` with 30s stale time |
| Subscription tier | `useSubscription()` with 60s polling |
| Form state | React Hook Form with Zod schemas |
| UI state (modals, tabs) | Local `useState` |
| Language | i18next with browser detection |

### Query Key Conventions
```typescript
["properties"]           // List
["properties", id]       // Single
["user-roles"]           // Current user roles
["favorites"]            // User favorites
["offers", propertyId]   // Offers for property
```

---

## 8. Routing Architecture

```
/                           → Landing (public)
/auth                       → Auth (public)
/reset-password             → ResetPassword (public)
/pricing                    → Pricing (public)
/property/:id               → PropertyDetail (authenticated)

/buyer/*                    → RequireAuth → RequireRole("buyer") → Layout
/seller/*                   → RequireAuth → RequireRole("seller") → Layout
/developer/*                → RequireAuth → RequireRole("developer") → Layout
/admin/*                    → RequireAuth → RequireRole("admin") → Layout

/settings                   → RequireAuth → Layout
/profile                    → RequireAuth → Layout
/support                    → RequireAuth → Layout
```

---

## 9. AI Integration Pattern

All AI calls follow a consistent pattern:

```
Client → Edge Function → Lovable AI Gateway → Model
                ↓
         Save result to DB
                ↓
         Return plan_id / result
```

1. Edge function authenticates user and checks usage quota
2. Builds structured prompt with user data
3. Calls `https://ai.gateway.lovable.dev/v1/chat/completions`
4. Parses JSON response (with fallback extraction for markdown fences)
5. Stores result in database
6. Returns reference ID to client

---

## 10. Subscription & Billing Flow

```
User clicks "Subscribe" → create-checkout edge function
    → Creates Stripe Checkout Session
    → Redirects user to Stripe
    → User completes payment
    → Stripe webhook updates subscriptions table
    → check-subscription validates on next poll (60s)
    → UI updates tier-gated features via PlanGate component
```

---

## 11. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Role-scoped route nesting (`/buyer/*`, `/seller/*`) | Clean separation of concerns, each role gets isolated navigation |
| JSONB for AI results (`project_plans.result`) | Flexible schema for evolving AI output without migrations |
| `SECURITY DEFINER` for role checks | Prevents RLS recursion when policies reference the `user_roles` table |
| Edge functions for all AI calls | Keeps API keys server-side, enables usage tracking, centralizes error handling |
| TanStack Query over Redux | Server-centric data doesn't need client-side normalization |
| Leaflet over Google Maps | Free, open-source, no API key required for basic tiles |
| shadcn/ui | Copy-paste components, full control, consistent with Tailwind |

---

## 12. Performance Optimizations

- **Lazy loading:** Map components loaded with `React.lazy()` + `Suspense`
- **Query caching:** 30s stale time for roles, 60s for subscriptions
- **Image optimization:** Property images served via Supabase Storage CDN
- **Code splitting:** Vite automatic chunk splitting per route
- **Service worker:** Basic offline caching for PWA shell

---

## 13. Deployment

- **Frontend:** Lovable managed deployment (Vite build → CDN)
- **Backend:** Lovable Cloud (auto-deployed edge functions)
- **Database:** Lovable Cloud Postgres with migrations
- **DNS:** Custom domain support via Lovable publishing

---

## 14. Future Considerations

- Real-time messaging via Supabase Realtime channels
- Push notifications (Web Push API)
- Advanced map layers (satellite, zoning overlays)
- Multi-tenant support for real estate agencies
- Mobile native apps (React Native sharing business logic)
