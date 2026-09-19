/**
 * I don't have a wick — still a table. Still Half-Working.
 * Reflow is heat-the-joints. Tin is solder-the-copper. Spudger is nylon-pry.
 * Driver is Phillips. Loupe stays queued. Wrap stays wrap.
 * Walkers still want Half-Working to hand over a wick, or so they can
 * pull the fuse tin before they buy. I don't have a wick. Still a table.
 *
 * Never write `iss:booth-driver`, `iss:booth-spudger`, `iss:booth-loupe`,
 * `iss:reflow-listing-ids`, `iss:tin-listing-ids`, `iss:booth-caddy`,
 * `iss:booth-kit`, `iss:jumper-listing-ids`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-wick` is the client cork.
 * Cookie `iss-booth-wick` is the same JSON so stall, `/lot`, and `/wick` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_WICK_STORAGE_KEY = "iss:booth-wick";
export const BOOTH_WICK_COOKIE_NAME = "iss-booth-wick";
export const BOOTH_WICK_CHANGED_EVENT = "iss:booth-wick-changed";

export const BOOTH_WICK_NOTE_MAX = 140;

export const BOOTH_WICK_PAPER_LINE = "I don't have a wick. Still a table.";
export const BOOTH_WICK_EMPTY_COPY =
  "Nobody taped a wick note on this booth. Still a table.";
export const BOOTH_WICK_EMPTY_TAPE =
  "Say you don't have a wick or leave the table.";
export const BOOTH_WICK_PACKED_LEFTOVER =
  "The table went in the car. This wick note is leftover.";
export const BOOTH_WICK_MISSING_COPY = "That stall packed up.";

export function stallWickPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/wick`;
}

export function stallWickWritePath() {
  return "/stalls/wick";
}

export type BoothWickNote = {
  note: string;
  at: string;
};

export type BoothWickMap = Record<string, BoothWickNote>;

export type BoothWickWriteResult =
  | { ok: true; map: BoothWickMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothWickMap };

const emptyMap: BoothWickMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothWickNote {
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

export function normalizeBoothWickNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_WICK_NOTE_MAX);
}

export function parseBoothWick(raw: string | null | undefined): BoothWickMap {
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
    const next: BoothWickMap = {};
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
        note: normalizeBoothWickNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothWick(map: BoothWickMap) {
  return JSON.stringify(map);
}

export function boothWickCookieValue(map: BoothWickMap): string {
  return serializeBoothWick(map);
}

export const BOOTH_WICK_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_WICK_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_WICK_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_WICK_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothWickStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothWickFor(
  stallId: string,
  map: BoothWickMap = emptyMap,
): BoothWickNote | undefined {
  return map[stallId];
}

export function tapeBoothWick(
  stall: Stall | undefined,
  map: BoothWickMap,
  raw: string,
  at = new Date(),
): BoothWickWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothWickNote(raw);
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

export function clearBoothWick(
  stall: Stall | undefined,
  map: BoothWickMap,
): BoothWickWriteResult {
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

export function mergeBoothWickMaps(...maps: BoothWickMap[]): BoothWickMap {
  const next: BoothWickMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothWick(): BoothWickMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothWick(
      window.localStorage.getItem(BOOTH_WICK_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothWick(map: BoothWickMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothWick(map);
  try {
    window.localStorage.setItem(BOOTH_WICK_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_WICK_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_WICK_CHANGED_EVENT));
}

export function subscribeBoothWick(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_WICK_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_WICK_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_WICK_CHANGED_EVENT, listener);
  };
}
