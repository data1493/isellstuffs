/**
 * I don't have inners — grocery bag. Still a crate.
 * Shrink is cello. Poly is keep-on. Sleeve is the grocery bag.
 * Walkers still want Sunday Crate to hand out aftermarket sleeves,
 * or "give me inners." I don't have inners. Grocery bag.
 *
 * Never write `iss:booth-shrink`, `iss:booth-poly`, `iss:booth-name`,
 * `iss:booth-deck`, `iss:sleeve-listing-ids`, `iss:dust-listing-ids`,
 * `iss:warp-listing-ids`, `iss:booth-harp`, tote, sold, packed,
 * or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-inners` is the client cork.
 * Cookie `iss-booth-inners` is the same JSON so stall, `/lot`, and `/inners` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_INNERS_STORAGE_KEY = "iss:booth-inners";
export const BOOTH_INNERS_COOKIE_NAME = "iss-booth-inners";
export const BOOTH_INNERS_CHANGED_EVENT = "iss:booth-inners-changed";

export const BOOTH_INNERS_NOTE_MAX = 140;

export const BOOTH_INNERS_PAPER_LINE =
  "I don't have inners. Grocery bag. Still a crate. Not shrink. Not poly. Not sleeve.";
export const BOOTH_INNERS_EMPTY_COPY =
  "Grocery bag. Nobody taped an inners note on this booth.";
export const BOOTH_INNERS_EMPTY_TAPE =
  "Say you don't have inners or leave the table.";
export const BOOTH_INNERS_PACKED_LEFTOVER =
  "The table went in the car. This inners note is leftover.";
export const BOOTH_INNERS_MISSING_COPY = "That stall packed up.";

export function stallInnersPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/inners`;
}

export function stallInnersWritePath() {
  return "/stalls/inners";
}

export type BoothInnersNote = {
  note: string;
  at: string;
};

export type BoothInnersMap = Record<string, BoothInnersNote>;

export type BoothInnersWriteResult =
  | { ok: true; map: BoothInnersMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothInnersMap };

const emptyMap: BoothInnersMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothInnersNote {
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

export function normalizeBoothInnersNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_INNERS_NOTE_MAX);
}

export function parseBoothInners(raw: string | null | undefined): BoothInnersMap {
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
    const next: BoothInnersMap = {};
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
        note: normalizeBoothInnersNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothInners(map: BoothInnersMap) {
  return JSON.stringify(map);
}

export function boothInnersCookieValue(map: BoothInnersMap): string {
  return serializeBoothInners(map);
}

export const BOOTH_INNERS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_INNERS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_INNERS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_INNERS_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothInnersStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothInnersFor(
  stallId: string,
  map: BoothInnersMap = emptyMap,
): BoothInnersNote | undefined {
  return map[stallId];
}

export function tapeBoothInners(
  stall: Stall | undefined,
  map: BoothInnersMap,
  raw: string,
  at = new Date(),
): BoothInnersWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothInnersNote(raw);
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

export function clearBoothInners(
  stall: Stall | undefined,
  map: BoothInnersMap,
): BoothInnersWriteResult {
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

export function mergeBoothInnersMaps(...maps: BoothInnersMap[]): BoothInnersMap {
  const next: BoothInnersMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothInners(): BoothInnersMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothInners(
      window.localStorage.getItem(BOOTH_INNERS_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothInners(map: BoothInnersMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothInners(map);
  try {
    window.localStorage.setItem(BOOTH_INNERS_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_INNERS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_INNERS_CHANGED_EVENT));
}

export function subscribeBoothInners(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_INNERS_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_INNERS_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_INNERS_CHANGED_EVENT, listener);
  };
}
