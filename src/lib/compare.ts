const STORAGE_KEY = "iraqproperty-compare";
const MAX_COMPARE = 4;

export function getCompareIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function setCompareIds(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_COMPARE)));
}

export function toggleCompareId(id: string) {
  const current = getCompareIds();
  if (current.includes(id)) {
    const next = current.filter((item) => item !== id);
    setCompareIds(next);
    return { active: false, ids: next };
  }

  const next = [id, ...current].slice(0, MAX_COMPARE);
  setCompareIds(next);
  return { active: true, ids: next };
}

export function isCompared(id: string) {
  return getCompareIds().includes(id);
}
