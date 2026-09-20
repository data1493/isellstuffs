/**
 * I don't have a pony — still a closet. Still Closet.
 * Thimble is Closet thimble. Sew is no hem. Last is the cobbler form.
 * Awl is the punch. Wrap stays wrap. Loom / kern / pink / stake stay listing paper.
 * Walkers still want Closet to hand a stitching pony, or clamp a strap
 * before they buy. I don't have a pony. Still a closet. Still Closet.
 *
 * Never write `iss:booth-thimble`, `iss:booth-sew`, `iss:booth-last`,
 * `iss:booth-awl`, `iss:loom-listing-ids`, `iss:kern-listing-ids`,
 * `iss:pink-listing-ids`, `iss:stake-listing-ids`, `iss:skive-listing-ids`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-pony` is the client cork.
 * Cookie `iss-booth-pony` is the same JSON so stall, `/lot`, and `/pony` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_PONY_STORAGE_KEY = "iss:booth-pony";
export const BOOTH_PONY_COOKIE_NAME = "iss-booth-pony";
export const BOOTH_PONY_CHANGED_EVENT = "iss:booth-pony-changed";

export const BOOTH_PONY_NOTE_MAX = 140;

export const BOOTH_PONY_PAPER_LINE = "I don't have a pony. Still a closet.";
export const BOOTH_PONY_EMPTY_COPY =
  "Nobody taped a pony note on this booth. Still a closet.";
export const BOOTH_PONY_EMPTY_TAPE =
  "Say you don't have a pony or leave the closet.";
export const BOOTH_PONY_PACKED_LEFTOVER =
  "The closet went in the car. This pony note is leftover.";
export const BOOTH_PONY_MISSING_COPY = "That stall packed up.";

export function stallPonyPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/pony`;
}

export function stallPonyWritePath() {
  return "/stalls/pony";
}

export type BoothPonyNote = {
  note: string;
  at: string;
};

export type BoothPonyMap = Record<string, BoothPonyNote>;

export type BoothPonyWriteResult =
  | { ok: true; map: BoothPonyMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothPonyMap };

const emptyMap: BoothPonyMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothPonyNote {
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

export function normalizeBoothPonyNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_PONY_NOTE_MAX);
}

export function parseBoothPony(raw: string | null | undefined): BoothPonyMap {
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
    const next: BoothPonyMap = {};
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
        note: normalizeBoothPonyNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothPony(map: BoothPonyMap) {
  return JSON.stringify(map);
}

export function boothPonyCookieValue(map: BoothPonyMap): string {
  return serializeBoothPony(map);
}

export const BOOTH_PONY_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_PONY_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_PONY_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_PONY_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothPonyStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothPonyFor(
  stallId: string,
  map: BoothPonyMap = emptyMap,
): BoothPonyNote | undefined {
  return map[stallId];
}

export function tapeBoothPony(
  stall: Stall | undefined,
  map: BoothPonyMap,
  raw: string,
  at = new Date(),
): BoothPonyWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothPonyNote(raw);
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

export function clearBoothPony(
  stall: Stall | undefined,
  map: BoothPonyMap,
): BoothPonyWriteResult {
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

export function mergeBoothPonyMaps(...maps: BoothPonyMap[]): BoothPonyMap {
  const next: BoothPonyMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothPony(): BoothPonyMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothPony(
      window.localStorage.getItem(BOOTH_PONY_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothPony(map: BoothPonyMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothPony(map);
  try {
    window.localStorage.setItem(BOOTH_PONY_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_PONY_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_PONY_CHANGED_EVENT));
}

export function subscribeBoothPony(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_PONY_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_PONY_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_PONY_CHANGED_EVENT, listener);
  };
}
