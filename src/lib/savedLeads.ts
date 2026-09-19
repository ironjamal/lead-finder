import { Business } from "./types";

const STORAGE_KEY = "lead-finder-saved-leads";

export function getSavedLeads(): Business[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLead(business: Business): Business[] {
  const current = getSavedLeads();
  if (current.some((b) => b.placeId === business.placeId)) {
    return current;
  }
  const updated = [...current, business];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function removeLead(placeId: string): Business[] {
  const updated = getSavedLeads().filter((b) => b.placeId !== placeId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function isLeadSaved(placeId: string, savedLeads: Business[]): boolean {
  return savedLeads.some((b) => b.placeId === placeId);
}
