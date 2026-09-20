/**
 * I don't have an eddy — still a crate. Still a skip. Still Sunday Crate.
 * Flywheel is the platter mass. Race is the bearing race. Thrust is the
 * bearing pad. Reflex is the record clamp. Footer is the isolation feet.
 * Bearing is the spin. Plinth is the base. Headshell is the cartridge mount.
 * Cradle is the tonearm rest. Lifter is the cue lift. Bone is the folder.
 * Wand is the anti-static. Riser is the back-row lift. Wrap stays wrap.
 * Eddy here is an eddy-current brake, not chrome.
 * Walkers still want Crate to hand over an eddy, or so the unnamed LP sits
 * shop-braked without a shop flywheel. I don't have an eddy. Still a crate.
 *
 * Never write `iss:booth-flywheel`, `iss:booth-race`, `iss:booth-thrust`,
 * `iss:booth-reflex`, `iss:booth-footer`, `iss:booth-bearing`,
 * `iss:booth-plinth`, `iss:booth-headshell`, `iss:booth-cradle`,
 * `iss:booth-lifter`, `iss:booth-bone`, `iss:booth-wand`, `iss:booth-riser`,
 * `iss:booth-protractor`, `iss:booth-slipmat`, `iss:booth-spindle`, tote,
 * sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-eddy` is the client cork.
 * Cookie `iss-booth-eddy` is the same JSON so stall, `/lot`, and
 * `/eddy` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_EDDY_STORAGE_KEY = "iss:booth-eddy";
export const BOOTH_EDDY_COOKIE_NAME = "iss-booth-eddy";
export const BOOTH_EDDY_CHANGED_EVENT = "iss:booth-eddy-changed";

export const BOOTH_EDDY_NOTE_MAX = 140;

export const BOOTH_EDDY_PAPER_LINE = "I don't have an eddy. Still a crate.";
export const BOOTH_EDDY_EMPTY_COPY =
  "Nobody taped an eddy note on this booth. Still a crate.";
export const BOOTH_EDDY_EMPTY_TAPE =
  "Say you don't have an eddy or leave the table.";
export const BOOTH_EDDY_PACKED_LEFTOVER =
  "The table went in the car. This eddy note is leftover.";
export const BOOTH_EDDY_MISSING_COPY = "That stall packed up.";

export function stallEddyPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/eddy`;
}

export function stallEddyWritePath() {
  return "/stalls/eddy";
}

export type BoothEddyNote = {
  note: string;
  at: string;
};

export type BoothEddyMap = Record<string, BoothEddyNote>;

export type BoothEddyWriteResult =
  | { ok: true; map: BoothEddyMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothEddyMap };

const emptyMap: BoothEddyMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothEddyNote {
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

export function normalizeBoothEddyNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_EDDY_NOTE_MAX);
}

export function parseBoothEddy(raw: string | null | undefined): BoothEddyMap {
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
    const next: BoothEddyMap = {};
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
        note: normalizeBoothEddyNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothEddy(map: BoothEddyMap) {
  return JSON.stringify(map);
}

export function boothEddyCookieValue(map: BoothEddyMap): string {
  return serializeBoothEddy(map);
}

export const BOOTH_EDDY_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_EDDY_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_EDDY_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_EDDY_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothEddyStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothEddyFor(
  stallId: string,
  map: BoothEddyMap = emptyMap,
): BoothEddyNote | undefined {
  return map[stallId];
}

export function tapeBoothEddy(
  stall: Stall | undefined,
  map: BoothEddyMap,
  raw: string,
  at = new Date(),
): BoothEddyWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothEddyNote(raw);
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

export function clearBoothEddy(
  stall: Stall | undefined,
  map: BoothEddyMap,
): BoothEddyWriteResult {
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

export function mergeBoothEddyMaps(...maps: BoothEddyMap[]): BoothEddyMap {
  const next: BoothEddyMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothEddy(): BoothEddyMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothEddy(
      window.localStorage.getItem(BOOTH_EDDY_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothEddy(map: BoothEddyMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothEddy(map);
  try {
    window.localStorage.setItem(BOOTH_EDDY_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_EDDY_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_EDDY_CHANGED_EVENT));
}

export function subscribeBoothEddy(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_EDDY_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_EDDY_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_EDDY_CHANGED_EVENT, listener);
  };
}
