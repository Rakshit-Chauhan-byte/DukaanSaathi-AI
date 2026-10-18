import { DraftEntry, GenerateRequest } from "./types";

const STORAGE_KEY = "dukaansathi_drafts";
const MAX_DRAFTS = 20;

function isAvailable(): boolean {
  try {
    localStorage.setItem("__test__", "1");
    localStorage.removeItem("__test__");
    return true;
  } catch {
    return false;
  }
}

export function saveDraft(request: GenerateRequest, content: string): string {
  if (!isAvailable()) return "";
  const id = `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const entry: DraftEntry = { id, timestamp: Date.now(), request, content };
  const drafts = getDrafts();
  const updated = [entry, ...drafts].slice(0, MAX_DRAFTS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Storage full — silently ignore
  }
  return id;
}

export function getDrafts(): DraftEntry[] {
  if (!isAvailable()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function deleteDraft(id: string): void {
  if (!isAvailable()) return;
  const drafts = getDrafts().filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function clearDrafts(): void {
  if (!isAvailable()) return;
  localStorage.removeItem(STORAGE_KEY);
}
