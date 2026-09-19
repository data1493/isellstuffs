/**
 * I will not name them — Side A still plays. The crate will not title the LP.
 * Songs is no titles on the cassette. Sleeve is the grocery bag. Dust stays.
 * Press is which pressing. Walkers still ask Sunday Crate what the unnamed
 * LP is. Not songs. Not a liner shop. Not sleeve.
 *
 * Never write `iss:songs-listing-ids`, `iss:sleeve-listing-ids`,
 * `iss:dust-listing-ids`, `iss:listing-press`, `iss:booth-deck`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-name` is the client cork.
 * Cookie `iss-booth-name` is the same JSON so stall, `/lot`, and `/name` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_NAME_STORAGE_KEY = "iss:booth-name";
export const BOOTH_NAME_COOKIE_NAME = "iss-booth-name";
export const BOOTH_NAME_CHANGED_EVENT = "iss:booth-name-changed";

export const BOOTH_NAME_NOTE_MAX = 140;

export const BOOTH_NAME_PAPER_LINE =
  "I will not name them. Side A still plays. Not songs. Not a liner shop. Not sleeve.";
export const BOOTH_NAME_EMPTY_COPY =
  "The crate still plays Side A. Nobody taped a name note on this booth.";
export const BOOTH_NAME_EMPTY_TAPE =
  "Say you will not name them or leave the crate.";
export const BOOTH_NAME_PACKED_LEFTOVER =
  "The table went in the car. This name note is leftover.";
export const BOOTH_NAME_MISSING_COPY = "That stall packed up.";

export function stallNamePath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/name`;
}

export function stallNameWritePath() {
  return "/stalls/name";
}

export type BoothNameNote = {
  note: string;
  at: string;
};

export type BoothNameMap = Record<string, BoothNameNote>;

export type BoothNameWriteResult =
  | { ok: true; map: BoothNameMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothNameMap };

const emptyMap: BoothNameMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothNameNote {
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

export function normalizeBoothNameNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_NAME_NOTE_MAX);
}

export function parseBoothName(raw: string | null | undefined): BoothNameMap {
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
    const next: BoothNameMap = {};
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
        note: normalizeBoothNameNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothName(map: BoothNameMap) {
  return JSON.stringify(map);
}

export function boothNameCookieValue(map: BoothNameMap): string {
  return serializeBoothName(map);
}

export const BOOTH_NAME_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_NAME_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_NAME_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_NAME_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothNameStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothNameFor(
  stallId: string,
  map: BoothNameMap = emptyMap,
): BoothNameNote | undefined {
  return map[stallId];
}

export function tapeBoothName(
  stall: Stall | undefined,
  map: BoothNameMap,
  raw: string,
  at = new Date(),
): BoothNameWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothNameNote(raw);
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

export function clearBoothName(
  stall: Stall | undefined,
  map: BoothNameMap,
): BoothNameWriteResult {
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

export function mergeBoothNameMaps(...maps: BoothNameMap[]): BoothNameMap {
  const next: BoothNameMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothName(): BoothNameMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothName(
      window.localStorage.getItem(BOOTH_NAME_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothName(map: BoothNameMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothName(map);
  try {
    window.localStorage.setItem(BOOTH_NAME_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_NAME_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_NAME_CHANGED_EVENT));
}

export function subscribeBoothName(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_NAME_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_NAME_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_NAME_CHANGED_EVENT, listener);
  };
}
