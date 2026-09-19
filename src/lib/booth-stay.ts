/**
 * Hangers stay — the rack is furniture on that booth.
 * Free is extras you can take. Hangers stay with the Closet.
 *
 * Never write `iss:free-box`, lost, look, share, with, scan, ask,
 * tote, sold, packed, or $0 SKUs. Not the cardboard pile.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-stay` is the client cork.
 * Cookie `iss-booth-stay` is the same JSON so stall, `/lot`, and `/stay` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_STAY_STORAGE_KEY = "iss:booth-stay";
export const BOOTH_STAY_COOKIE_NAME = "iss-booth-stay";
export const BOOTH_STAY_CHANGED_EVENT = "iss:booth-stay-changed";

export const BOOTH_STAY_NOTE_MAX = 140;

export const BOOTH_STAY_PAPER_LINE =
  "Hangers stay. The rack is furniture. Not the free box.";
export const BOOTH_STAY_EMPTY_COPY =
  "The rack is empty. Nobody taped hangers on this booth.";
export const BOOTH_STAY_EMPTY_TAPE =
  "Say what stays or leave the rack.";
export const BOOTH_STAY_PACKED_LEFTOVER =
  "The table went in the car. This stay note is leftover.";
export const BOOTH_STAY_MISSING_COPY = "That stall packed up.";

export type BoothStayNote = {
  note: string;
  at: string;
};

export type BoothStayMap = Record<string, BoothStayNote>;

export type BoothStayWriteResult =
  | { ok: true; map: BoothStayMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothStayMap };

const emptyMap: BoothStayMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothStayNote {
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

export function normalizeBoothStayNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_STAY_NOTE_MAX);
}

export function parseBoothStay(raw: string | null | undefined): BoothStayMap {
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
    const next: BoothStayMap = {};
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
        note: normalizeBoothStayNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothStay(map: BoothStayMap) {
  return JSON.stringify(map);
}

export function boothStayCookieValue(map: BoothStayMap): string {
  return serializeBoothStay(map);
}

export const BOOTH_STAY_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_STAY_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_STAY_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_STAY_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothStayStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothStayFor(
  stallId: string,
  map: BoothStayMap = emptyMap,
): BoothStayNote | undefined {
  return map[stallId];
}

export function tapeBoothStay(
  stall: Stall | undefined,
  map: BoothStayMap,
  raw: string,
  at = new Date(),
): BoothStayWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothStayNote(raw);
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

export function clearBoothStay(
  stall: Stall | undefined,
  map: BoothStayMap,
): BoothStayWriteResult {
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

export function mergeBoothStayMaps(...maps: BoothStayMap[]): BoothStayMap {
  const next: BoothStayMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothStay(): BoothStayMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothStay(
      window.localStorage.getItem(BOOTH_STAY_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothStay(map: BoothStayMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothStay(map);
  try {
    window.localStorage.setItem(BOOTH_STAY_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_STAY_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_STAY_CHANGED_EVENT));
}

export function subscribeBoothStay(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_STAY_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_STAY_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_STAY_CHANGED_EVENT, listener);
  };
}
