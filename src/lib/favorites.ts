const FAVORITES_KEY = "iraqproperty_favorites";

export function getFavoriteIds() {
  if (typeof window === "undefined") return [] as string[];
  const raw = window.localStorage.getItem(FAVORITES_KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

export function isFavorite(propertyId: string) {
  return getFavoriteIds().includes(propertyId);
}

export function toggleFavorite(propertyId: string) {
  const favorites = getFavoriteIds();
  const next = favorites.includes(propertyId)
    ? favorites.filter((id) => id !== propertyId)
    : [propertyId, ...favorites];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }
  return next;
}
