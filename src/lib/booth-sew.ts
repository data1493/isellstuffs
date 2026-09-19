/**
 * I don't sew — I don't hem it. Take it as-is.
 * Wash is laundry paper. Size is the tag. Walkers still ask
 * Hall Closet to take a cuff in. Not wash. Not stay.
 *
 * Never write `iss:wash-listing-ids`, `iss:size-listing-ids`,
 * `iss:booth-stay`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-sew` is the client cork.
 * Cookie `iss-booth-sew` is the same JSON so stall, `/lot`, and `/sew` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_SEW_STORAGE_KEY = "iss:booth-sew";
export const BOOTH_SEW_COOKIE_NAME = "iss-booth-sew";
export const BOOTH_SEW_CHANGED_EVENT = "iss:booth-sew-changed";

export const BOOTH_SEW_NOTE_MAX = 140;

export const BOOTH_SEW_PAPER_LINE =
  "I don't sew. I don't hem it. Take it as-is. Wash is laundry paper. Size is the tag. Not wash. Not stay.";
export const BOOTH_SEW_EMPTY_COPY =
  "The cuff is still out. Nobody taped a sew note on this booth.";
export const BOOTH_SEW_EMPTY_TAPE =
  "Say you don't sew or leave the cuff on the table.";
export const BOOTH_SEW_PACKED_LEFTOVER =
  "The table went in the car. This sew note is leftover.";
export const BOOTH_SEW_MISSING_COPY = "That stall packed up.";

export function stallSewPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/sew`;
}

export function stallSewWritePath() {
  return "/stalls/sew";
}

export type BoothSewNote = {
  note: string;
  at: string;
};

export type BoothSewMap = Record<string, BoothSewNote>;

export type BoothSewWriteResult =
  | { ok: true; map: BoothSewMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothSewMap };

const emptyMap: BoothSewMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothSewNote {
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

export function normalizeBoothSewNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_SEW_NOTE_MAX);
}

export function parseBoothSew(raw: string | null | undefined): BoothSewMap {
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
    const next: BoothSewMap = {};
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
        note: normalizeBoothSewNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothSew(map: BoothSewMap) {
  return JSON.stringify(map);
}

export function boothSewCookieValue(map: BoothSewMap): string {
  return serializeBoothSew(map);
}

export const BOOTH_SEW_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_SEW_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_SEW_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_SEW_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothSewStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothSewFor(
  stallId: string,
  map: BoothSewMap = emptyMap,
): BoothSewNote | undefined {
  return map[stallId];
}

export function tapeBoothSew(
  stall: Stall | undefined,
  map: BoothSewMap,
  raw: string,
  at = new Date(),
): BoothSewWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothSewNote(raw);
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

export function clearBoothSew(
  stall: Stall | undefined,
  map: BoothSewMap,
): BoothSewWriteResult {
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

export function mergeBoothSewMaps(...maps: BoothSewMap[]): BoothSewMap {
  const next: BoothSewMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothSew(): BoothSewMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothSew(
      window.localStorage.getItem(BOOTH_SEW_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothSew(map: BoothSewMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothSew(map);
  try {
    window.localStorage.setItem(BOOTH_SEW_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_SEW_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_SEW_CHANGED_EVENT));
}

export function subscribeBoothSew(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_SEW_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_SEW_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_SEW_CHANGED_EVENT, listener);
  };
}
