/**
 * I don't flash — what boots is what boots. Not a flash desk.
 * Walkers still want Half-Working to flash a cleaner Tetris, or
 * "update the cart." I don't flash. What boots is what boots.
 *
 * Never write `iss:booth-meter`, `iss:booth-fix`, `iss:booth-claim`,
 * `iss:booth-shell`, `iss:dump-listing-ids`, `iss:glue-listing-ids`,
 * `iss:link-listing-ids`, `iss:booth-reload`, tote, sold, packed,
 * or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-flash` is the client cork.
 * Cookie `iss-booth-flash` is the same JSON so stall, `/lot`, and `/flash` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_FLASH_STORAGE_KEY = "iss:booth-flash";
export const BOOTH_FLASH_COOKIE_NAME = "iss-booth-flash";
export const BOOTH_FLASH_CHANGED_EVENT = "iss:booth-flash-changed";

export const BOOTH_FLASH_NOTE_MAX = 140;

export const BOOTH_FLASH_PAPER_LINE =
  "I don't flash. What boots is what boots. Not dump. Not a flash desk. Not meter.";
export const BOOTH_FLASH_EMPTY_COPY =
  "Nobody taped a flash note on this booth. What boots is what boots.";
export const BOOTH_FLASH_EMPTY_TAPE =
  "Say you don't flash or leave the table.";
export const BOOTH_FLASH_PACKED_LEFTOVER =
  "The table went in the car. This flash note is leftover.";
export const BOOTH_FLASH_MISSING_COPY = "That stall packed up.";

export function stallFlashPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/flash`;
}

export function stallFlashWritePath() {
  return "/stalls/flash";
}

export type BoothFlashNote = {
  note: string;
  at: string;
};

export type BoothFlashMap = Record<string, BoothFlashNote>;

export type BoothFlashWriteResult =
  | { ok: true; map: BoothFlashMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothFlashMap };

const emptyMap: BoothFlashMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothFlashNote {
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

export function normalizeBoothFlashNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_FLASH_NOTE_MAX);
}

export function parseBoothFlash(raw: string | null | undefined): BoothFlashMap {
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
    const next: BoothFlashMap = {};
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
        note: normalizeBoothFlashNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothFlash(map: BoothFlashMap) {
  return JSON.stringify(map);
}

export function boothFlashCookieValue(map: BoothFlashMap): string {
  return serializeBoothFlash(map);
}

export const BOOTH_FLASH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_FLASH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_FLASH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_FLASH_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothFlashStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothFlashFor(
  stallId: string,
  map: BoothFlashMap = emptyMap,
): BoothFlashNote | undefined {
  return map[stallId];
}

export function tapeBoothFlash(
  stall: Stall | undefined,
  map: BoothFlashMap,
  raw: string,
  at = new Date(),
): BoothFlashWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothFlashNote(raw);
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

export function clearBoothFlash(
  stall: Stall | undefined,
  map: BoothFlashMap,
): BoothFlashWriteResult {
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

export function mergeBoothFlashMaps(...maps: BoothFlashMap[]): BoothFlashMap {
  const next: BoothFlashMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothFlash(): BoothFlashMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothFlash(
      window.localStorage.getItem(BOOTH_FLASH_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothFlash(map: BoothFlashMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothFlash(map);
  try {
    window.localStorage.setItem(BOOTH_FLASH_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_FLASH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_FLASH_CHANGED_EVENT));
}

export function subscribeBoothFlash(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_FLASH_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_FLASH_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_FLASH_CHANGED_EVENT, listener);
  };
}
