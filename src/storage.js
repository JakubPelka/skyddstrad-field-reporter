import { APP_CONFIG } from "./config.js";

export function loadDrafts() {
  const raw = localStorage.getItem(APP_CONFIG.storageKey);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Could not parse stored drafts.", error);
    return [];
  }
}

export function saveDrafts(drafts) {
  localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(drafts));
}

export function addDraft(draft) {
  const drafts = loadDrafts();
  drafts.push(draft);
  saveDrafts(drafts);
  return drafts;
}

export function deleteDraft(id) {
  const drafts = loadDrafts().filter((draft) => draft.id !== id);
  saveDrafts(drafts);
  return drafts;
}

export function clearDrafts() {
  localStorage.removeItem(APP_CONFIG.storageKey);
}
