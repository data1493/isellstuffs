/**
 * I wrap breakables — the mug still walks naked.
 * Yard sign is no-ship. Wrap is paper on that booth. Not shipping.
 *
 * Never write `iss:yard-sign`, `iss-here-handoffs`, `iss:free-box`,
 * smoke, cells, kids, film, poly, size, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-wrap` is the client cork.
 * Cookie `iss-booth-wrap` is the same JSON so stall, `/lot`, and `/wrap` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_WRAP_STORAGE_KEY = "iss:booth-wrap";
export const BOOTH_WRAP_COOKIE_NAME = "iss-booth-wrap";
export const BOOTH_WRAP_CHANGED_EVENT = "iss:booth-wrap-changed";

export const BOOTH_WRAP_NOTE_MAX = 140;

export const BOOTH_WRAP_PAPER_LINE =
  "I wrap breakables. The mug still walks naked. Not shipping. Not a yard sign.";
export const BOOTH_WRAP_EMPTY_COPY =
  "The mug still walks naked. Nobody taped wrap paper on this booth.";
export const BOOTH_WRAP_EMPTY_TAPE =
  "Write the wrap note or leave the mug naked.";
export const BOOTH_WRAP_PACKED_LEFTOVER =
  "The table went in the car. This wrap note is leftover.";
export const BOOTH_WRAP_MISSING_COPY = "That stall packed up.";

export type BoothWrapNote = {
  note: string;
  at: string;
};

export type BoothWrapMap = Record<string, BoothWrapNote>;

export type BoothWrapWriteResult =
  | { ok: true; map: BoothWrapMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothWrapMap };

const emptyMap: BoothWrapMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothWrapNote {
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

export function normalizeBoothWrapNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_WRAP_NOTE_MAX);
}

export function parseBoothWrap(raw: string | null | undefined): BoothWrapMap {
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
    const next: BoothWrapMap = {};
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
        note: normalizeBoothWrapNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothWrap(map: BoothWrapMap) {
  return JSON.stringify(map);
}

export function boothWrapCookieValue(map: BoothWrapMap): string {
  return serializeBoothWrap(map);
}

export const BOOTH_WRAP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_WRAP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_WRAP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_WRAP_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothWrapStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothWrapFor(
  stallId: string,
  map: BoothWrapMap = emptyMap,
): BoothWrapNote | undefined {
  return map[stallId];
}

export function tapeBoothWrap(
  stall: Stall | undefined,
  map: BoothWrapMap,
  raw: string,
  at = new Date(),
): BoothWrapWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothWrapNote(raw);
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

export function clearBoothWrap(
  stall: Stall | undefined,
  map: BoothWrapMap,
): BoothWrapWriteResult {
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

export function mergeBoothWrapMaps(...maps: BoothWrapMap[]): BoothWrapMap {
  const next: BoothWrapMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothWrap(): BoothWrapMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothWrap(
      window.localStorage.getItem(BOOTH_WRAP_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothWrap(map: BoothWrapMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothWrap(map);
  try {
    window.localStorage.setItem(BOOTH_WRAP_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_WRAP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_WRAP_CHANGED_EVENT));
}

export function subscribeBoothWrap(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_WRAP_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_WRAP_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_WRAP_CHANGED_EVENT, listener);
  };
}
