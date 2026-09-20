/**
 * I don't have a reflex — still a crate. Still a skip. Still Sunday Crate.
 * Bone is the folder. Footer is the isolation feet. Bearing is the spin.
 * Plinth is the base. Headshell is the cartridge mount. Cradle is the tonearm
 * rest. Lifter is the cue lift. Wand is the anti-static. Riser is the back-row
 * lift. Wrap stays wrap. Reflex here is a record clamp, not chrome.
 * Walkers still want Crate to hand over a reflex, or so the unnamed LP sits
 * shop-clamped without a shop footer. I don't have a reflex. Still a crate.
 * Still a skip.
 *
 * Never write `iss:booth-footer`, `iss:booth-bearing`, `iss:booth-plinth`,
 * `iss:booth-headshell`, `iss:booth-cradle`, `iss:booth-lifter`,
 * `iss:booth-bone`, `iss:booth-wand`, `iss:booth-riser`,
 * `iss:booth-protractor`, `iss:booth-slipmat`, `iss:booth-spindle`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-reflex` is the client cork.
 * Cookie `iss-booth-reflex` is the same JSON so stall, `/lot`, and `/reflex` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_REFLEX_STORAGE_KEY = "iss:booth-reflex";
export const BOOTH_REFLEX_COOKIE_NAME = "iss-booth-reflex";
export const BOOTH_REFLEX_CHANGED_EVENT = "iss:booth-reflex-changed";

export const BOOTH_REFLEX_NOTE_MAX = 140;

export const BOOTH_REFLEX_PAPER_LINE =
  "I don't have a reflex. Still a crate. Still a skip.";
export const BOOTH_REFLEX_EMPTY_COPY =
  "Nobody taped a reflex note on this booth. Still a crate.";
export const BOOTH_REFLEX_EMPTY_TAPE =
  "Say you don't have a reflex or leave the table.";
export const BOOTH_REFLEX_PACKED_LEFTOVER =
  "The table went in the car. This reflex note is leftover.";
export const BOOTH_REFLEX_MISSING_COPY = "That stall packed up.";

export function stallReflexPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/reflex`;
}

export function stallReflexWritePath() {
  return "/stalls/reflex";
}

export type BoothReflexNote = {
  note: string;
  at: string;
};

export type BoothReflexMap = Record<string, BoothReflexNote>;

export type BoothReflexWriteResult =
  | { ok: true; map: BoothReflexMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothReflexMap };

const emptyMap: BoothReflexMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothReflexNote {
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

export function normalizeBoothReflexNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_REFLEX_NOTE_MAX);
}

export function parseBoothReflex(raw: string | null | undefined): BoothReflexMap {
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
    const next: BoothReflexMap = {};
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
        note: normalizeBoothReflexNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothReflex(map: BoothReflexMap) {
  return JSON.stringify(map);
}

export function boothReflexCookieValue(map: BoothReflexMap): string {
  return serializeBoothReflex(map);
}

export const BOOTH_REFLEX_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_REFLEX_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_REFLEX_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_REFLEX_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothReflexStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothReflexFor(
  stallId: string,
  map: BoothReflexMap = emptyMap,
): BoothReflexNote | undefined {
  return map[stallId];
}

export function tapeBoothReflex(
  stall: Stall | undefined,
  map: BoothReflexMap,
  raw: string,
  at = new Date(),
): BoothReflexWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothReflexNote(raw);
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

export function clearBoothReflex(
  stall: Stall | undefined,
  map: BoothReflexMap,
): BoothReflexWriteResult {
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

export function mergeBoothReflexMaps(...maps: BoothReflexMap[]): BoothReflexMap {
  const next: BoothReflexMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothReflex(): BoothReflexMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothReflex(
      window.localStorage.getItem(BOOTH_REFLEX_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothReflex(map: BoothReflexMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothReflex(map);
  try {
    window.localStorage.setItem(BOOTH_REFLEX_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_REFLEX_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_REFLEX_CHANGED_EVENT));
}

export function subscribeBoothReflex(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_REFLEX_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_REFLEX_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_REFLEX_CHANGED_EVENT, listener);
  };
}
