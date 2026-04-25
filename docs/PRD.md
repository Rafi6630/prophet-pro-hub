# TerraVista — Product Requirements Document

> **Version:** 1.0  
> **Last updated:** 2026-03-20  
> **Status:** Living document

---

## 1. Overview

**TerraVista** is an AI-powered real estate platform for the Iraqi / Kurdistan Region market. It connects **buyers**, **sellers**, **developers**, and **administrators** through a unified web application with role-based dashboards, AI-driven property valuations, and a developer feasibility planning engine.

---

## 2. Problem Statement

The Iraqi real estate market lacks a centralized, data-driven platform for property discovery, valuation, and development planning. Buyers have no reliable way to compare listings, sellers lack analytics, and developers perform feasibility studies manually. TerraVista addresses all three by combining marketplace functionality with AI analysis tools.

---

## 3. Target Users & Roles

| Role | Description |
|------|-------------|
| **Buyer** | Individuals searching for properties to purchase or rent. Need discovery, comparison, and investment analysis tools. |
| **Seller** | Property owners and agents listing properties. Need listing management, offer handling, analytics, and verification. |
| **Developer** | Real estate developers planning projects on land parcels. Need AI feasibility analysis, project planning, and portfolio management. |
| **Admin** | Platform administrators managing users, verifications, support tickets, and platform settings. |

Roles are stored in the `user_roles` table (enum: `buyer | seller | admin | developer`) and enforced via RLS policies and `RequireRole` guards.

---

## 4. Core Features

### 4.1 Authentication & Authorization
- Email/password signup and login via Supabase Auth
- Password reset flow
- Role-based access control (RBAC) with `has_role()` security-definer function
- Route guards: `RequireAuth`, `RequireRole`
- Profile management (display name, avatar, phone, bio)

### 4.2 Buyer Features
| Feature | Route | Description |
|---------|-------|-------------|
| Dashboard | `/buyer/` | Overview of activity, saved searches, recent alerts |
| Marketplace | `/buyer/discover` | Browse & search properties with filters (city, price, type, bedrooms) |
| Property Detail | `/property/:id` | Full listing view with images, map, AI valuation, TerraScore |
| Compare Listings | `/buyer/compare` | Side-by-side property comparison |
| Favorites | `/buyer/favorites` | Saved properties list |
| Offers | `/buyer/offers` | Submit and track purchase offers |
| Alerts | `/buyer/alerts` | Custom price/location alerts |
| AI Valuation | `/buyer/valuation` | On-demand AI property valuation |
| Property Analysis | `/buyer/analysis/:id` | Deep AI analysis of a specific property |
| Market Intelligence | `/buyer/market-intelligence` | Market trends and analytics |
| Investor Tools | `/buyer/investor` | ROI calculators, portfolio tracking, investment scoring |
| Syndication Deals | `/buyer/syndication` | Group investment opportunities |
| Messaging | `/buyer/messages` | Direct messaging with sellers |

### 4.3 Seller Features
| Feature | Route | Description |
|---------|-------|-------------|
| Dashboard | `/seller/` | Listing performance overview |
| Listings | `/seller/listings` | Manage active property listings |
| Create Listing | `/seller/create` | Multi-step property creation form |
| Offers | `/seller/offers` | Review, accept, counter, or reject buyer offers |
| CRM | `/seller/crm` | Lead management and tracking |
| Analytics | `/seller/analytics` | Views, engagement, and performance metrics |
| AI Assistant | `/seller/ai-assistant` | AI-powered listing optimization suggestions |
| Verification | `/seller/verification` | Document upload for seller identity verification |

### 4.4 Developer Features
| Feature | Route | Description |
|---------|-------|-------------|
| Dashboard | `/developer/` | Project overview and key metrics |
| Land Analysis | `/developer/analyze` | 5-step wizard: Location → Details → Constraints → Context → Review |
| Plan Results | `/developer/plan/:id` | AI feasibility report with tabs: Land Use, Design, Pricing, Marketing, Feasibility |
| My Plans | `/developer/plans` | Saved project plans list |
| Opportunities | `/developer/opportunities` | Browse and create development opportunities |
| Opportunity Workspace | `/developer/opportunities/:id` | Project workspace with phases |
| Portfolio Insights | `/developer/portfolio` | Cross-project analytics |

### 4.5 Admin Features
| Feature | Route | Description |
|---------|-------|-------------|
| Dashboard | `/admin/` | Platform-wide stats and management |
| Verification Review | `/admin/verifications` | Review seller verification submissions |
| Support | `/admin/support` | Handle support tickets |

### 4.6 Shared / Cross-Role Features
- **AI Valuation Widget** — reusable property valuation component
- **TerraScore** — proprietary property quality score (0–100)
- **Investment Score** — AI-generated investment rating
- **Notifications** — real-time notification bell with unread count
- **Messaging** — conversation-based messaging system
- **Settings** — theme, language, role switching
- **Pricing / Subscriptions** — Free, Pro ($29/mo), Elite ($79/mo) tiers via Stripe
- **PWA Support** — installable with service worker and manifest
- **i18n** — English, Arabic, Kurdish language support

---

## 5. AI Capabilities

### 5.1 Property Valuation Engine
- Comparative market analysis
- Location-based scoring
- Confidence levels (high / medium / low)
- Powered by Lovable AI gateway (Gemini / GPT models)

### 5.2 Developer Feasibility Analysis
- Generates comprehensive JSON report via `planner-analyze` edge function
- Sections: Land Use, Design, Pricing, Marketing, Feasibility
- Includes SWOT analysis, risk assessment, exit strategies, 5/10-year forecasting
- Supports manual price overrides after generation
- Export to PDF and Excel

### 5.3 Property AI Analysis
- Deep analysis of individual properties via `ai-property-analysis` edge function
- Investment recommendations and market positioning

---

## 6. Subscription Tiers

| Tier | Monthly | Yearly | Key Limits |
|------|---------|--------|------------|
| **Free** | $0 | $0 | 5 favorites, 3 offers/month, basic search |
| **Pro** | $29 | $243.60 (30% off) | Unlimited favorites & offers, analytics, CRM, priority alerts |
| **Elite** | $79 | $474 (50% off) | Everything in Pro + investor tools, deposit verification, proof-of-funds, dedicated support |

Managed via Stripe Checkout and Customer Portal edge functions.

---

## 7. Data Model (Key Tables)

| Table | Purpose |
|-------|---------|
| `profiles` | User display info (name, avatar, phone, bio) |
| `user_roles` | RBAC roles per user |
| `properties` | Property listings with pricing, location, AI scores |
| `property_images` | Image storage references |
| `property_documents` | Uploaded documents (title deeds, etc.) |
| `favorites` | User saved properties |
| `offers` | Purchase offers with status workflow |
| `messages` | Conversation-based messaging |
| `notifications` | In-app notification system |
| `alerts` | Custom property alert rules |
| `leads` | Seller CRM leads |
| `project_plans` | Developer feasibility plans (AI results stored as JSON) |
| `opportunities` | Development opportunity listings |
| `development_phases` | Project phase tracking |
| `seller_verifications` | Verification document submissions |
| `subscriptions` | Stripe subscription state |
| `usage_logs` | API usage tracking for rate limiting |

---

## 8. Non-Functional Requirements

- **Performance:** < 3s initial load, lazy-loaded routes and map components
- **Security:** RLS on all tables, `security definer` functions for role checks, no client-side role trust
- **Responsiveness:** Mobile-first design with dedicated `MobileNav` component
- **Accessibility:** Semantic HTML, ARIA labels on interactive elements
- **Localization:** RTL support for Arabic/Kurdish, i18next with namespace loading
- **Offline:** Service worker for basic offline caching (PWA)

---

## 9. Integrations

| Service | Purpose |
|---------|---------|
| **Lovable Cloud (Supabase)** | Database, Auth, Edge Functions, Storage |
| **Lovable AI Gateway** | Property analysis, feasibility reports |
| **Stripe** | Subscription billing, checkout, customer portal |
| **Leaflet** | Interactive maps with marker clustering |

---

## 10. Success Metrics

- Monthly active users by role
- Properties listed vs. offers made ratio
- AI analysis completion rate
- Subscription conversion (Free → Pro → Elite)
- Average TerraScore accuracy vs. market prices
