/**
 * I don't have a last — still a table. Still Closet.
 * Stretch is cobbler-last on the pair. Sew is no hem. Welt is the welt.
 * Wrap stays wrap. Thimble is Closet thimble. Square is Tuesday's try-square.
 * Walkers still want Closet to hand over a last, or so they can block the pair
 * before they buy. I don't have a last. Still a table. Still Closet.
 *
 * Never write `iss:stretch-listing-ids`, `iss:booth-sew`, `iss:booth-thimble`,
 * `iss:welt-listing-ids`, `iss:cream-listing-ids`, `iss:booth-pins`,
 * `iss:booth-mirror`, `iss:booth-square`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-last` is the client cork.
 * Cookie `iss-booth-last` is the same JSON so stall, `/lot`, and `/last` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_LAST_STORAGE_KEY = "iss:booth-last";
export const BOOTH_LAST_COOKIE_NAME = "iss-booth-last";
export const BOOTH_LAST_CHANGED_EVENT = "iss:booth-last-changed";

export const BOOTH_LAST_NOTE_MAX = 140;

export const BOOTH_LAST_PAPER_LINE = "I don't have a last. Still a table.";
export const BOOTH_LAST_EMPTY_COPY =
  "Nobody taped a last note on this booth. Still a table.";
export const BOOTH_LAST_EMPTY_TAPE =
  "Say you don't have a last or leave the table.";
export const BOOTH_LAST_PACKED_LEFTOVER =
  "The table went in the car. This last note is leftover.";
export const BOOTH_LAST_MISSING_COPY = "That stall packed up.";

export function stallLastPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/last`;
}

export function stallLastWritePath() {
  return "/stalls/last";
}

export type BoothLastNote = {
  note: string;
  at: string;
};

export type BoothLastMap = Record<string, BoothLastNote>;

export type BoothLastWriteResult =
  | { ok: true; map: BoothLastMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothLastMap };

const emptyMap: BoothLastMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothLastNote {
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

function isWriteResultLiteral(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const row = value as Record<string, unknown>;
  // `{ ok, map }` / `{ ok: true }` / `{ ok, listingIds }` 500 the stall if treated as notes.
  return typeof row.ok === "boolean";
}

export function normalizeBoothLastNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_LAST_NOTE_MAX);
}

export function parseBoothLast(raw: string | null | undefined): BoothLastMap {
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
    if (isWriteResultLiteral(parsed)) {
      return emptyMap;
    }
    const next: BoothLastMap = {};
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
        note: normalizeBoothLastNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothLast(map: BoothLastMap) {
  return JSON.stringify(map);
}

export function boothLastCookieValue(map: BoothLastMap): string {
  return serializeBoothLast(map);
}

export const BOOTH_LAST_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_LAST_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_LAST_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_LAST_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothLastStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothLastFor(
  stallId: string,
  map: BoothLastMap = emptyMap,
): BoothLastNote | undefined {
  return map[stallId];
}

export function tapeBoothLast(
  stall: Stall | undefined,
  map: BoothLastMap,
  raw: string,
  at = new Date(),
): BoothLastWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothLastNote(raw);
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

export function clearBoothLast(
  stall: Stall | undefined,
  map: BoothLastMap,
): BoothLastWriteResult {
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

export function mergeBoothLastMaps(...maps: BoothLastMap[]): BoothLastMap {
  const next: BoothLastMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothLast(): BoothLastMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothLast(
      window.localStorage.getItem(BOOTH_LAST_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothLast(map: BoothLastMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothLast(map);
  try {
    window.localStorage.setItem(BOOTH_LAST_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_LAST_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_LAST_CHANGED_EVENT));
}

export function subscribeBoothLast(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_LAST_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_LAST_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_LAST_CHANGED_EVENT, listener);
  };
}
