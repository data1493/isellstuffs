/**
 * I don't reload — Gift Desk is paper. Face value.
 * Walkers still want the desk to add five, or "reload the leftover."
 * I don't reload. Not a wallet. Not a coupon. Not a second card.
 *
 * Never write `iss:gift-*`, redeem cookies, `iss:booth-flash`,
 * `iss:booth-break`, `iss:booth-meter`, tote, sold, packed,
 * or a second gift SKU.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-reload` is the client cork.
 * Cookie `iss-booth-reload` is the same JSON so stall, `/lot`, and `/reload` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_RELOAD_STORAGE_KEY = "iss:booth-reload";
export const BOOTH_RELOAD_COOKIE_NAME = "iss-booth-reload";
export const BOOTH_RELOAD_CHANGED_EVENT = "iss:booth-reload-changed";

export const BOOTH_RELOAD_NOTE_MAX = 140;

export const BOOTH_RELOAD_PAPER_LINE =
  "I don't reload. Face value. Not a wallet. Not a coupon. Not a second card.";
export const BOOTH_RELOAD_EMPTY_COPY =
  "Nobody taped a reload note on this booth. Face value.";
export const BOOTH_RELOAD_EMPTY_TAPE =
  "Say you don't reload or leave the table.";
export const BOOTH_RELOAD_PACKED_LEFTOVER =
  "The table went in the car. This reload note is leftover.";
export const BOOTH_RELOAD_MISSING_COPY = "That stall packed up.";

export function stallReloadPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/reload`;
}

export function stallReloadWritePath() {
  return "/stalls/reload";
}

export type BoothReloadNote = {
  note: string;
  at: string;
};

export type BoothReloadMap = Record<string, BoothReloadNote>;

export type BoothReloadWriteResult =
  | { ok: true; map: BoothReloadMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothReloadMap };

const emptyMap: BoothReloadMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothReloadNote {
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

export function normalizeBoothReloadNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_RELOAD_NOTE_MAX);
}

export function parseBoothReload(raw: string | null | undefined): BoothReloadMap {
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
    const next: BoothReloadMap = {};
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
        note: normalizeBoothReloadNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothReload(map: BoothReloadMap) {
  return JSON.stringify(map);
}

export function boothReloadCookieValue(map: BoothReloadMap): string {
  return serializeBoothReload(map);
}

export const BOOTH_RELOAD_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_RELOAD_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_RELOAD_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_RELOAD_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothReloadStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothReloadFor(
  stallId: string,
  map: BoothReloadMap = emptyMap,
): BoothReloadNote | undefined {
  return map[stallId];
}

export function tapeBoothReload(
  stall: Stall | undefined,
  map: BoothReloadMap,
  raw: string,
  at = new Date(),
): BoothReloadWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothReloadNote(raw);
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

export function clearBoothReload(
  stall: Stall | undefined,
  map: BoothReloadMap,
): BoothReloadWriteResult {
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

export function mergeBoothReloadMaps(...maps: BoothReloadMap[]): BoothReloadMap {
  const next: BoothReloadMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothReload(): BoothReloadMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothReload(
      window.localStorage.getItem(BOOTH_RELOAD_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothReload(map: BoothReloadMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothReload(map);
  try {
    window.localStorage.setItem(BOOTH_RELOAD_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_RELOAD_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_RELOAD_CHANGED_EVENT));
}

export function subscribeBoothReload(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_RELOAD_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_RELOAD_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_RELOAD_CHANGED_EVENT, listener);
  };
}
