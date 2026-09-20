/**
 * I don't have a mallet — still a driveway. Still a stain. Still Tuesday.
 * Peen is hammer-the-collar. Clamp is C-clamp. Jig is seat-the-harp.
 * Square is try-square. Wrap stays wrap. Vise is not this booth.
 * Pinch / shaper / bisque / mask stay listing paper.
 * Walkers still want Tuesday to hand over a mallet, or so they can
 * peen the lamp without a vise. I don't have a mallet. Still a driveway.
 * Still a stain.
 *
 * Never write `iss:booth-peen`, `iss:booth-clamp`, `iss:booth-jig`,
 * `iss:booth-square`, `iss:booth-vise`, `iss:booth-pony`,
 * `iss:pinch-listing-ids`, `iss:shaper-listing-ids`,
 * `iss:bisque-listing-ids`, `iss:mask-listing-ids`, tote, sold,
 * packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-mallet` is the client cork.
 * Cookie `iss-booth-mallet` is the same JSON so stall, `/lot`, and `/mallet` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_MALLET_STORAGE_KEY = "iss:booth-mallet";
export const BOOTH_MALLET_COOKIE_NAME = "iss-booth-mallet";
export const BOOTH_MALLET_CHANGED_EVENT = "iss:booth-mallet-changed";

export const BOOTH_MALLET_NOTE_MAX = 140;

export const BOOTH_MALLET_PAPER_LINE =
  "I don't have a mallet. Still a driveway. Still a stain.";
export const BOOTH_MALLET_EMPTY_COPY =
  "Nobody taped a mallet note on this booth. Still a driveway.";
export const BOOTH_MALLET_EMPTY_TAPE =
  "Say you don't have a mallet or leave the driveway.";
export const BOOTH_MALLET_PACKED_LEFTOVER =
  "The table went in the car. This mallet note is leftover.";
export const BOOTH_MALLET_MISSING_COPY = "That stall packed up.";

export function stallMalletPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/mallet`;
}

export function stallMalletWritePath() {
  return "/stalls/mallet";
}

export type BoothMalletNote = {
  note: string;
  at: string;
};

export type BoothMalletMap = Record<string, BoothMalletNote>;

export type BoothMalletWriteResult =
  | { ok: true; map: BoothMalletMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothMalletMap };

const emptyMap: BoothMalletMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothMalletNote {
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

export function normalizeBoothMalletNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_MALLET_NOTE_MAX);
}

export function parseBoothMallet(raw: string | null | undefined): BoothMalletMap {
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
    const next: BoothMalletMap = {};
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
        note: normalizeBoothMalletNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothMallet(map: BoothMalletMap) {
  return JSON.stringify(map);
}

export function boothMalletCookieValue(map: BoothMalletMap): string {
  return serializeBoothMallet(map);
}

export const BOOTH_MALLET_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_MALLET_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_MALLET_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_MALLET_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothMalletStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothMalletFor(
  stallId: string,
  map: BoothMalletMap = emptyMap,
): BoothMalletNote | undefined {
  return map[stallId];
}

export function tapeBoothMallet(
  stall: Stall | undefined,
  map: BoothMalletMap,
  raw: string,
  at = new Date(),
): BoothMalletWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothMalletNote(raw);
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

export function clearBoothMallet(
  stall: Stall | undefined,
  map: BoothMalletMap,
): BoothMalletWriteResult {
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

export function mergeBoothMalletMaps(...maps: BoothMalletMap[]): BoothMalletMap {
  const next: BoothMalletMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothMallet(): BoothMalletMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothMallet(
      window.localStorage.getItem(BOOTH_MALLET_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothMallet(map: BoothMalletMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothMallet(map);
  try {
    window.localStorage.setItem(BOOTH_MALLET_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_MALLET_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_MALLET_CHANGED_EVENT));
}

export function subscribeBoothMallet(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_MALLET_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_MALLET_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_MALLET_CHANGED_EVENT, listener);
  };
}
