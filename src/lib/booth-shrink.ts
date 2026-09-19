/**
 * I don't shrink-wrap — poly stays if it is on.
 * Poly is keep the poly on. Wrap is newspaper on glass. Sleeve is
 * the grocery bag. Walkers still want Sunday Crate to shrink-wrap a
 * disc, or "make it look sealed." I don't shrink-wrap. Poly stays if
 * it is on. Not a shop. Not poly. Not wrap.
 *
 * Never write `iss:booth-poly`, `iss:booth-wrap`, `iss:booth-name`,
 * `iss:inside-listing-ids`, `iss:bake-listing-ids`, `iss:vg-listing-ids`,
 * `iss:remember-listing-ids`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-shrink` is the client cork.
 * Cookie `iss-booth-shrink` is the same JSON so stall, `/lot`, and `/shrink` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_SHRINK_STORAGE_KEY = "iss:booth-shrink";
export const BOOTH_SHRINK_COOKIE_NAME = "iss-booth-shrink";
export const BOOTH_SHRINK_CHANGED_EVENT = "iss:booth-shrink-changed";

export const BOOTH_SHRINK_NOTE_MAX = 140;

export const BOOTH_SHRINK_PAPER_LINE =
  "I don't shrink-wrap. Poly stays if it is on. Not a shop. Not poly. Not wrap.";
export const BOOTH_SHRINK_EMPTY_COPY =
  "Poly stays if it is on. Nobody taped a shrink note on this booth.";
export const BOOTH_SHRINK_EMPTY_TAPE =
  "Say you don't shrink-wrap or leave the table.";
export const BOOTH_SHRINK_PACKED_LEFTOVER =
  "The table went in the car. This shrink note is leftover.";
export const BOOTH_SHRINK_MISSING_COPY = "That stall packed up.";

export function stallShrinkPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/shrink`;
}

export function stallShrinkWritePath() {
  return "/stalls/shrink";
}

export type BoothShrinkNote = {
  note: string;
  at: string;
};

export type BoothShrinkMap = Record<string, BoothShrinkNote>;

export type BoothShrinkWriteResult =
  | { ok: true; map: BoothShrinkMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothShrinkMap };

const emptyMap: BoothShrinkMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothShrinkNote {
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

export function normalizeBoothShrinkNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_SHRINK_NOTE_MAX);
}

export function parseBoothShrink(raw: string | null | undefined): BoothShrinkMap {
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
    const next: BoothShrinkMap = {};
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
        note: normalizeBoothShrinkNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothShrink(map: BoothShrinkMap) {
  return JSON.stringify(map);
}

export function boothShrinkCookieValue(map: BoothShrinkMap): string {
  return serializeBoothShrink(map);
}

export const BOOTH_SHRINK_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_SHRINK_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_SHRINK_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_SHRINK_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothShrinkStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothShrinkFor(
  stallId: string,
  map: BoothShrinkMap = emptyMap,
): BoothShrinkNote | undefined {
  return map[stallId];
}

export function tapeBoothShrink(
  stall: Stall | undefined,
  map: BoothShrinkMap,
  raw: string,
  at = new Date(),
): BoothShrinkWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothShrinkNote(raw);
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

export function clearBoothShrink(
  stall: Stall | undefined,
  map: BoothShrinkMap,
): BoothShrinkWriteResult {
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

export function mergeBoothShrinkMaps(...maps: BoothShrinkMap[]): BoothShrinkMap {
  const next: BoothShrinkMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothShrink(): BoothShrinkMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothShrink(
      window.localStorage.getItem(BOOTH_SHRINK_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothShrink(map: BoothShrinkMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothShrink(map);
  try {
    window.localStorage.setItem(BOOTH_SHRINK_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_SHRINK_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_SHRINK_CHANGED_EVENT));
}

export function subscribeBoothShrink(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_SHRINK_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_SHRINK_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_SHRINK_CHANGED_EVENT, listener);
  };
}
