/**
 * Booth scrap — a sticky the seller tapes on this table.
 * “cash only after 2” lives here. Not a hunt. Not an offer on a lamp.
 *
 * Never write wanted / listing-offer / tote / sold / packed keys.
 * Never write `/stalls/[slug]/tape` — another builder owns that URL.
 *
 * Shape: `{ id, stallId, note, at }` scraps.
 * localStorage key `iss:stall-scraps` is the client cork.
 * Cookie `iss-stall-scraps` is the same JSON so `/stalls/[slug]/scrap` can SSR it.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const STALL_SCRAP_STORAGE_KEY = "iss:stall-scraps";
export const STALL_SCRAP_COOKIE_NAME = "iss-stall-scraps";
export const STALL_SCRAP_CHANGED_EVENT = "iss:stall-scraps-changed";

export const STALL_SCRAP_NOTE_MAX = 140;
export const STALL_SCRAP_BOARD_MAX = 20;

export const SCRAP_MISSING_COPY = "That stall packed up.";
export const SCRAP_EMPTY_COPY = "This table has no scrap.";
export const SCRAP_PAPER_LINE =
  "A sticky on the booth. Not a hunt. Not a haggle on a lamp.";
export const SCRAP_RELOAD_LINE = "Tape it and it is still here after reload.";

export type StallScrap = {
  id: string;
  stallId: string;
  note: string;
  at: string;
};

export type TapeScrapResult =
  | { ok: true; scrap: StallScrap; scraps: StallScrap[] }
  | { ok: false; reason: "empty" | "missing"; scraps: StallScrap[] };

function canUseStorage() {
  return typeof window !== "undefined";
}

export function normalizeScrapNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, STALL_SCRAP_NOTE_MAX);
}

function isStallScrap(value: unknown): value is StallScrap {
  if (!value || typeof value !== "object") {
    return false;
  }
  const scrap = value as StallScrap;
  return (
    typeof scrap.id === "string" &&
    scrap.id.length > 0 &&
    typeof scrap.stallId === "string" &&
    scrap.stallId.length > 0 &&
    typeof scrap.note === "string" &&
    scrap.note.length > 0 &&
    typeof scrap.at === "string"
  );
}

export function parseStallScraps(raw: string | null | undefined): StallScrap[] {
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
    return parsed.filter(isStallScrap);
  } catch {
    return [];
  }
}

export function serializeStallScraps(scraps: StallScrap[]) {
  return JSON.stringify(scraps);
}

export function createScrapId(at = new Date()) {
  const stamp = at.getTime().toString(36);
  const salt = Math.random().toString(36).slice(2, 6);
  return `scrap-${stamp}${salt}`;
}

export function createStallScrap(
  stall: Stall,
  note: string,
  at = new Date(),
): StallScrap {
  return {
    id: createScrapId(at),
    stallId: stall.id,
    note,
    at: at.toISOString(),
  };
}

export function resolveScrapStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallBySlug(trimmed) ?? stallById(trimmed);
}

export function tapeStallScrap(
  existing: StallScrap[],
  slugOrId: string,
  raw: string,
): TapeScrapResult {
  const stall = resolveScrapStall(slugOrId);
  if (!stall) {
    return { ok: false, reason: "missing", scraps: existing };
  }

  const note = normalizeScrapNote(raw);
  if (!note) {
    return { ok: false, reason: "empty", scraps: existing };
  }

  const scrap = createStallScrap(stall, note);
  return {
    ok: true,
    scrap,
    scraps: [scrap, ...existing].slice(0, STALL_SCRAP_BOARD_MAX),
  };
}

export function peelStallScrap(
  existing: StallScrap[],
  scrapId: string,
): StallScrap[] {
  if (!scrapId) {
    return existing;
  }
  return existing.filter((scrap) => scrap.id !== scrapId);
}

export function scrapsForStall(scraps: StallScrap[], stallId: string) {
  return scraps.filter((scrap) => scrap.stallId === stallId);
}

export function mergeStallScraps(
  existing: StallScrap[],
  incoming: StallScrap[],
): StallScrap[] {
  const byId = new Map<string, StallScrap>();
  for (const scrap of incoming) {
    byId.set(scrap.id, scrap);
  }
  for (const scrap of existing) {
    if (!byId.has(scrap.id)) {
      byId.set(scrap.id, scrap);
    }
  }
  return [...byId.values()]
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
    .slice(0, STALL_SCRAP_BOARD_MAX);
}

export function readStallScraps(): StallScrap[] {
  if (!canUseStorage()) {
    return [];
  }
  try {
    const fromStorage = parseStallScraps(
      window.localStorage.getItem(STALL_SCRAP_STORAGE_KEY),
    );
    if (fromStorage.length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return [];
}

export function writeStallScraps(scraps: StallScrap[]) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeStallScraps(scraps);
  try {
    window.localStorage.setItem(STALL_SCRAP_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${STALL_SCRAP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(STALL_SCRAP_CHANGED_EVENT));
}

export function subscribeStallScraps(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === STALL_SCRAP_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(STALL_SCRAP_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STALL_SCRAP_CHANGED_EVENT, listener);
  };
}
