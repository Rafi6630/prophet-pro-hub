# AI MODEL DESIGN

**Project:** IraqProperty  
**Date:** 2026-04-27  

---

## 1. Current vs. Target Intelligence Architecture

| Engine | Before | After (Implemented) | Future (ML) |
|---|---|---|---|
| Fair Price | Client-side formula: `area × avg × condition` | Server-side CMA using `market_prices` table | Linear regression on historical transactions |
| Fraud Risk | 4 boolean signals, client-side | 7 multi-signal point accumulation, server-side trigger | Gradient boosting on 20+ signals |
| Investment Score | 4-input weighted formula, client-side | 4-factor server-side with market data | Time-series ROI model |
| Area Growth | Static hardcoded values | `market_prices.yoy_change_pct` (updated by admins) | Econometric growth model |

---

## 2. Fair Price Engine: Comparable Market Analysis (CMA)

### Current Implementation

```
fair_price = area_m2 × market_median_per_m2

Where:
  market_median_per_m2 = market_prices.median_price_m2
                         for (city, property_kind)
                         ORDER BY snapshot_date DESC
                         LIMIT 1

Fallback: 1200 USD/m² (global average if no market data)
```

### Demand Pressure Adjustment (Edge Function)

```typescript
// If listing is below market median, fair value is slightly above base
// (demand pressure from underpriced listings)
const demandPressure = pricePerM2 < marketAvg
  ? 1 + (marketAvg - pricePerM2) / marketAvg * 0.05
  : 1.0;

fairPrice = Math.round(area_m2 × marketAvg × demandPressure);
```

### Future: Hedonic Regression Model

Features to include:
- Property type (apartment vs. villa)
- Location (city, district, GPS)
- Size (area_m2)
- Bedrooms, bathrooms
- Age of building (future field)
- Floor level (future field)
- Amenities (pool, garage, garden)
- Market trend (YoY change)
- Days on market (once we have transaction history)

Training data: all `closed` transactions in `transactions` table.

Target: price residuals vs. naive model → correction factor per district.

---

## 3. Fraud Risk Engine: Multi-Signal Scoring

### Current Implementation (7 Signals)

| Signal | Points | Data Source |
|---|---|---|
| Description < 20 chars | +15 | `properties.description` |
| Seller unverified | +20 | `verification_requests.status` |
| Price < 50% of market | +25 | `market_prices.median_price_m2` |
| Price > 300% of market | +20 | `market_prices.median_price_m2` |
| Legal status missing | +15 | `properties.legal_status` |
| Legal dispute | +40 | `properties.legal_status = 'disputed'` |
| Near-duplicate listing | +20 | `properties` table (same seller, city, kind, ±10% area) |

Score → Level: 0–24 = Low, 25–54 = Medium, 55+ = High

### Future: Gradient Boosting Classifier

Additional signals to collect:
- Time since account creation (new accounts = higher risk)
- Price change history (delta % per update)
- Seller response rate (leads/messages)
- Image reverse-search (stock photo usage)
- Description similarity to known scam templates (NLP)
- IP geolocation anomaly (listing in Baghdad, IP in Russia)
- Phone number validation (format + carrier)

Output: probability 0.0–1.0 (fraud probability) + top 3 signal explanations.

---

## 4. Investment Score Engine

### Current Implementation (4 Factors)

```
score = pricing_score × 0.35
      + growth_score  × 0.25
      + liquidity     × 0.20
      + condition     × 0.20

pricing_score  = f(price_per_m2 vs. market_median)   → 0–100
growth_score   = f(market_prices.yoy_change_pct)      → 0–100
liquidity      = 50 (default, no data yet)
condition      = 50 (default, no data yet)
```

### Future: ROI Estimation Model

```
estimated_rental_yield = f(city, kind, area_m2, district)  [regression]
capital_appreciation   = f(city_growth_trend, 5yr forecast) [time-series]
entry_discount         = (market_median - asking_price) / market_median
liquidity_score        = f(avg_days_on_market, transaction_volume) [classification]
risk_premium           = f(fraud_risk_score, city_safety_score) [composite]

investment_score = weighted_combination(
  rental_yield        × 0.25,
  capital_appreciation × 0.30,
  entry_discount      × 0.20,
  liquidity_score     × 0.15,
  (100 - risk_premium) × 0.10
)
```

---

## 5. ML Pipeline (Future)

```
/ml_pipeline/
├── data_collection/
│   └── export_transactions.sql     -- Extract closed deals from Supabase
├── data_cleaning/
│   └── clean_properties.py         -- Normalize prices, remove outliers
├── model_training/
│   ├── fair_price_model.ipynb      -- Hedonic regression (sklearn)
│   ├── fraud_model.ipynb           -- XGBoost classifier
│   └── investment_model.ipynb      -- Multi-factor regression
├── model_validation/
│   └── backtesting.py              -- Holdout set evaluation
└── model_deployment/
    └── export_coefficients.py      -- Export as JSON for Edge Function
```

### Deployment Pattern

Models are NOT deployed as running Python services. Instead:
1. Train model in Python (scikit-learn / XGBoost)
2. Export coefficients/weights as JSON
3. Store in Supabase Storage or Edge Function environment variable
4. Edge Function loads JSON at startup, applies inference in TypeScript

This avoids cold-start latency and infrastructure complexity.

---

## 6. Training Data Requirements

| Model | Required Records | Current Estimate |
|---|---|---|
| Fair Price | 500+ closed transactions | ~50 (early stage) |
| Fraud Risk | 200+ reviewed listings with known outcomes | ~30 |
| Investment Score | 100+ properties with 12-month return data | 0 (needs time) |

**Recommendation:** Reach 500 real transactions before training supervised models. Until then, use enhanced rule-based models (current implementation) and collect labels for supervised training.

---

## 7. Explainability Requirements

Every score shown to users MUST be explainable:

| Score | Explanation Shown |
|---|---|
| `fraud_risk: high` | List of triggered signals (from `fraud_signals` array in Edge Function response) |
| `investment_score: 72` | Breakdown: Price advantage 85/100, Growth 60/100, Liquidity 50/100, Condition 50/100 |
| `fair_price_estimate` | "Based on {N} comparable {kind}s in {city}, median {price}/m²" |

This is displayed in the CreateListing live preview panel and in PropertyDetail.
