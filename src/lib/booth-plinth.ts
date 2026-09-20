/**
 * I don't have a plinth — still a crate. Still a skip. Still Sunday Crate.
 * Bone is the folder. Headshell is the cartridge mount. Cradle is the
 * tonearm rest. Lifter is the cue lift. Wand is the anti-static. Riser
 * is the back-row lift. Wrap stays wrap. Walkers still want Crate to
 * hand over a plinth, or so the unnamed LP sits shop-level without a
 * shop headshell. I don't have a plinth. Still a crate. Still a skip.
 *
 * Never write `iss:booth-headshell`, `iss:booth-cradle`, `iss:booth-lifter`,
 * `iss:booth-bone`, `iss:booth-wand`, `iss:booth-riser`,
 * `iss:booth-protractor`, `iss:booth-slipmat`, `iss:booth-spindle`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-plinth` is the client cork.
 * Cookie `iss-booth-plinth` is the same JSON so stall, `/lot`, and `/plinth` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_PLINTH_STORAGE_KEY = "iss:booth-plinth";
export const BOOTH_PLINTH_COOKIE_NAME = "iss-booth-plinth";
export const BOOTH_PLINTH_CHANGED_EVENT = "iss:booth-plinth-changed";

export const BOOTH_PLINTH_NOTE_MAX = 140;

export const BOOTH_PLINTH_PAPER_LINE =
  "I don't have a plinth. Still a crate. Still a skip.";
export const BOOTH_PLINTH_EMPTY_COPY =
  "Nobody taped a plinth note on this booth. Still a crate.";
export const BOOTH_PLINTH_EMPTY_TAPE =
  "Say you don't have a plinth or leave the table.";
export const BOOTH_PLINTH_PACKED_LEFTOVER =
  "The table went in the car. This plinth note is leftover.";
export const BOOTH_PLINTH_MISSING_COPY = "That stall packed up.";

export function stallPlinthPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/plinth`;
}

export function stallPlinthWritePath() {
  return "/stalls/plinth";
}

export type BoothPlinthNote = {
  note: string;
  at: string;
};

export type BoothPlinthMap = Record<string, BoothPlinthNote>;

export type BoothPlinthWriteResult =
  | { ok: true; map: BoothPlinthMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothPlinthMap };

const emptyMap: BoothPlinthMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothPlinthNote {
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

export function normalizeBoothPlinthNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_PLINTH_NOTE_MAX);
}

export function parseBoothPlinth(raw: string | null | undefined): BoothPlinthMap {
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
    const next: BoothPlinthMap = {};
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
        note: normalizeBoothPlinthNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothPlinth(map: BoothPlinthMap) {
  return JSON.stringify(map);
}

export function boothPlinthCookieValue(map: BoothPlinthMap): string {
  return serializeBoothPlinth(map);
}

export const BOOTH_PLINTH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_PLINTH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_PLINTH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_PLINTH_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothPlinthStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothPlinthFor(
  stallId: string,
  map: BoothPlinthMap = emptyMap,
): BoothPlinthNote | undefined {
  return map[stallId];
}

export function tapeBoothPlinth(
  stall: Stall | undefined,
  map: BoothPlinthMap,
  raw: string,
  at = new Date(),
): BoothPlinthWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothPlinthNote(raw);
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

export function clearBoothPlinth(
  stall: Stall | undefined,
  map: BoothPlinthMap,
): BoothPlinthWriteResult {
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

export function mergeBoothPlinthMaps(...maps: BoothPlinthMap[]): BoothPlinthMap {
  const next: BoothPlinthMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothPlinth(): BoothPlinthMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothPlinth(
      window.localStorage.getItem(BOOTH_PLINTH_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothPlinth(map: BoothPlinthMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothPlinth(map);
  try {
    window.localStorage.setItem(BOOTH_PLINTH_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_PLINTH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_PLINTH_CHANGED_EVENT));
}

export function subscribeBoothPlinth(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_PLINTH_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_PLINTH_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_PLINTH_CHANGED_EVENT, listener);
  };
}
