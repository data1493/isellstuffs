/**
 * Nothing matches — the pot is not in this drawer. Ask what's on the table.
 * Fits is the lid. Walkers still hunt The Sink Drawer for the matching pot.
 *
 * Never write `iss:fits-listing-ids`, `iss:listing-bent`, `iss:heat-listing-ids`,
 * `iss:booth-stack`, pile, grade, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-match` is the client cork.
 * Cookie `iss-booth-match` is the same JSON so stall, `/lot`, and `/match` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_MATCH_STORAGE_KEY = "iss:booth-match";
export const BOOTH_MATCH_COOKIE_NAME = "iss-booth-match";
export const BOOTH_MATCH_CHANGED_EVENT = "iss:booth-match-changed";

export const BOOTH_MATCH_NOTE_MAX = 140;

export const BOOTH_MATCH_PAPER_LINE =
  "Nothing matches. The pot is not in this drawer. Ask what's on the table.";
export const BOOTH_MATCH_EMPTY_COPY =
  "The pot is not in this drawer. Nobody taped a match note on this booth.";
export const BOOTH_MATCH_EMPTY_TAPE =
  "Write the match note or leave the drawer as-is.";
export const BOOTH_MATCH_PACKED_LEFTOVER =
  "The table went in the car. This match note is leftover.";
export const BOOTH_MATCH_MISSING_COPY = "That stall packed up.";

export function stallMatchPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/match`;
}

export function stallMatchWritePath() {
  return "/stalls/match";
}

export type BoothMatchNote = {
  note: string;
  at: string;
};

export type BoothMatchMap = Record<string, BoothMatchNote>;

export type BoothMatchWriteResult =
  | { ok: true; map: BoothMatchMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothMatchMap };

const emptyMap: BoothMatchMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothMatchNote {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as Record<string, unknown>;
  return (
    typeof row.note === "string" &&
    row.note.trim().length > 0 &&
    typeof row.at === "string"
  );
}

export function normalizeBoothMatchNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_MATCH_NOTE_MAX);
}

export function parseBoothMatch(raw: string | null | undefined): BoothMatchMap {
  if (!raw) {
    return emptyMap;
  }

  try {
    let value = raw;
    try {
      value = decodeURIComponent(raw);
    } catch {
      value = raw;
    }
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return emptyMap;
    }
    const next: BoothMatchMap = {};
    for (const [stallId, note] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (typeof stallId !== "string" || stallId.length === 0) {
        continue;
      }
      if (!isNote(note)) {
        continue;
      }
      next[stallId] = {
        note: normalizeBoothMatchNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothMatch(map: BoothMatchMap) {
  return JSON.stringify(map);
}

export function boothMatchCookieValue(map: BoothMatchMap): string {
  return serializeBoothMatch(map);
}

export const BOOTH_MATCH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_MATCH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_MATCH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_MATCH_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothMatchStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothMatchFor(
  stallId: string,
  map: BoothMatchMap = emptyMap,
): BoothMatchNote | undefined {
  return map[stallId];
}

export function tapeBoothMatch(
  stall: Stall | undefined,
  map: BoothMatchMap,
  raw: string,
  at = new Date(),
): BoothMatchWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothMatchNote(raw);
  if (!note) {
    return { ok: false, reason: "empty", map };
  }
  return {
    ok: true,
    map: {
      ...map,
      [stall.id]: { note, at: at.toISOString() },
    },
  };
}

export function clearBoothMatch(
  stall: Stall | undefined,
  map: BoothMatchMap,
): BoothMatchWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  if (!(stall.id in map)) {
    return { ok: true, map };
  }
  const next = { ...map };
  delete next[stall.id];
  return { ok: true, map: next };
}

export function mergeBoothMatchMaps(...maps: BoothMatchMap[]): BoothMatchMap {
  const next: BoothMatchMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothMatch(): BoothMatchMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothMatch(
      window.localStorage.getItem(BOOTH_MATCH_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothMatch(map: BoothMatchMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothMatch(map);
  try {
    window.localStorage.setItem(BOOTH_MATCH_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_MATCH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_MATCH_CHANGED_EVENT));
}

export function subscribeBoothMatch(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_MATCH_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_MATCH_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_MATCH_CHANGED_EVENT, listener);
  };
}
