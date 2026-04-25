export interface SavedSearch {
  id: string;
  name: string;
  cityId: string;
  minPrice: number;
  maxPrice: number;
  verifiedOnly: boolean;
  createdAt: string;
}

export interface SearchAlert {
  id: string;
  searchId: string;
  title: string;
  propertyId: string;
  createdAt: string;
}

const SAVED_SEARCHES_KEY = "iraqproperty_saved_searches";
const SEARCH_ALERTS_KEY = "iraqproperty_search_alerts";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getSavedSearches() {
  return readJson<SavedSearch[]>(SAVED_SEARCHES_KEY, []);
}

export function saveSearch(input: Omit<SavedSearch, "id" | "createdAt">) {
  const searches = getSavedSearches();
  const saved: SavedSearch = {
    ...input,
    id: `search-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const next = [saved, ...searches];
  writeJson(SAVED_SEARCHES_KEY, next);
  return saved;
}

export function getSearchAlerts() {
  return readJson<SearchAlert[]>(SEARCH_ALERTS_KEY, []);
}

export function saveAlerts(alerts: SearchAlert[]) {
  writeJson(SEARCH_ALERTS_KEY, alerts);
}

export function pushSearchAlert(alert: Omit<SearchAlert, "id" | "createdAt">) {
  const alerts = getSearchAlerts();
  const exists = alerts.some(
    (item) => item.searchId === alert.searchId && item.propertyId === alert.propertyId
  );
  if (exists) return alerts;

  const next = [
    {
      ...alert,
      id: `alert-${Date.now()}-${alert.propertyId}`,
      createdAt: new Date().toISOString(),
    },
    ...alerts,
  ];
  saveAlerts(next);
  return next;
}
