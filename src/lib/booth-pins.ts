/**
 * I don't have pins — hem stays. Still a rack.
 * Buttons is snaps. Sew is not a tailor. Stay is hangers.
 * Walkers still want Closet to hand a pin, or "hold the hem."
 * I don't have pins. Hem stays.
 *
 * Never write `iss:booth-buttons`, `iss:booth-sew`, `iss:booth-stay`,
 * `iss:booth-stack`, `iss:lining-listing-ids`, `iss:cement-listing-ids`,
 * `iss:spray-listing-ids`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-pins` is the client cork.
 * Cookie `iss-booth-pins` is the same JSON so stall, `/lot`, and `/pins` SSR it.
 * Never persist a write-result `{ ok, map }` — that literal 500s the stall.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_PINS_STORAGE_KEY = "iss:booth-pins";
export const BOOTH_PINS_COOKIE_NAME = "iss-booth-pins";
export const BOOTH_PINS_CHANGED_EVENT = "iss:booth-pins-changed";

export const BOOTH_PINS_NOTE_MAX = 140;

export const BOOTH_PINS_PAPER_LINE =
  "I don't have pins. Hem stays. Still a rack. Not buttons. Not sew. Not stay.";
export const BOOTH_PINS_EMPTY_COPY =
  "Hem stays. Nobody taped a pins note on this booth.";
export const BOOTH_PINS_EMPTY_TAPE =
  "Say you don't have pins or leave the table.";
export const BOOTH_PINS_PACKED_LEFTOVER =
  "The table went in the car. This pins note is leftover.";
export const BOOTH_PINS_MISSING_COPY = "That stall packed up.";

export function stallPinsPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/pins`;
}

export function stallPinsWritePath() {
  return "/stalls/pins";
}

export type BoothPinsNote = {
  note: string;
  at: string;
};

export type BoothPinsMap = Record<string, BoothPinsNote>;

export type BoothPinsWriteResult =
  | { ok: true; map: BoothPinsMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothPinsMap };

const emptyMap: BoothPinsMap = {};

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

function isNote(value: unknown): value is BoothPinsNote {
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

export function normalizeBoothPinsNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_PINS_NOTE_MAX);
}

export function parseBoothPins(raw: string | null | undefined): BoothPinsMap {
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
    const next: BoothPinsMap = {};
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
        note: normalizeBoothPinsNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothPins(map: BoothPinsMap) {
  return JSON.stringify(map);
}

export function boothPinsCookieValue(map: BoothPinsMap): string {
  return serializeBoothPins(map);
}

export const BOOTH_PINS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_PINS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){try{var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_PINS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_PINS_CHANGED_EVENT)}));}}catch(e){}}}}catch(e){}`;

export function resolveBoothPinsStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothPinsFor(
  stallId: string,
  map: BoothPinsMap = emptyMap,
): BoothPinsNote | undefined {
  return map[stallId];
}

export function tapeBoothPins(
  stall: Stall | undefined,
  map: BoothPinsMap,
  raw: string,
  at = new Date(),
): BoothPinsWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothPinsNote(raw);
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

export function clearBoothPins(
  stall: Stall | undefined,
  map: BoothPinsMap,
): BoothPinsWriteResult {
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

export function mergeBoothPinsMaps(...maps: BoothPinsMap[]): BoothPinsMap {
  const next: BoothPinsMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothPins(): BoothPinsMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothPins(
      window.localStorage.getItem(BOOTH_PINS_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothPins(map: BoothPinsMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothPins(map);
  try {
    window.localStorage.setItem(BOOTH_PINS_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_PINS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_PINS_CHANGED_EVENT));
}

export function subscribeBoothPins(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_PINS_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_PINS_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_PINS_CHANGED_EVENT, listener);
  };
}
