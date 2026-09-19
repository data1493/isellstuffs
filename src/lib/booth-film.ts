/**
 * Don't photograph the tags — walkers still film every 3×5.
 * Look is a display piece. A flyer is a paid souvenir. Film is this booth.
 *
 * Never write `iss:look-listing-ids`, `iss:ask-listing-ids`,
 * `iss:booth-shade`, scrap, sign, pockets, press, parts,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-film` is the client cork.
 * Cookie `iss-booth-film` is the same JSON so stall, `/lot`, and `/film` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_FILM_STORAGE_KEY = "iss:booth-film";
export const BOOTH_FILM_COOKIE_NAME = "iss-booth-film";
export const BOOTH_FILM_CHANGED_EVENT = "iss:booth-film-changed";

export const BOOTH_FILM_NOTE_MAX = 140;

export const BOOTH_FILM_PAPER_LINE =
  "Don't photograph the tags. Walkers still film every 3×5. Not look. Not a flyer.";
export const BOOTH_FILM_EMPTY_COPY =
  "The tags are still fair game. Nobody taped a no-photos note on this booth.";
export const BOOTH_FILM_EMPTY_TAPE =
  "Write the no-photos note or leave the tags.";
export const BOOTH_FILM_PACKED_LEFTOVER =
  "The table went in the car. This no-photos note is leftover.";
export const BOOTH_FILM_MISSING_COPY = "That stall packed up.";

export type BoothFilmNote = {
  note: string;
  at: string;
};

export type BoothFilmMap = Record<string, BoothFilmNote>;

export type BoothFilmWriteResult =
  | { ok: true; map: BoothFilmMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothFilmMap };

const emptyMap: BoothFilmMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothFilmNote {
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

export function normalizeBoothFilmNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_FILM_NOTE_MAX);
}

export function parseBoothFilm(raw: string | null | undefined): BoothFilmMap {
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
    const next: BoothFilmMap = {};
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
        note: normalizeBoothFilmNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothFilm(map: BoothFilmMap) {
  return JSON.stringify(map);
}

export function boothFilmCookieValue(map: BoothFilmMap): string {
  return serializeBoothFilm(map);
}

export const BOOTH_FILM_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_FILM_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_FILM_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_FILM_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothFilmStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothFilmFor(
  stallId: string,
  map: BoothFilmMap = emptyMap,
): BoothFilmNote | undefined {
  return map[stallId];
}

export function tapeBoothFilm(
  stall: Stall | undefined,
  map: BoothFilmMap,
  raw: string,
  at = new Date(),
): BoothFilmWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothFilmNote(raw);
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

export function clearBoothFilm(
  stall: Stall | undefined,
  map: BoothFilmMap,
): BoothFilmWriteResult {
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

export function mergeBoothFilmMaps(...maps: BoothFilmMap[]): BoothFilmMap {
  const next: BoothFilmMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothFilm(): BoothFilmMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothFilm(
      window.localStorage.getItem(BOOTH_FILM_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothFilm(map: BoothFilmMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothFilm(map);
  try {
    window.localStorage.setItem(BOOTH_FILM_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_FILM_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_FILM_CHANGED_EVENT));
}

export function subscribeBoothFilm(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_FILM_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_FILM_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_FILM_CHANGED_EVENT, listener);
  };
}
