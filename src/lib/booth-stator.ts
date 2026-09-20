/**
 * I don't have a stator — still a crate. Still a skip. Still Sunday Crate.
 * Eddy is the eddy-current brake. Flywheel is the platter mass. Race is the
 * bearing race. Thrust is the bearing pad. Reflex is the record clamp.
 * Footer is the isolation feet. Bearing is the spin. Plinth is the base.
 * Headshell is the cartridge mount. Cradle is the tonearm rest. Lifter is
 * the cue lift. Bone is the folder. Wand is the anti-static. Riser is the
 * back-row lift. Wrap stays wrap. Stator here is a motor stator, not chrome.
 * Walkers still want Crate to hand over a stator, or so the unnamed LP sits
 * shop-driven without a shop eddy. I don't have a stator. Still a crate.
 *
 * Never write `iss:booth-eddy`, `iss:booth-flywheel`, `iss:booth-race`,
 * `iss:booth-thrust`, `iss:booth-reflex`, `iss:booth-footer`,
 * `iss:booth-bearing`, `iss:booth-plinth`, `iss:booth-headshell`,
 * `iss:booth-cradle`, `iss:booth-lifter`, `iss:booth-bone`,
 * `iss:booth-wand`, `iss:booth-riser`, `iss:booth-protractor`,
 * `iss:booth-slipmat`, `iss:booth-spindle`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-stator` is the client cork.
 * Cookie `iss-booth-stator` is the same JSON so stall, `/lot`, and
 * `/stator` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_STATOR_STORAGE_KEY = "iss:booth-stator";
export const BOOTH_STATOR_COOKIE_NAME = "iss-booth-stator";
export const BOOTH_STATOR_CHANGED_EVENT = "iss:booth-stator-changed";

export const BOOTH_STATOR_NOTE_MAX = 140;

export const BOOTH_STATOR_PAPER_LINE =
  "I don't have a stator. Still a crate.";
export const BOOTH_STATOR_EMPTY_COPY =
  "Nobody taped a stator note on this booth. Still a crate.";
export const BOOTH_STATOR_EMPTY_TAPE =
  "Say you don't have a stator or leave the table.";
export const BOOTH_STATOR_PACKED_LEFTOVER =
  "The table went in the car. This stator note is leftover.";
export const BOOTH_STATOR_MISSING_COPY = "That stall packed up.";

export function stallStatorPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/stator`;
}

export function stallStatorWritePath() {
  return "/stalls/stator";
}

export type BoothStatorNote = {
  note: string;
  at: string;
};

export type BoothStatorMap = Record<string, BoothStatorNote>;

export type BoothStatorWriteResult =
  | { ok: true; map: BoothStatorMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothStatorMap };

const emptyMap: BoothStatorMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothStatorNote {
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

export function normalizeBoothStatorNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_STATOR_NOTE_MAX);
}

export function parseBoothStator(
  raw: string | null | undefined,
): BoothStatorMap {
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
    const next: BoothStatorMap = {};
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
        note: normalizeBoothStatorNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothStator(map: BoothStatorMap) {
  return JSON.stringify(map);
}

export function boothStatorCookieValue(map: BoothStatorMap): string {
  return serializeBoothStator(map);
}

export const BOOTH_STATOR_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_STATOR_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_STATOR_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_STATOR_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothStatorStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothStatorFor(
  stallId: string,
  map: BoothStatorMap = emptyMap,
): BoothStatorNote | undefined {
  return map[stallId];
}

export function tapeBoothStator(
  stall: Stall | undefined,
  map: BoothStatorMap,
  raw: string,
  at = new Date(),
): BoothStatorWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothStatorNote(raw);
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

export function clearBoothStator(
  stall: Stall | undefined,
  map: BoothStatorMap,
): BoothStatorWriteResult {
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

export function mergeBoothStatorMaps(
  ...maps: BoothStatorMap[]
): BoothStatorMap {
  const next: BoothStatorMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothStator(): BoothStatorMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothStator(
      window.localStorage.getItem(BOOTH_STATOR_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothStator(map: BoothStatorMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothStator(map);
  try {
    window.localStorage.setItem(BOOTH_STATOR_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_STATOR_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_STATOR_CHANGED_EVENT));
}

export function subscribeBoothStator(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_STATOR_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_STATOR_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_STATOR_CHANGED_EVENT, listener);
  };
}
