/**
 * I don't have a bulb — twist the neck anyway. Not a hardware shop.
 * Twist is the neck switch. Cord is the rewire. Box is the shade in the carton.
 * Walkers still want Tuesday to throw a spare bulb in, or "make it light
 * without my bulb." I don't have a bulb. Twist the neck anyway.
 *
 * Never write `iss:twist-listing-ids`, `iss:cord-listing-ids`,
 * `iss:box-listing-ids`, `iss:booth-fix`, `iss:crack-listing-ids`,
 * `iss:typeset-listing-ids`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-bulb` is the client cork.
 * Cookie `iss-booth-bulb` is the same JSON so stall, `/lot`, and `/bulb` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_BULB_STORAGE_KEY = "iss:booth-bulb";
export const BOOTH_BULB_COOKIE_NAME = "iss-booth-bulb";
export const BOOTH_BULB_CHANGED_EVENT = "iss:booth-bulb-changed";

export const BOOTH_BULB_NOTE_MAX = 140;

export const BOOTH_BULB_PAPER_LINE =
  "I don't have a bulb. Twist the neck anyway. Not a hardware shop. Not cord. Not twist.";
export const BOOTH_BULB_EMPTY_COPY =
  "Nobody taped a bulb note on this booth. Bring your own.";
export const BOOTH_BULB_EMPTY_TAPE =
  "Say you don't have a bulb or leave the table.";
export const BOOTH_BULB_PACKED_LEFTOVER =
  "The table went in the car. This bulb note is leftover.";
export const BOOTH_BULB_MISSING_COPY = "That stall packed up.";

export function stallBulbPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/bulb`;
}

export function stallBulbWritePath() {
  return "/stalls/bulb";
}

export type BoothBulbNote = {
  note: string;
  at: string;
};

export type BoothBulbMap = Record<string, BoothBulbNote>;

export type BoothBulbWriteResult =
  | { ok: true; map: BoothBulbMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothBulbMap };

const emptyMap: BoothBulbMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothBulbNote {
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

export function normalizeBoothBulbNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_BULB_NOTE_MAX);
}

export function parseBoothBulb(raw: string | null | undefined): BoothBulbMap {
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
    const next: BoothBulbMap = {};
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
        note: normalizeBoothBulbNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothBulb(map: BoothBulbMap) {
  return JSON.stringify(map);
}

export function boothBulbCookieValue(map: BoothBulbMap): string {
  return serializeBoothBulb(map);
}

export const BOOTH_BULB_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_BULB_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_BULB_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_BULB_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothBulbStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothBulbFor(
  stallId: string,
  map: BoothBulbMap = emptyMap,
): BoothBulbNote | undefined {
  return map[stallId];
}

export function tapeBoothBulb(
  stall: Stall | undefined,
  map: BoothBulbMap,
  raw: string,
  at = new Date(),
): BoothBulbWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothBulbNote(raw);
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

export function clearBoothBulb(
  stall: Stall | undefined,
  map: BoothBulbMap,
): BoothBulbWriteResult {
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

export function mergeBoothBulbMaps(...maps: BoothBulbMap[]): BoothBulbMap {
  const next: BoothBulbMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothBulb(): BoothBulbMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothBulb(
      window.localStorage.getItem(BOOTH_BULB_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothBulb(map: BoothBulbMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothBulb(map);
  try {
    window.localStorage.setItem(BOOTH_BULB_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_BULB_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_BULB_CHANGED_EVENT));
}

export function subscribeBoothBulb(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_BULB_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_BULB_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_BULB_CHANGED_EVENT, listener);
  };
}
