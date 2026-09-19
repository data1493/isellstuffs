/**
 * Moved two spots — a gravel note on that booth.
 * A truck takes the dirt and walkers still go to last week’s spot.
 * Same booth. New gravel. Not a seventh stall. Not new hours. Not rain.
 *
 * Never write `iss:packed-stall-ids`, `iss:weekend-hours`, or `iss:back-soon`.
 * Never write tote / sold / garage / here / scrap / tape / free / stash keys.
 * Not `/walk`. Not new hours. Not packed. Not rain.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:moved-spot` is the client cork.
 * Cookie `iss-moved-spot` is the same JSON so stall, `/lot`, and `/spot` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const MOVED_SPOT_STORAGE_KEY = "iss:moved-spot";
export const MOVED_SPOT_COOKIE_NAME = "iss-moved-spot";
export const MOVED_SPOT_CHANGED_EVENT = "iss:moved-spot-changed";

export const MOVED_SPOT_NOTE_MAX = 140;

export const MOVED_SPOT_PAPER_LINE =
  "Moved two spots. Same booth. New gravel.";
export const MOVED_SPOT_EMPTY_COPY = "Still on last week’s dirt.";
export const MOVED_SPOT_EMPTY_TAPE =
  "Say where you moved or leave last week’s spot.";
export const MOVED_SPOT_PACKED_LEFTOVER =
  "The table went in the car. This gravel note is leftover.";
export const MOVED_SPOT_MISSING_COPY = "That stall packed up.";

export type MovedSpotNote = {
  note: string;
  at: string;
};

export type MovedSpotMap = Record<string, MovedSpotNote>;

export type MovedSpotWriteResult =
  | { ok: true; map: MovedSpotMap }
  | { ok: false; reason: "missing" | "empty"; map: MovedSpotMap };

const emptyMap: MovedSpotMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is MovedSpotNote {
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

export function normalizeMovedSpotNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, MOVED_SPOT_NOTE_MAX);
}

export function parseMovedSpot(raw: string | null | undefined): MovedSpotMap {
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
    const next: MovedSpotMap = {};
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
        note: normalizeMovedSpotNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeMovedSpot(map: MovedSpotMap) {
  return JSON.stringify(map);
}

export function movedSpotCookieValue(map: MovedSpotMap): string {
  return serializeMovedSpot(map);
}

export const MOVED_SPOT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${MOVED_SPOT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(MOVED_SPOT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(MOVED_SPOT_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveMovedSpotStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function movedSpotFor(
  stallId: string,
  map: MovedSpotMap = emptyMap,
): MovedSpotNote | undefined {
  return map[stallId];
}

export function tapeMovedSpot(
  stall: Stall | undefined,
  map: MovedSpotMap,
  raw: string,
  at = new Date(),
): MovedSpotWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeMovedSpotNote(raw);
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

export function clearMovedSpot(
  stall: Stall | undefined,
  map: MovedSpotMap,
): MovedSpotWriteResult {
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

export function mergeMovedSpotMaps(...maps: MovedSpotMap[]): MovedSpotMap {
  const next: MovedSpotMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readMovedSpot(): MovedSpotMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseMovedSpot(
      window.localStorage.getItem(MOVED_SPOT_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeMovedSpot(map: MovedSpotMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeMovedSpot(map);
  try {
    window.localStorage.setItem(MOVED_SPOT_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${MOVED_SPOT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(MOVED_SPOT_CHANGED_EVENT));
}

export function subscribeMovedSpot(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === MOVED_SPOT_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(MOVED_SPOT_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(MOVED_SPOT_CHANGED_EVENT, listener);
  };
}
