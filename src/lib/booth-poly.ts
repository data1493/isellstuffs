/**
 * Keep the poly on — the crate stays sealed.
 * Ask is one sleeve. The crate still gets pulled.
 *
 * Never write `iss:ask-listing-ids`, `iss:booth-film`,
 * `iss:booth-stay`, `iss:booth-shade`, `iss:booth-kids`,
 * wrap, size, look, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-poly` is the client cork.
 * Cookie `iss-booth-poly` is the same JSON so stall, `/lot`, and `/poly` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_POLY_STORAGE_KEY = "iss:booth-poly";
export const BOOTH_POLY_COOKIE_NAME = "iss-booth-poly";
export const BOOTH_POLY_CHANGED_EVENT = "iss:booth-poly-changed";

export const BOOTH_POLY_NOTE_MAX = 140;

export const BOOTH_POLY_PAPER_LINE =
  "Keep the poly on. The crate stays sealed. Ask is one sleeve. The crate still gets pulled.";
export const BOOTH_POLY_EMPTY_COPY =
  "The crate is still open. Nobody taped poly on this booth.";
export const BOOTH_POLY_EMPTY_TAPE =
  "Write the poly note or leave the crate open.";
export const BOOTH_POLY_PACKED_LEFTOVER =
  "The table went in the car. This poly note is leftover.";
export const BOOTH_POLY_MISSING_COPY = "That stall packed up.";

export type BoothPolyNote = {
  note: string;
  at: string;
};

export type BoothPolyMap = Record<string, BoothPolyNote>;

export type BoothPolyWriteResult =
  | { ok: true; map: BoothPolyMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothPolyMap };

const emptyMap: BoothPolyMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothPolyNote {
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

export function normalizeBoothPolyNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_POLY_NOTE_MAX);
}

export function parseBoothPoly(raw: string | null | undefined): BoothPolyMap {
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
    const next: BoothPolyMap = {};
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
        note: normalizeBoothPolyNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothPoly(map: BoothPolyMap) {
  return JSON.stringify(map);
}

export function boothPolyCookieValue(map: BoothPolyMap): string {
  return serializeBoothPoly(map);
}

export const BOOTH_POLY_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_POLY_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_POLY_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_POLY_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothPolyStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothPolyFor(
  stallId: string,
  map: BoothPolyMap = emptyMap,
): BoothPolyNote | undefined {
  return map[stallId];
}

export function tapeBoothPoly(
  stall: Stall | undefined,
  map: BoothPolyMap,
  raw: string,
  at = new Date(),
): BoothPolyWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothPolyNote(raw);
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

export function clearBoothPoly(
  stall: Stall | undefined,
  map: BoothPolyMap,
): BoothPolyWriteResult {
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

export function mergeBoothPolyMaps(...maps: BoothPolyMap[]): BoothPolyMap {
  const next: BoothPolyMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothPoly(): BoothPolyMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothPoly(
      window.localStorage.getItem(BOOTH_POLY_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothPoly(map: BoothPolyMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothPoly(map);
  try {
    window.localStorage.setItem(BOOTH_POLY_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_POLY_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_POLY_CHANGED_EVENT));
}

export function subscribeBoothPoly(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_POLY_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_POLY_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_POLY_CHANGED_EVENT, listener);
  };
}
