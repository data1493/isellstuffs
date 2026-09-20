/**
 * I don't have a bearing — still a crate. Still a skip. Still Sunday Crate.
 * Bone is the folder. Plinth is the base. Headshell is the cartridge mount.
 * Cradle is the tonearm rest. Lifter is the cue lift. Wand is the anti-static.
 * Riser is the back-row lift. Protractor is the alignment card. Wrap stays wrap.
 * Walkers still want Crate to hand over a bearing, or so the unnamed LP spins
 * shop-level without a shop plinth. I don't have a bearing. Still a crate.
 * Still a skip.
 *
 * Never write `iss:booth-plinth`, `iss:booth-headshell`, `iss:booth-cradle`,
 * `iss:booth-lifter`, `iss:booth-bone`, `iss:booth-wand`, `iss:booth-riser`,
 * `iss:booth-protractor`, `iss:booth-slipmat`, `iss:booth-spindle`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-bearing` is the client cork.
 * Cookie `iss-booth-bearing` is the same JSON so stall, `/lot`, and `/bearing` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_BEARING_STORAGE_KEY = "iss:booth-bearing";
export const BOOTH_BEARING_COOKIE_NAME = "iss-booth-bearing";
export const BOOTH_BEARING_CHANGED_EVENT = "iss:booth-bearing-changed";

export const BOOTH_BEARING_NOTE_MAX = 140;

export const BOOTH_BEARING_PAPER_LINE =
  "I don't have a bearing. Still a crate. Still a skip.";
export const BOOTH_BEARING_EMPTY_COPY =
  "Nobody taped a bearing note on this booth. Still a crate.";
export const BOOTH_BEARING_EMPTY_TAPE =
  "Say you don't have a bearing or leave the table.";
export const BOOTH_BEARING_PACKED_LEFTOVER =
  "The table went in the car. This bearing note is leftover.";
export const BOOTH_BEARING_MISSING_COPY = "That stall packed up.";

export function stallBearingPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/bearing`;
}

export function stallBearingWritePath() {
  return "/stalls/bearing";
}

export type BoothBearingNote = {
  note: string;
  at: string;
};

export type BoothBearingMap = Record<string, BoothBearingNote>;

export type BoothBearingWriteResult =
  | { ok: true; map: BoothBearingMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothBearingMap };

const emptyMap: BoothBearingMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothBearingNote {
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

export function normalizeBoothBearingNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_BEARING_NOTE_MAX);
}

export function parseBoothBearing(raw: string | null | undefined): BoothBearingMap {
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
    const next: BoothBearingMap = {};
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
        note: normalizeBoothBearingNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothBearing(map: BoothBearingMap) {
  return JSON.stringify(map);
}

export function boothBearingCookieValue(map: BoothBearingMap): string {
  return serializeBoothBearing(map);
}

export const BOOTH_BEARING_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_BEARING_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_BEARING_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_BEARING_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothBearingStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothBearingFor(
  stallId: string,
  map: BoothBearingMap = emptyMap,
): BoothBearingNote | undefined {
  return map[stallId];
}

export function tapeBoothBearing(
  stall: Stall | undefined,
  map: BoothBearingMap,
  raw: string,
  at = new Date(),
): BoothBearingWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothBearingNote(raw);
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

export function clearBoothBearing(
  stall: Stall | undefined,
  map: BoothBearingMap,
): BoothBearingWriteResult {
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

export function mergeBoothBearingMaps(...maps: BoothBearingMap[]): BoothBearingMap {
  const next: BoothBearingMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothBearing(): BoothBearingMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothBearing(
      window.localStorage.getItem(BOOTH_BEARING_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothBearing(map: BoothBearingMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothBearing(map);
  try {
    window.localStorage.setItem(BOOTH_BEARING_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_BEARING_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_BEARING_CHANGED_EVENT));
}

export function subscribeBoothBearing(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_BEARING_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_BEARING_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_BEARING_CHANGED_EVENT, listener);
  };
}
