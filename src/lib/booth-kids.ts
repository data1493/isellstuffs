/**
 * Kids touch it, you buy it — if they pick it up, it walks.
 * Film is no photos. This is little hands on breakables.
 *
 * Never write `iss:look-listing-ids`, `iss:ask-listing-ids`,
 * `iss:booth-film`, scrap, sign, shade, stay, press, parts,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-kids` is the client cork.
 * Cookie `iss-booth-kids` is the same JSON so stall, `/lot`, and `/kids` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_KIDS_STORAGE_KEY = "iss:booth-kids";
export const BOOTH_KIDS_COOKIE_NAME = "iss-booth-kids";
export const BOOTH_KIDS_CHANGED_EVENT = "iss:booth-kids-changed";

export const BOOTH_KIDS_NOTE_MAX = 140;

export const BOOTH_KIDS_PAPER_LINE =
  "Kids touch it, you buy it. If they pick it up, it walks. Not look. Not a flyer.";
export const BOOTH_KIDS_EMPTY_COPY =
  "The breakables are still fair game. Nobody taped a kids note on this booth.";
export const BOOTH_KIDS_EMPTY_TAPE =
  "Write the kids note or leave the breakables.";
export const BOOTH_KIDS_PACKED_LEFTOVER =
  "The table went in the car. This kids note is leftover.";
export const BOOTH_KIDS_MISSING_COPY = "That stall packed up.";

export type BoothKidsNote = {
  note: string;
  at: string;
};

export type BoothKidsMap = Record<string, BoothKidsNote>;

export type BoothKidsWriteResult =
  | { ok: true; map: BoothKidsMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothKidsMap };

const emptyMap: BoothKidsMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothKidsNote {
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

export function normalizeBoothKidsNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_KIDS_NOTE_MAX);
}

export function parseBoothKids(raw: string | null | undefined): BoothKidsMap {
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
    const next: BoothKidsMap = {};
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
        note: normalizeBoothKidsNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothKids(map: BoothKidsMap) {
  return JSON.stringify(map);
}

export function boothKidsCookieValue(map: BoothKidsMap): string {
  return serializeBoothKids(map);
}

export const BOOTH_KIDS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_KIDS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_KIDS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_KIDS_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothKidsStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothKidsFor(
  stallId: string,
  map: BoothKidsMap = emptyMap,
): BoothKidsNote | undefined {
  return map[stallId];
}

export function tapeBoothKids(
  stall: Stall | undefined,
  map: BoothKidsMap,
  raw: string,
  at = new Date(),
): BoothKidsWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothKidsNote(raw);
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

export function clearBoothKids(
  stall: Stall | undefined,
  map: BoothKidsMap,
): BoothKidsWriteResult {
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

export function mergeBoothKidsMaps(...maps: BoothKidsMap[]): BoothKidsMap {
  const next: BoothKidsMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothKids(): BoothKidsMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothKids(
      window.localStorage.getItem(BOOTH_KIDS_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothKids(map: BoothKidsMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothKids(map);
  try {
    window.localStorage.setItem(BOOTH_KIDS_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_KIDS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_KIDS_CHANGED_EVENT));
}

export function subscribeBoothKids(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_KIDS_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_KIDS_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_KIDS_CHANGED_EVENT, listener);
  };
}
