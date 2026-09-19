/**
 * I don't do dishes — chip stays. Still a mug. Not pour. Not a sink. Not wash.
 * Pour is I don't pour. Wash is the jacket. Heat is the microwave. Wrap is
 * newspaper. Match is nothing matches. Walkers still want Sink Drawer to
 * wash the mug at the hose, or "do the dishes." I don't do dishes. Chip stays.
 *
 * Never write `iss:booth-pour`, `iss:booth-wrap`, `iss:booth-match`,
 * `iss:cap-listing-ids`, `iss:glass-listing-ids`, `iss:tines-listing-ids`,
 * `iss:double-listing-ids`, `iss:wash-listing-ids`, tote, sold, packed,
 * or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-dishes` is the client cork.
 * Cookie `iss-booth-dishes` is the same JSON so stall, `/lot`, and `/dishes` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_DISHES_STORAGE_KEY = "iss:booth-dishes";
export const BOOTH_DISHES_COOKIE_NAME = "iss-booth-dishes";
export const BOOTH_DISHES_CHANGED_EVENT = "iss:booth-dishes-changed";

export const BOOTH_DISHES_NOTE_MAX = 140;

export const BOOTH_DISHES_PAPER_LINE =
  "I don't do dishes. Chip stays. Still a mug. Not pour. Not a sink. Not wash.";
export const BOOTH_DISHES_EMPTY_COPY =
  "Chip stays. Nobody taped a dishes note on this booth.";
export const BOOTH_DISHES_EMPTY_TAPE =
  "Say you don't do dishes or leave the table.";
export const BOOTH_DISHES_PACKED_LEFTOVER =
  "The table went in the car. This dishes note is leftover.";
export const BOOTH_DISHES_MISSING_COPY = "That stall packed up.";

export function stallDishesPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/dishes`;
}

export function stallDishesWritePath() {
  return "/stalls/dishes";
}

export type BoothDishesNote = {
  note: string;
  at: string;
};

export type BoothDishesMap = Record<string, BoothDishesNote>;

export type BoothDishesWriteResult =
  | { ok: true; map: BoothDishesMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothDishesMap };

const emptyMap: BoothDishesMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothDishesNote {
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

export function normalizeBoothDishesNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_DISHES_NOTE_MAX);
}

export function parseBoothDishes(raw: string | null | undefined): BoothDishesMap {
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
    const next: BoothDishesMap = {};
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
        note: normalizeBoothDishesNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothDishes(map: BoothDishesMap) {
  return JSON.stringify(map);
}

export function boothDishesCookieValue(map: BoothDishesMap): string {
  return serializeBoothDishes(map);
}

export const BOOTH_DISHES_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_DISHES_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_DISHES_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_DISHES_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothDishesStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothDishesFor(
  stallId: string,
  map: BoothDishesMap = emptyMap,
): BoothDishesNote | undefined {
  return map[stallId];
}

export function tapeBoothDishes(
  stall: Stall | undefined,
  map: BoothDishesMap,
  raw: string,
  at = new Date(),
): BoothDishesWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothDishesNote(raw);
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

export function clearBoothDishes(
  stall: Stall | undefined,
  map: BoothDishesMap,
): BoothDishesWriteResult {
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

export function mergeBoothDishesMaps(...maps: BoothDishesMap[]): BoothDishesMap {
  const next: BoothDishesMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothDishes(): BoothDishesMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothDishes(
      window.localStorage.getItem(BOOTH_DISHES_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothDishes(map: BoothDishesMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothDishes(map);
  try {
    window.localStorage.setItem(BOOTH_DISHES_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_DISHES_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_DISHES_CHANGED_EVENT));
}

export function subscribeBoothDishes(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_DISHES_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_DISHES_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_DISHES_CHANGED_EVENT, listener);
  };
}
