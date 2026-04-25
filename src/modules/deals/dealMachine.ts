import type { DealStatus } from "@/core/types/deal";

// ── Valid transitions ─────────────────────────────────────────────────────────

const TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  NEW:        ["VIEWED",    "SAVED",      "REJECTED"],
  VIEWED:     ["CONTACTED", "SAVED",      "REJECTED"],
  CONTACTED:  ["OFFER_SENT","SAVED",      "REJECTED"],
  OFFER_SENT: ["SAVED",     "REJECTED"],
  SAVED:      ["CONTACTED", "OFFER_SENT", "REJECTED"],
  REJECTED:   [],
};

// ── State metadata ────────────────────────────────────────────────────────────

export interface StateConfig {
  labelKey:   string;   // i18n key
  descKey:    string;   // short description i18n key
  color:      string;   // Tailwind colour class
  step:       number;   // 0-based position in the stepper (-1 = terminal)
  isTerminal: boolean;
}

export const DEAL_STATE_CONFIG: Record<DealStatus, StateConfig> = {
  NEW:        { labelKey: "deals.statusNew",       descKey: "deals.statusNewDesc",       color: "text-muted-foreground", step: 0, isTerminal: false },
  VIEWED:     { labelKey: "deals.statusViewed",    descKey: "deals.statusViewedDesc",    color: "text-info",             step: 1, isTerminal: false },
  CONTACTED:  { labelKey: "deals.statusContacted", descKey: "deals.statusContactedDesc", color: "text-primary",          step: 2, isTerminal: false },
  OFFER_SENT: { labelKey: "deals.statusOfferSent", descKey: "deals.statusOfferSentDesc", color: "text-warning",          step: 3, isTerminal: false },
  SAVED:      { labelKey: "deals.statusSaved",     descKey: "deals.statusSavedDesc",     color: "text-success",          step: 4, isTerminal: false },
  REJECTED:   { labelKey: "deals.statusRejected",  descKey: "deals.statusRejectedDesc",  color: "text-destructive",      step: -1, isTerminal: true  },
};

// ── Pure machine helpers ──────────────────────────────────────────────────────

export function canTransition(from: DealStatus, to: DealStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function getAvailableTransitions(from: DealStatus): DealStatus[] {
  return TRANSITIONS[from];
}

export function isTerminal(status: DealStatus): boolean {
  return DEAL_STATE_CONFIG[status].isTerminal;
}

// Ordered non-terminal states for the stepper UI
export const STEPPER_STATES: DealStatus[] = [
  "NEW", "VIEWED", "CONTACTED", "OFFER_SENT", "SAVED",
];
