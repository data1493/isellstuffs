/**
 * I don't have foil — drawer only. Still a drawer. Not dishes. Not pour. Not wrap.
 * Dishes is the hose. Pour is I don't pour. Wrap is newspaper around glass.
 * Heat is the microwave. Walkers still want Sink Drawer to tear foil, or
 * "wrap the leftover." I don't have foil. Drawer only.
 *
 * Never write `iss:booth-dishes`, `iss:booth-pour`, `iss:booth-wrap`,
 * `iss:grease-listing-ids`, `iss:saucer-listing-ids`, `iss:rust-listing-ids`,
 * `iss:heat-listing-ids`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-foil` is the client cork.
 * Cookie `iss-booth-foil` is the same JSON so stall, `/lot`, and `/foil` SSR it.
 * Never persist a write-result `{ ok, map }` — that literal 500s the stall.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_FOIL_STORAGE_KEY = "iss:booth-foil";
export const BOOTH_FOIL_COOKIE_NAME = "iss-booth-foil";
export const BOOTH_FOIL_CHANGED_EVENT = "iss:booth-foil-changed";

export const BOOTH_FOIL_NOTE_MAX = 140;

export const BOOTH_FOIL_PAPER_LINE =
  "I don't have foil. Drawer only. Still a drawer. Not dishes. Not pour. Not wrap.";
export const BOOTH_FOIL_EMPTY_COPY =
  "Drawer only. Nobody taped a foil note on this booth.";
export const BOOTH_FOIL_EMPTY_TAPE =
  "Say you don't have foil or leave the table.";
export const BOOTH_FOIL_PACKED_LEFTOVER =
  "The table went in the car. This foil note is leftover.";
export const BOOTH_FOIL_MISSING_COPY = "That stall packed up.";

export function stallFoilPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/foil`;
}

export function stallFoilWritePath() {
  return "/stalls/foil";
}

export type BoothFoilNote = {
  note: string;
  at: string;
};

export type BoothFoilMap = Record<string, BoothFoilNote>;

export type BoothFoilWriteResult =
  | { ok: true; map: BoothFoilMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothFoilMap };

const emptyMap: BoothFoilMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isWriteResultLiteral(value: object): boolean {
  return (
    "ok" in value &&
    typeof (value as { ok: unknown }).ok === "boolean" &&
    "map" in value
  );
}

function isNote(value: unknown): value is BoothFoilNote {
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

export function normalizeBoothFoilNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_FOIL_NOTE_MAX);
}

export function parseBoothFoil(raw: string | null | undefined): BoothFoilMap {
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
    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      isWriteResultLiteral(parsed)
    ) {
      return emptyMap;
    }
    const next: BoothFoilMap = {};
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
        note: normalizeBoothFoilNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothFoil(map: BoothFoilMap) {
  return JSON.stringify(map);
}

export function boothFoilCookieValue(map: BoothFoilMap): string {
  return serializeBoothFoil(map);
}

export const BOOTH_FOIL_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_FOIL_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){try{var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_FOIL_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_FOIL_CHANGED_EVENT)}));}}catch(e){}}}}catch(e){}`;

export function resolveBoothFoilStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothFoilFor(
  stallId: string,
  map: BoothFoilMap = emptyMap,
): BoothFoilNote | undefined {
  return map[stallId];
}

export function tapeBoothFoil(
  stall: Stall | undefined,
  map: BoothFoilMap,
  raw: string,
  at = new Date(),
): BoothFoilWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothFoilNote(raw);
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

export function clearBoothFoil(
  stall: Stall | undefined,
  map: BoothFoilMap,
): BoothFoilWriteResult {
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

export function mergeBoothFoilMaps(...maps: BoothFoilMap[]): BoothFoilMap {
  const next: BoothFoilMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothFoil(): BoothFoilMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothFoil(
      window.localStorage.getItem(BOOTH_FOIL_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothFoil(map: BoothFoilMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothFoil(map);
  try {
    window.localStorage.setItem(BOOTH_FOIL_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_FOIL_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_FOIL_CHANGED_EVENT));
}

export function subscribeBoothFoil(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_FOIL_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_FOIL_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_FOIL_CHANGED_EVENT, listener);
  };
}
