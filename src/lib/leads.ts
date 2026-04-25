export type LeadAction = "call" | "whatsapp" | "offer" | "save";

export interface LeadEventPayload {
  listingId: string;
  sellerId?: string;
  city?: string;
  source?: string;
  timestamp?: string;
}

function pushLeadEvent(action: LeadAction, payload: LeadEventPayload) {
  const event = {
    action,
    ...payload,
    timestamp: payload.timestamp ?? new Date().toISOString(),
  };

  if (typeof window === "undefined") {
    return event;
  }

  const storageKey = "iraqproperty_leads";
  const previous = window.localStorage.getItem(storageKey);
  const events = previous ? (JSON.parse(previous) as typeof event[]) : [];
  events.push(event);
  window.localStorage.setItem(storageKey, JSON.stringify(events));

  window.dispatchEvent(new CustomEvent("iraqproperty:lead", { detail: event }));
  return event;
}

export function trackCallLead(payload: LeadEventPayload) {
  return pushLeadEvent("call", payload);
}

export function trackWhatsAppLead(payload: LeadEventPayload) {
  return pushLeadEvent("whatsapp", payload);
}

export function trackOfferLead(payload: LeadEventPayload) {
  return pushLeadEvent("offer", payload);
}

export function trackSaveLead(payload: LeadEventPayload) {
  return pushLeadEvent("save", payload);
}
