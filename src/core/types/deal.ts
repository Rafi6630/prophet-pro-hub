// ─── AI Analysis — unified contract ───────────────────────────────────────────

export type AIDecision   = "BUY" | "HOLD" | "REJECT";
export type AIConfidence = "high" | "medium" | "low";

export interface AIAnalysis {
  // Core verdict
  score:      number;        // 0–100
  confidence: AIConfidence;
  decision:   AIDecision;

  // Structured reasoning
  reasons: string[];         // why this decision (3–5 bullets)
  risks:   string[];         // top risks (2–4 bullets)

  // Financial output
  suggested_price:  number;  // AI fair value in USD
  expected_profit:  number;  // estimated profit in USD over 3yr
  expected_roi_pct: number;  // % ROI over 3yr
  rental_yield:     number;  // gross yield %

  // Supporting narrative
  deal_thesis: string;       // 1 compelling sentence
  swot?: {
    strengths:     string[];
    weaknesses:    string[];
    opportunities: string[];
    threats:       string[];
  };

  // Metadata
  generated_at:  string;     // ISO timestamp
  model_version: string;     // e.g. "terra-v2"
}

// ─── Deal State Machine ────────────────────────────────────────────────────────

export type DealStatus =
  | "NEW"
  | "VIEWED"
  | "CONTACTED"
  | "OFFER_SENT"
  | "SAVED"
  | "REJECTED";

export interface Deal {
  id:          string;
  property_id: string;
  user_id:     string;
  status:      DealStatus;

  // Scores (from dealDiscovery scoreDeal)
  deal_score:        number;
  deal_grade:        "A+" | "A" | "B+" | "B" | "C" | "D";
  primary_deal_type: string;
  risk_level:        "Low" | "Medium" | "High" | "Very High";
  expected_roi:      number;
  discount_to_market: number;

  // AI analysis (stored as JSON column in Supabase)
  ai_analysis: AIAnalysis | null;

  // User notes
  notes: string | null;

  // Timestamps
  created_at:   string;
  updated_at:   string;
  viewed_at:    string | null;
  contacted_at: string | null;

  // Joined
  property?: import("./property").Property;
  actions?:  DealAction[];
}

export interface DealAction {
  id:          string;
  deal_id:     string;
  user_id:     string;
  from_status: DealStatus | null;
  to_status:   DealStatus;
  note:        string | null;
  created_at:  string;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface DealFilters {
  status?:    DealStatus[];
  decision?:  AIDecision[];
  minScore?:  number;
  riskLevel?: string[];
  city?:      string[];
  search?:    string;
}
