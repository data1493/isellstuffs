/**
 * I don't have a square — still a table. Still Tuesday.
 * Clamp is C-clamp. Kit is assemble. Shim is lamp sit-flat. Stay is hangers.
 * Walkers still want Tuesday to hand over a square, or so they can true the shade.
 * I don't have a square. Still a table.
 *
 * Never write `iss:booth-clamp`, `iss:booth-kit`, `iss:booth-stay`,
 * `iss:booth-tape`, `iss:shim-listing-ids`, `iss:bush-listing-ids`,
 * `iss:booth-funnel`, `iss:booth-spudger`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-square` is the client cork.
 * Cookie `iss-booth-square` is the same JSON so stall, `/lot`, and `/square` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_SQUARE_STORAGE_KEY = "iss:booth-square";
export const BOOTH_SQUARE_COOKIE_NAME = "iss-booth-square";
export const BOOTH_SQUARE_CHANGED_EVENT = "iss:booth-square-changed";

export const BOOTH_SQUARE_NOTE_MAX = 140;

export const BOOTH_SQUARE_PAPER_LINE =
  "I don't have a square. Still a table.";
export const BOOTH_SQUARE_EMPTY_COPY =
  "Nobody taped a square note on this booth. Still a table.";
export const BOOTH_SQUARE_EMPTY_TAPE =
  "Say you don't have a square or leave the table.";
export const BOOTH_SQUARE_PACKED_LEFTOVER =
  "The table went in the car. This square note is leftover.";
export const BOOTH_SQUARE_MISSING_COPY = "That stall packed up.";

export function stallSquarePath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/square`;
}

export function stallSquareWritePath() {
  return "/stalls/square";
}

export type BoothSquareNote = {
  note: string;
  at: string;
};

export type BoothSquareMap = Record<string, BoothSquareNote>;

export type BoothSquareWriteResult =
  | { ok: true; map: BoothSquareMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothSquareMap };

const emptyMap: BoothSquareMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothSquareNote {
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

export function normalizeBoothSquareNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_SQUARE_NOTE_MAX);
}

export function parseBoothSquare(raw: string | null | undefined): BoothSquareMap {
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
    const next: BoothSquareMap = {};
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
        note: normalizeBoothSquareNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothSquare(map: BoothSquareMap) {
  return JSON.stringify(map);
}

export function boothSquareCookieValue(map: BoothSquareMap): string {
  return serializeBoothSquare(map);
}

export const BOOTH_SQUARE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_SQUARE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_SQUARE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_SQUARE_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothSquareStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothSquareFor(
  stallId: string,
  map: BoothSquareMap = emptyMap,
): BoothSquareNote | undefined {
  return map[stallId];
}

export function tapeBoothSquare(
  stall: Stall | undefined,
  map: BoothSquareMap,
  raw: string,
  at = new Date(),
): BoothSquareWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothSquareNote(raw);
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

export function clearBoothSquare(
  stall: Stall | undefined,
  map: BoothSquareMap,
): BoothSquareWriteResult {
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

export function mergeBoothSquareMaps(...maps: BoothSquareMap[]): BoothSquareMap {
  const next: BoothSquareMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothSquare(): BoothSquareMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothSquare(
      window.localStorage.getItem(BOOTH_SQUARE_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothSquare(map: BoothSquareMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothSquare(map);
  try {
    window.localStorage.setItem(BOOTH_SQUARE_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_SQUARE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_SQUARE_CHANGED_EVENT));
}

export function subscribeBoothSquare(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_SQUARE_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_SQUARE_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_SQUARE_CHANGED_EVENT, listener);
  };
}
