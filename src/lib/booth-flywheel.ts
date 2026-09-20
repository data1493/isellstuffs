/**
 * I don't have a flywheel — still a crate. Still a skip. Still Sunday Crate.
 * Bone is the folder. Race is the bearing race. Thrust is the bearing pad.
 * Reflex is the record clamp. Footer is the isolation feet. Bearing is the
 * spin. Plinth is the base. Headshell is the cartridge mount. Cradle is the
 * tonearm rest. Lifter is the cue lift. Wand is the anti-static. Riser is
 * the back-row lift. Wrap stays wrap. Flywheel here is a platter flywheel,
 * not chrome.
 * Walkers still want Crate to hand over a flywheel, or so the unnamed LP
 * sits shop-flywheeled without a shop race. I don't have a flywheel. Still
 * a crate.
 *
 * Never write `iss:booth-race`, `iss:booth-thrust`, `iss:booth-reflex`,
 * `iss:booth-footer`, `iss:booth-bearing`, `iss:booth-plinth`,
 * `iss:booth-headshell`, `iss:booth-cradle`, `iss:booth-lifter`,
 * `iss:booth-bone`, `iss:booth-wand`, `iss:booth-riser`,
 * `iss:booth-protractor`, `iss:booth-slipmat`, `iss:booth-spindle`, tote,
 * sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-flywheel` is the client cork.
 * Cookie `iss-booth-flywheel` is the same JSON so stall, `/lot`, and
 * `/flywheel` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_FLYWHEEL_STORAGE_KEY = "iss:booth-flywheel";
export const BOOTH_FLYWHEEL_COOKIE_NAME = "iss-booth-flywheel";
export const BOOTH_FLYWHEEL_CHANGED_EVENT = "iss:booth-flywheel-changed";

export const BOOTH_FLYWHEEL_NOTE_MAX = 140;

export const BOOTH_FLYWHEEL_PAPER_LINE =
  "I don't have a flywheel. Still a crate.";
export const BOOTH_FLYWHEEL_EMPTY_COPY =
  "Nobody taped a flywheel note on this booth. Still a crate.";
export const BOOTH_FLYWHEEL_EMPTY_TAPE =
  "Say you don't have a flywheel or leave the table.";
export const BOOTH_FLYWHEEL_PACKED_LEFTOVER =
  "The table went in the car. This flywheel note is leftover.";
export const BOOTH_FLYWHEEL_MISSING_COPY = "That stall packed up.";

export function stallFlywheelPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/flywheel`;
}

export function stallFlywheelWritePath() {
  return "/stalls/flywheel";
}

export type BoothFlywheelNote = {
  note: string;
  at: string;
};

export type BoothFlywheelMap = Record<string, BoothFlywheelNote>;

export type BoothFlywheelWriteResult =
  | { ok: true; map: BoothFlywheelMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothFlywheelMap };

const emptyMap: BoothFlywheelMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothFlywheelNote {
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

export function normalizeBoothFlywheelNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_FLYWHEEL_NOTE_MAX);
}

export function parseBoothFlywheel(
  raw: string | null | undefined,
): BoothFlywheelMap {
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
    const next: BoothFlywheelMap = {};
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
        note: normalizeBoothFlywheelNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothFlywheel(map: BoothFlywheelMap) {
  return JSON.stringify(map);
}

export function boothFlywheelCookieValue(map: BoothFlywheelMap): string {
  return serializeBoothFlywheel(map);
}

export const BOOTH_FLYWHEEL_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_FLYWHEEL_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_FLYWHEEL_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_FLYWHEEL_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothFlywheelStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothFlywheelFor(
  stallId: string,
  map: BoothFlywheelMap = emptyMap,
): BoothFlywheelNote | undefined {
  return map[stallId];
}

export function tapeBoothFlywheel(
  stall: Stall | undefined,
  map: BoothFlywheelMap,
  raw: string,
  at = new Date(),
): BoothFlywheelWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothFlywheelNote(raw);
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

export function clearBoothFlywheel(
  stall: Stall | undefined,
  map: BoothFlywheelMap,
): BoothFlywheelWriteResult {
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

export function mergeBoothFlywheelMaps(
  ...maps: BoothFlywheelMap[]
): BoothFlywheelMap {
  const next: BoothFlywheelMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothFlywheel(): BoothFlywheelMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothFlywheel(
      window.localStorage.getItem(BOOTH_FLYWHEEL_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothFlywheel(map: BoothFlywheelMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothFlywheel(map);
  try {
    window.localStorage.setItem(BOOTH_FLYWHEEL_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_FLYWHEEL_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_FLYWHEEL_CHANGED_EVENT));
}

export function subscribeBoothFlywheel(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_FLYWHEEL_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_FLYWHEEL_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_FLYWHEEL_CHANGED_EVENT, listener);
  };
}
