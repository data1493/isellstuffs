/**
 * I don't have a deck — spin it at home. The crate has no turntable.
 * Plays is I already spun it. Skip is the scratch. Walkers still ask
 * Sunday Crate to cue the LP. Not plays. Not skip.
 *
 * Never write `iss:plays-listing-ids`, `iss:skip-listing-ids`,
 * `iss:booth-seat`, `iss:booth-burn`, chip, hinge, tote, sold, packed,
 * or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-deck` is the client cork.
 * Cookie `iss-booth-deck` is the same JSON so stall, `/lot`, and `/deck` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_DECK_STORAGE_KEY = "iss:booth-deck";
export const BOOTH_DECK_COOKIE_NAME = "iss-booth-deck";
export const BOOTH_DECK_CHANGED_EVENT = "iss:booth-deck-changed";

export const BOOTH_DECK_NOTE_MAX = 140;

export const BOOTH_DECK_PAPER_LINE =
  "I don't have a deck. Spin it at home. Plays is I already spun it. Skip is the scratch. Not plays. Not skip.";
export const BOOTH_DECK_EMPTY_COPY =
  "The crate still cues. Nobody taped a deck note on this booth.";
export const BOOTH_DECK_EMPTY_TAPE =
  "Say you don't have a deck or leave the crate as a cue.";
export const BOOTH_DECK_PACKED_LEFTOVER =
  "The table went in the car. This deck note is leftover.";
export const BOOTH_DECK_MISSING_COPY = "That stall packed up.";

export function stallDeckPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/deck`;
}

export function stallDeckWritePath() {
  return "/stalls/deck";
}

export type BoothDeckNote = {
  note: string;
  at: string;
};

export type BoothDeckMap = Record<string, BoothDeckNote>;

export type BoothDeckWriteResult =
  | { ok: true; map: BoothDeckMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothDeckMap };

const emptyMap: BoothDeckMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothDeckNote {
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

export function normalizeBoothDeckNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_DECK_NOTE_MAX);
}

export function parseBoothDeck(raw: string | null | undefined): BoothDeckMap {
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
    const next: BoothDeckMap = {};
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
        note: normalizeBoothDeckNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothDeck(map: BoothDeckMap) {
  return JSON.stringify(map);
}

export function boothDeckCookieValue(map: BoothDeckMap): string {
  return serializeBoothDeck(map);
}

export const BOOTH_DECK_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_DECK_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_DECK_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_DECK_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothDeckStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothDeckFor(
  stallId: string,
  map: BoothDeckMap = emptyMap,
): BoothDeckNote | undefined {
  return map[stallId];
}

export function tapeBoothDeck(
  stall: Stall | undefined,
  map: BoothDeckMap,
  raw: string,
  at = new Date(),
): BoothDeckWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothDeckNote(raw);
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

export function clearBoothDeck(
  stall: Stall | undefined,
  map: BoothDeckMap,
): BoothDeckWriteResult {
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

export function mergeBoothDeckMaps(...maps: BoothDeckMap[]): BoothDeckMap {
  const next: BoothDeckMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothDeck(): BoothDeckMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothDeck(
      window.localStorage.getItem(BOOTH_DECK_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothDeck(map: BoothDeckMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothDeck(map);
  try {
    window.localStorage.setItem(BOOTH_DECK_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_DECK_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_DECK_CHANGED_EVENT));
}

export function subscribeBoothDeck(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_DECK_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_DECK_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_DECK_CHANGED_EVENT, listener);
  };
}
