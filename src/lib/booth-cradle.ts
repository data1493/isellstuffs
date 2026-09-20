/**
 * I don't have a cradle — still a crate. Still a skip. Still Sunday Crate.
 * Bone is the folder. Lifter is the cue lift. Wand is the anti-static.
 * Riser is the back-row lift. Protractor is the two-point arc. Slipmat is
 * the platter felt. Wrap stays wrap. Walkers still want Crate to hand over
 * a cradle, or so the unnamed LP rests without a shop bone. I don't have a
 * cradle. Still a crate. Still a skip.
 *
 * Never write `iss:booth-lifter`, `iss:booth-bone`, `iss:booth-wand`,
 * `iss:booth-riser`, `iss:booth-protractor`, `iss:booth-slipmat`,
 * `iss:booth-spindle`, `iss:booth-caliper`, `iss:booth-feeler`,
 * `iss:booth-gobo`, `iss:booth-chalk`, `iss:booth-tweezers`,
 * `iss:booth-variac`, `iss:booth-fume`, `iss:booth-plumb`,
 * `iss:booth-preheater`, `iss:booth-torpedo`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-cradle` is the client cork.
 * Cookie `iss-booth-cradle` is the same JSON so stall, `/lot`, and `/cradle` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_CRADLE_STORAGE_KEY = "iss:booth-cradle";
export const BOOTH_CRADLE_COOKIE_NAME = "iss-booth-cradle";
export const BOOTH_CRADLE_CHANGED_EVENT = "iss:booth-cradle-changed";

export const BOOTH_CRADLE_NOTE_MAX = 140;

export const BOOTH_CRADLE_PAPER_LINE =
  "I don't have a cradle. Still a crate. Still a skip.";
export const BOOTH_CRADLE_EMPTY_COPY =
  "Nobody taped a cradle note on this booth. Still a crate.";
export const BOOTH_CRADLE_EMPTY_TAPE =
  "Say you don't have a cradle or leave the table.";
export const BOOTH_CRADLE_PACKED_LEFTOVER =
  "The table went in the car. This cradle note is leftover.";
export const BOOTH_CRADLE_MISSING_COPY = "That stall packed up.";

export function stallCradlePath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/cradle`;
}

export function stallCradleWritePath() {
  return "/stalls/cradle";
}

export type BoothCradleNote = {
  note: string;
  at: string;
};

export type BoothCradleMap = Record<string, BoothCradleNote>;

export type BoothCradleWriteResult =
  | { ok: true; map: BoothCradleMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothCradleMap };

const emptyMap: BoothCradleMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothCradleNote {
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

export function normalizeBoothCradleNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_CRADLE_NOTE_MAX);
}

export function parseBoothCradle(raw: string | null | undefined): BoothCradleMap {
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
    const next: BoothCradleMap = {};
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
        note: normalizeBoothCradleNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothCradle(map: BoothCradleMap) {
  return JSON.stringify(map);
}

export function boothCradleCookieValue(map: BoothCradleMap): string {
  return serializeBoothCradle(map);
}

export const BOOTH_CRADLE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_CRADLE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_CRADLE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_CRADLE_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothCradleStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothCradleFor(
  stallId: string,
  map: BoothCradleMap = emptyMap,
): BoothCradleNote | undefined {
  return map[stallId];
}

export function tapeBoothCradle(
  stall: Stall | undefined,
  map: BoothCradleMap,
  raw: string,
  at = new Date(),
): BoothCradleWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothCradleNote(raw);
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

export function clearBoothCradle(
  stall: Stall | undefined,
  map: BoothCradleMap,
): BoothCradleWriteResult {
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

export function mergeBoothCradleMaps(...maps: BoothCradleMap[]): BoothCradleMap {
  const next: BoothCradleMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothCradle(): BoothCradleMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothCradle(
      window.localStorage.getItem(BOOTH_CRADLE_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothCradle(map: BoothCradleMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothCradle(map);
  try {
    window.localStorage.setItem(BOOTH_CRADLE_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_CRADLE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_CRADLE_CHANGED_EVENT));
}

export function subscribeBoothCradle(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_CRADLE_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_CRADLE_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_CRADLE_CHANGED_EVENT, listener);
  };
}
