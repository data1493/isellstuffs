/**
 * I don't have a harp — shade stays in the carton. Not a lighting shop.
 * Walkers still want Tuesday to throw a harp, or "seat the shade."
 * I don't have a harp. Shade stays in the box.
 *
 * Never write `iss:booth-bulb`, `iss:box-listing-ids`,
 * `iss:twist-listing-ids`, `iss:cord-listing-ids`,
 * `iss:led-listing-ids`, `iss:revise-listing-ids`,
 * `iss:crack-listing-ids`, `iss:booth-buttons`, tote, sold, packed,
 * or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-harp` is the client cork.
 * Cookie `iss-booth-harp` is the same JSON so stall, `/lot`, and `/harp` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_HARP_STORAGE_KEY = "iss:booth-harp";
export const BOOTH_HARP_COOKIE_NAME = "iss-booth-harp";
export const BOOTH_HARP_CHANGED_EVENT = "iss:booth-harp-changed";

export const BOOTH_HARP_NOTE_MAX = 140;

export const BOOTH_HARP_PAPER_LINE =
  "I don't have a harp. Shade stays in the box. Not a lighting shop. Not box. Not bulb.";
export const BOOTH_HARP_EMPTY_COPY =
  "Nobody taped a harp note on this booth. The shade stays in the box.";
export const BOOTH_HARP_EMPTY_TAPE =
  "Say you don't have a harp or leave the table.";
export const BOOTH_HARP_PACKED_LEFTOVER =
  "The table went in the car. This harp note is leftover.";
export const BOOTH_HARP_MISSING_COPY = "That stall packed up.";

export function stallHarpPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/harp`;
}

export function stallHarpWritePath() {
  return "/stalls/harp";
}

export type BoothHarpNote = {
  note: string;
  at: string;
};

export type BoothHarpMap = Record<string, BoothHarpNote>;

export type BoothHarpWriteResult =
  | { ok: true; map: BoothHarpMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothHarpMap };

const emptyMap: BoothHarpMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothHarpNote {
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

export function normalizeBoothHarpNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_HARP_NOTE_MAX);
}

export function parseBoothHarp(raw: string | null | undefined): BoothHarpMap {
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
    const next: BoothHarpMap = {};
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
        note: normalizeBoothHarpNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothHarp(map: BoothHarpMap) {
  return JSON.stringify(map);
}

export function boothHarpCookieValue(map: BoothHarpMap): string {
  return serializeBoothHarp(map);
}

export const BOOTH_HARP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_HARP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_HARP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_HARP_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothHarpStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothHarpFor(
  stallId: string,
  map: BoothHarpMap = emptyMap,
): BoothHarpNote | undefined {
  return map[stallId];
}

export function tapeBoothHarp(
  stall: Stall | undefined,
  map: BoothHarpMap,
  raw: string,
  at = new Date(),
): BoothHarpWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothHarpNote(raw);
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

export function clearBoothHarp(
  stall: Stall | undefined,
  map: BoothHarpMap,
): BoothHarpWriteResult {
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

export function mergeBoothHarpMaps(...maps: BoothHarpMap[]): BoothHarpMap {
  const next: BoothHarpMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothHarp(): BoothHarpMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothHarp(
      window.localStorage.getItem(BOOTH_HARP_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothHarp(map: BoothHarpMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothHarp(map);
  try {
    window.localStorage.setItem(BOOTH_HARP_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_HARP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_HARP_CHANGED_EVENT));
}

export function subscribeBoothHarp(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_HARP_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_HARP_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_HARP_CHANGED_EVENT, listener);
  };
}
