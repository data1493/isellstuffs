/**
 * Hunt board — taped scraps of what people are looking for.
 * Never write listing ids, `iss:cart-listing-ids`, `iss:saved-listing-ids`,
 * or watched-stall keys. Not a listing. Not `/saved`. Not `/watched`.
 *
 * Shape: `{ id, note, at }` scraps.
 * localStorage key `iss:wanted-hunts` is the client cork.
 * Cookie `iss-wanted-hunts` is the same JSON so `/wanted` can SSR it.
 */
export const WANTED_STORAGE_KEY = "iss:wanted-hunts";
export const WANTED_COOKIE_NAME = "iss-wanted-hunts";
export const WANTED_CHANGED_EVENT = "iss:wanted-changed";

export const WANTED_NOTE_MAX = 140;
export const WANTED_BOARD_MAX = 20;

export type Hunt = {
  id: string;
  note: string;
  at: string;
};

export type TapeHuntResult =
  | { ok: true; hunt: Hunt; hunts: Hunt[] }
  | { ok: false; reason: "empty"; hunts: Hunt[] };

function canUseStorage() {
  return typeof window !== "undefined";
}

export function normalizeHuntNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, WANTED_NOTE_MAX);
}

function isHunt(value: unknown): value is Hunt {
  if (!value || typeof value !== "object") {
    return false;
  }
  const hunt = value as Hunt;
  return (
    typeof hunt.id === "string" &&
    hunt.id.length > 0 &&
    typeof hunt.note === "string" &&
    hunt.note.length > 0 &&
    typeof hunt.at === "string"
  );
}

export function parseWantedHunts(raw: string | null | undefined): Hunt[] {
  if (!raw) {
    return [];
  }
  try {
    let value = raw;
    try {
      value = decodeURIComponent(raw);
    } catch {
      value = raw;
    }
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isHunt);
  } catch {
    return [];
  }
}

export function serializeWantedHunts(hunts: Hunt[]) {
  return JSON.stringify(hunts);
}

export function createHuntId(at = new Date()) {
  const stamp = at.getTime().toString(36);
  const salt = Math.random().toString(36).slice(2, 6);
  return `hunt-${stamp}${salt}`;
}

export function createHunt(note: string, at = new Date()): Hunt {
  return {
    id: createHuntId(at),
    note,
    at: at.toISOString(),
  };
}

export function tapeHunt(existing: Hunt[], raw: string): TapeHuntResult {
  const note = normalizeHuntNote(raw);
  if (!note) {
    return { ok: false, reason: "empty", hunts: existing };
  }

  const hunt = createHunt(note);
  return {
    ok: true,
    hunt,
    hunts: [hunt, ...existing].slice(0, WANTED_BOARD_MAX),
  };
}

export function peelHunt(existing: Hunt[], huntId: string): Hunt[] {
  if (!huntId) {
    return existing;
  }
  return existing.filter((hunt) => hunt.id !== huntId);
}

export function mergeWantedHunts(existing: Hunt[], incoming: Hunt[]): Hunt[] {
  const byId = new Map<string, Hunt>();
  for (const hunt of incoming) {
    byId.set(hunt.id, hunt);
  }
  for (const hunt of existing) {
    if (!byId.has(hunt.id)) {
      byId.set(hunt.id, hunt);
    }
  }
  return [...byId.values()]
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
    .slice(0, WANTED_BOARD_MAX);
}

export function readWantedHunts(): Hunt[] {
  if (!canUseStorage()) {
    return [];
  }
  try {
    const fromStorage = parseWantedHunts(
      window.localStorage.getItem(WANTED_STORAGE_KEY),
    );
    if (fromStorage.length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return [];
}

export function writeWantedHunts(hunts: Hunt[]) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeWantedHunts(hunts);
  try {
    window.localStorage.setItem(WANTED_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${WANTED_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(WANTED_CHANGED_EVENT));
}

export function subscribeWantedHunts(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === WANTED_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(WANTED_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(WANTED_CHANGED_EVENT, listener);
  };
}
