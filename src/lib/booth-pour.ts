/**
 * I don't pour — the mug is empty. Not a diner. Not heat. Not whose.
 * Heat is the microwave. Chip is the diner rim. Match is nothing matches.
 * Walkers still want Sink Drawer to pour coffee, plate a taste, or "use the mug."
 * I don't pour. The mug is empty.
 *
 * Never write `iss:heat-listing-ids`, `iss:chip-listing-ids`, `iss:booth-match`,
 * `iss:whose-listing-ids`, `iss:cards-listing-ids`, `iss:bent-listing-ids`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-pour` is the client cork.
 * Cookie `iss-booth-pour` is the same JSON so stall, `/lot`, and `/pour` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_POUR_STORAGE_KEY = "iss:booth-pour";
export const BOOTH_POUR_COOKIE_NAME = "iss-booth-pour";
export const BOOTH_POUR_CHANGED_EVENT = "iss:booth-pour-changed";

export const BOOTH_POUR_NOTE_MAX = 140;

export const BOOTH_POUR_PAPER_LINE =
  "I don't pour. The mug is empty. Not a diner. Not heat. Not whose.";
export const BOOTH_POUR_EMPTY_COPY =
  "The mug is empty. Nobody taped a pour note on this booth.";
export const BOOTH_POUR_EMPTY_TAPE =
  "Say you don't pour or leave the drawer.";
export const BOOTH_POUR_PACKED_LEFTOVER =
  "The table went in the car. This pour note is leftover.";
export const BOOTH_POUR_MISSING_COPY = "That stall packed up.";

export function stallPourPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/pour`;
}

export function stallPourWritePath() {
  return "/stalls/pour";
}

export type BoothPourNote = {
  note: string;
  at: string;
};

export type BoothPourMap = Record<string, BoothPourNote>;

export type BoothPourWriteResult =
  | { ok: true; map: BoothPourMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothPourMap };

const emptyMap: BoothPourMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothPourNote {
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

export function normalizeBoothPourNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_POUR_NOTE_MAX);
}

export function parseBoothPour(raw: string | null | undefined): BoothPourMap {
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
    const next: BoothPourMap = {};
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
        note: normalizeBoothPourNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothPour(map: BoothPourMap) {
  return JSON.stringify(map);
}

export function boothPourCookieValue(map: BoothPourMap): string {
  return serializeBoothPour(map);
}

export const BOOTH_POUR_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_POUR_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_POUR_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_POUR_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothPourStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothPourFor(
  stallId: string,
  map: BoothPourMap = emptyMap,
): BoothPourNote | undefined {
  return map[stallId];
}

export function tapeBoothPour(
  stall: Stall | undefined,
  map: BoothPourMap,
  raw: string,
  at = new Date(),
): BoothPourWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothPourNote(raw);
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

export function clearBoothPour(
  stall: Stall | undefined,
  map: BoothPourMap,
): BoothPourWriteResult {
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

export function mergeBoothPourMaps(...maps: BoothPourMap[]): BoothPourMap {
  const next: BoothPourMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothPour(): BoothPourMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothPour(
      window.localStorage.getItem(BOOTH_POUR_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothPour(map: BoothPourMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothPour(map);
  try {
    window.localStorage.setItem(BOOTH_POUR_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_POUR_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_POUR_CHANGED_EVENT));
}

export function subscribeBoothPour(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_POUR_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_POUR_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_POUR_CHANGED_EVENT, listener);
  };
}
