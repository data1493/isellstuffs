/**
 * I don't have a fume — still a driveway. Still no bench. Still Half-Working.
 * Tweezers is the grabber. Variac is the dimmer. Loupe is the bench glass.
 * Comb is the cable dress. Wick / spudger stay on this aisle. Wrap stays wrap.
 * Walkers still want Half-Working to hand over a fume, or so the cracked
 * Game Boy solder lifts without a shop tweezers. I don't have a fume.
 * Still a driveway. Still no bench.
 *
 * Never write `iss:booth-tweezers`, `iss:booth-variac`, `iss:booth-loupe`,
 * `iss:booth-comb`, `iss:booth-wick`, `iss:booth-spudger`, `iss:booth-riser`,
 * `iss:booth-gobo`, `iss:booth-chalk`, `iss:booth-wand`, `iss:booth-plumb`,
 * `iss:booth-feeler`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-fume` is the client cork.
 * Cookie `iss-booth-fume` is the same JSON so stall, `/lot`, and `/fume` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_FUME_STORAGE_KEY = "iss:booth-fume";
export const BOOTH_FUME_COOKIE_NAME = "iss-booth-fume";
export const BOOTH_FUME_CHANGED_EVENT = "iss:booth-fume-changed";

export const BOOTH_FUME_NOTE_MAX = 140;

export const BOOTH_FUME_PAPER_LINE =
  "I don't have a fume. Still a driveway. Still no bench.";
export const BOOTH_FUME_EMPTY_COPY =
  "Nobody taped a fume note on this booth. Still a driveway.";
export const BOOTH_FUME_EMPTY_TAPE =
  "Say you don't have a fume or leave the table.";
export const BOOTH_FUME_PACKED_LEFTOVER =
  "The table went in the car. This fume note is leftover.";
export const BOOTH_FUME_MISSING_COPY = "That stall packed up.";

export function stallFumePath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/fume`;
}

export function stallFumeWritePath() {
  return "/stalls/fume";
}

export type BoothFumeNote = {
  note: string;
  at: string;
};

export type BoothFumeMap = Record<string, BoothFumeNote>;

export type BoothFumeWriteResult =
  | { ok: true; map: BoothFumeMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothFumeMap };

const emptyMap: BoothFumeMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothFumeNote {
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

export function normalizeBoothFumeNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_FUME_NOTE_MAX);
}

export function parseBoothFume(raw: string | null | undefined): BoothFumeMap {
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
    const next: BoothFumeMap = {};
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
        note: normalizeBoothFumeNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothFume(map: BoothFumeMap) {
  return JSON.stringify(map);
}

export function boothFumeCookieValue(map: BoothFumeMap): string {
  return serializeBoothFume(map);
}

export const BOOTH_FUME_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_FUME_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_FUME_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_FUME_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothFumeStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothFumeFor(
  stallId: string,
  map: BoothFumeMap = emptyMap,
): BoothFumeNote | undefined {
  return map[stallId];
}

export function tapeBoothFume(
  stall: Stall | undefined,
  map: BoothFumeMap,
  raw: string,
  at = new Date(),
): BoothFumeWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothFumeNote(raw);
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

export function clearBoothFume(
  stall: Stall | undefined,
  map: BoothFumeMap,
): BoothFumeWriteResult {
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

export function mergeBoothFumeMaps(...maps: BoothFumeMap[]): BoothFumeMap {
  const next: BoothFumeMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothFume(): BoothFumeMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothFume(
      window.localStorage.getItem(BOOTH_FUME_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothFume(map: BoothFumeMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothFume(map);
  try {
    window.localStorage.setItem(BOOTH_FUME_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_FUME_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_FUME_CHANGED_EVENT));
}

export function subscribeBoothFume(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_FUME_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_FUME_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_FUME_CHANGED_EVENT, listener);
  };
}
