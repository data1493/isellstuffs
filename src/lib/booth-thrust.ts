/**
 * I don't have a thrust — still a crate. Still a skip. Still Sunday Crate.
 * Bone is the folder. Reflex is the record clamp. Footer is the isolation
 * feet. Bearing is the spin. Plinth is the base. Headshell is the cartridge
 * mount. Cradle is the tonearm rest. Lifter is the cue lift. Wand is the
 * anti-static. Riser is the back-row lift. Wrap stays wrap. Thrust here is
 * a bearing pad, not chrome.
 * Walkers still want Crate to hand over a thrust, or so the unnamed LP sits
 * shop-padded without a shop reflex. I don't have a thrust. Still a crate.
 *
 * Never write `iss:booth-reflex`, `iss:booth-footer`, `iss:booth-bearing`,
 * `iss:booth-plinth`, `iss:booth-headshell`, `iss:booth-cradle`,
 * `iss:booth-lifter`, `iss:booth-bone`, `iss:booth-wand`, `iss:booth-riser`,
 * `iss:booth-protractor`, `iss:booth-slipmat`, `iss:booth-spindle`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-thrust` is the client cork.
 * Cookie `iss-booth-thrust` is the same JSON so stall, `/lot`, and `/thrust` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_THRUST_STORAGE_KEY = "iss:booth-thrust";
export const BOOTH_THRUST_COOKIE_NAME = "iss-booth-thrust";
export const BOOTH_THRUST_CHANGED_EVENT = "iss:booth-thrust-changed";

export const BOOTH_THRUST_NOTE_MAX = 140;

export const BOOTH_THRUST_PAPER_LINE =
  "I don't have a thrust. Still a crate.";
export const BOOTH_THRUST_EMPTY_COPY =
  "Nobody taped a thrust note on this booth. Still a crate.";
export const BOOTH_THRUST_EMPTY_TAPE =
  "Say you don't have a thrust or leave the table.";
export const BOOTH_THRUST_PACKED_LEFTOVER =
  "The table went in the car. This thrust note is leftover.";
export const BOOTH_THRUST_MISSING_COPY = "That stall packed up.";

export function stallThrustPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/thrust`;
}

export function stallThrustWritePath() {
  return "/stalls/thrust";
}

export type BoothThrustNote = {
  note: string;
  at: string;
};

export type BoothThrustMap = Record<string, BoothThrustNote>;

export type BoothThrustWriteResult =
  | { ok: true; map: BoothThrustMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothThrustMap };

const emptyMap: BoothThrustMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothThrustNote {
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

export function normalizeBoothThrustNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_THRUST_NOTE_MAX);
}

export function parseBoothThrust(raw: string | null | undefined): BoothThrustMap {
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
    const next: BoothThrustMap = {};
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
        note: normalizeBoothThrustNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothThrust(map: BoothThrustMap) {
  return JSON.stringify(map);
}

export function boothThrustCookieValue(map: BoothThrustMap): string {
  return serializeBoothThrust(map);
}

export const BOOTH_THRUST_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_THRUST_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_THRUST_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_THRUST_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothThrustStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothThrustFor(
  stallId: string,
  map: BoothThrustMap = emptyMap,
): BoothThrustNote | undefined {
  return map[stallId];
}

export function tapeBoothThrust(
  stall: Stall | undefined,
  map: BoothThrustMap,
  raw: string,
  at = new Date(),
): BoothThrustWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothThrustNote(raw);
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

export function clearBoothThrust(
  stall: Stall | undefined,
  map: BoothThrustMap,
): BoothThrustWriteResult {
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

export function mergeBoothThrustMaps(...maps: BoothThrustMap[]): BoothThrustMap {
  const next: BoothThrustMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothThrust(): BoothThrustMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothThrust(
      window.localStorage.getItem(BOOTH_THRUST_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothThrust(map: BoothThrustMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothThrust(map);
  try {
    window.localStorage.setItem(BOOTH_THRUST_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_THRUST_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_THRUST_CHANGED_EVENT));
}

export function subscribeBoothThrust(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_THRUST_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_THRUST_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_THRUST_CHANGED_EVENT, listener);
  };
}
