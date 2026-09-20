/**
 * I don't have chalk — still a season. Still no lookbook. Still Closet.
 * Slicker is slick-the-peel. Pony is stitching-clamp. Last is cobbler-last.
 * Thimble is push-the-needle. Sew / awl / drift / tweezers stay neighbor paper.
 * Walkers still want Closet to hand over chalk, or so they can mark the peel
 * without Tuesday's drift pin. I don't have chalk. Still a season.
 * Still no lookbook.
 *
 * Never write `iss:booth-slicker`, `iss:booth-pony`, `iss:booth-last`,
 * `iss:booth-thimble`, `iss:booth-sew`, `iss:booth-awl`, `iss:booth-drift`,
 * `iss:booth-tweezers`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-chalk` is the client cork.
 * Cookie `iss-booth-chalk` is the same JSON so stall, `/lot`, and `/chalk` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_CHALK_STORAGE_KEY = "iss:booth-chalk";
export const BOOTH_CHALK_COOKIE_NAME = "iss-booth-chalk";
export const BOOTH_CHALK_CHANGED_EVENT = "iss:booth-chalk-changed";

export const BOOTH_CHALK_NOTE_MAX = 140;

export const BOOTH_CHALK_PAPER_LINE =
  "I don't have chalk. Still a season. Still no lookbook.";
export const BOOTH_CHALK_EMPTY_COPY =
  "Nobody taped a chalk note on this booth. Still a season.";
export const BOOTH_CHALK_EMPTY_TAPE =
  "Say you don't have chalk or leave the table.";
export const BOOTH_CHALK_PACKED_LEFTOVER =
  "The closet went in the car. This chalk note is leftover.";
export const BOOTH_CHALK_MISSING_COPY = "That stall packed up.";

export function stallChalkPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/chalk`;
}

export function stallChalkWritePath() {
  return "/stalls/chalk";
}

export type BoothChalkNote = {
  note: string;
  at: string;
};

export type BoothChalkMap = Record<string, BoothChalkNote>;

export type BoothChalkWriteResult =
  | { ok: true; map: BoothChalkMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothChalkMap };

const emptyMap: BoothChalkMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothChalkNote {
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

export function normalizeBoothChalkNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_CHALK_NOTE_MAX);
}

export function parseBoothChalk(raw: string | null | undefined): BoothChalkMap {
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
    const next: BoothChalkMap = {};
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
        note: normalizeBoothChalkNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothChalk(map: BoothChalkMap) {
  return JSON.stringify(map);
}

export function boothChalkCookieValue(map: BoothChalkMap): string {
  return serializeBoothChalk(map);
}

export const BOOTH_CHALK_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_CHALK_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_CHALK_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_CHALK_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothChalkStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothChalkFor(
  stallId: string,
  map: BoothChalkMap = emptyMap,
): BoothChalkNote | undefined {
  return map[stallId];
}

export function tapeBoothChalk(
  stall: Stall | undefined,
  map: BoothChalkMap,
  raw: string,
  at = new Date(),
): BoothChalkWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothChalkNote(raw);
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

export function clearBoothChalk(
  stall: Stall | undefined,
  map: BoothChalkMap,
): BoothChalkWriteResult {
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

export function mergeBoothChalkMaps(...maps: BoothChalkMap[]): BoothChalkMap {
  const next: BoothChalkMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothChalk(): BoothChalkMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothChalk(
      window.localStorage.getItem(BOOTH_CHALK_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothChalk(map: BoothChalkMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothChalk(map);
  try {
    window.localStorage.setItem(BOOTH_CHALK_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_CHALK_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_CHALK_CHANGED_EVENT));
}

export function subscribeBoothChalk(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_CHALK_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_CHALK_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_CHALK_CHANGED_EVENT, listener);
  };
}
