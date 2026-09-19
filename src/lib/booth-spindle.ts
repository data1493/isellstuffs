/**
 * I don't have a spindle — still a jewel.
 * Burn is I don't burn a disc. Copy is I will not copy onto your stick.
 * Walkers still want Beats to hand a spindle, or stack the jewels.
 * I don't have a spindle. Still a jewel.
 *
 * Never write `iss:booth-burn`, `iss:booth-copy`, `iss:booth-player`,
 * `iss:booth-wifi`, `iss:booth-wrap`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-spindle` is the client cork.
 * Cookie `iss-booth-spindle` is the same JSON so stall, `/lot`, and `/spindle` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_SPINDLE_STORAGE_KEY = "iss:booth-spindle";
export const BOOTH_SPINDLE_COOKIE_NAME = "iss-booth-spindle";
export const BOOTH_SPINDLE_CHANGED_EVENT = "iss:booth-spindle-changed";

export const BOOTH_SPINDLE_NOTE_MAX = 140;

export const BOOTH_SPINDLE_PAPER_LINE =
  "I don't have a spindle. Still a jewel.";
export const BOOTH_SPINDLE_EMPTY_COPY =
  "Nobody taped a spindle note on this booth. Still a jewel.";
export const BOOTH_SPINDLE_EMPTY_TAPE =
  "Say you don't have a spindle or leave the table.";
export const BOOTH_SPINDLE_PACKED_LEFTOVER =
  "The table went in the car. This spindle note is leftover.";
export const BOOTH_SPINDLE_MISSING_COPY = "That stall packed up.";

export function stallSpindlePath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/spindle`;
}

export function stallSpindleWritePath() {
  return "/stalls/spindle";
}

export type BoothSpindleNote = {
  note: string;
  at: string;
};

export type BoothSpindleMap = Record<string, BoothSpindleNote>;

export type BoothSpindleWriteResult =
  | { ok: true; map: BoothSpindleMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothSpindleMap };

const emptyMap: BoothSpindleMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothSpindleNote {
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
  // `{ ok, map }` / `{ ok, listingIds }` 500 the stall if treated as notes.
  return typeof row.ok === "boolean" && ("map" in row || "listingIds" in row);
}

export function normalizeBoothSpindleNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_SPINDLE_NOTE_MAX);
}

export function parseBoothSpindle(raw: string | null | undefined): BoothSpindleMap {
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
    const next: BoothSpindleMap = {};
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
        note: normalizeBoothSpindleNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothSpindle(map: BoothSpindleMap) {
  return JSON.stringify(map);
}

export function boothSpindleCookieValue(map: BoothSpindleMap): string {
  return serializeBoothSpindle(map);
}

export const BOOTH_SPINDLE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_SPINDLE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_SPINDLE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_SPINDLE_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothSpindleStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothSpindleFor(
  stallId: string,
  map: BoothSpindleMap = emptyMap,
): BoothSpindleNote | undefined {
  return map[stallId];
}

export function tapeBoothSpindle(
  stall: Stall | undefined,
  map: BoothSpindleMap,
  raw: string,
  at = new Date(),
): BoothSpindleWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothSpindleNote(raw);
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

export function clearBoothSpindle(
  stall: Stall | undefined,
  map: BoothSpindleMap,
): BoothSpindleWriteResult {
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

export function mergeBoothSpindleMaps(...maps: BoothSpindleMap[]): BoothSpindleMap {
  const next: BoothSpindleMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothSpindle(): BoothSpindleMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothSpindle(
      window.localStorage.getItem(BOOTH_SPINDLE_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothSpindle(map: BoothSpindleMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothSpindle(map);
  try {
    window.localStorage.setItem(BOOTH_SPINDLE_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_SPINDLE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_SPINDLE_CHANGED_EVENT));
}

export function subscribeBoothSpindle(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_SPINDLE_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_SPINDLE_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_SPINDLE_CHANGED_EVENT, listener);
  };
}
