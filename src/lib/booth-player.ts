/**
 * I don't have a player — still Sharpie. Still a table.
 * Copy is no USB. Burn is no burn-shop. Stick is no email.
 * Wifi is no cafe. Deck is the turntable. Walkers still want Beats
 * to hand a player, or "play BEATS 07 at the table."
 * I don't have a player. Still Sharpie. Still a table.
 *
 * Never write `iss:booth-copy`, `iss:booth-burn`, `iss:booth-stick`,
 * `iss:booth-wifi`, `iss:booth-deck`, `iss:master-listing-ids`,
 * `iss:norm-listing-ids`, `iss:hint-listing-ids`, `iss:rights-listing-ids`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-player` is the client cork.
 * Cookie `iss-booth-player` is the same JSON so stall, `/lot`, and `/player` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_PLAYER_STORAGE_KEY = "iss:booth-player";
export const BOOTH_PLAYER_COOKIE_NAME = "iss-booth-player";
export const BOOTH_PLAYER_CHANGED_EVENT = "iss:booth-player-changed";

export const BOOTH_PLAYER_NOTE_MAX = 140;

export const BOOTH_PLAYER_PAPER_LINE =
  "I don't have a player. Still Sharpie. Still a table. Not copy. Not a listen booth. Not wifi. Not deck.";
export const BOOTH_PLAYER_EMPTY_COPY =
  "Nobody taped a player note on this booth. Still Sharpie. Still a table.";
export const BOOTH_PLAYER_EMPTY_TAPE =
  "Say you don't have a player or leave the table.";
export const BOOTH_PLAYER_PACKED_LEFTOVER =
  "The table went in the car. This player note is leftover.";
export const BOOTH_PLAYER_MISSING_COPY = "That stall packed up.";

export function stallPlayerPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/player`;
}

export function stallPlayerWritePath() {
  return "/stalls/player";
}

export type BoothPlayerNote = {
  note: string;
  at: string;
};

export type BoothPlayerMap = Record<string, BoothPlayerNote>;

export type BoothPlayerWriteResult =
  | { ok: true; map: BoothPlayerMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothPlayerMap };

const emptyMap: BoothPlayerMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothPlayerNote {
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

function isWriteResultLiteral(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const row = value as Record<string, unknown>;
  // `{ ok, map }` / `{ ok, listingIds }` 500 the stall if treated as notes.
  return typeof row.ok === "boolean" && ("map" in row || "listingIds" in row);
}

export function normalizeBoothPlayerNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_PLAYER_NOTE_MAX);
}

export function parseBoothPlayer(raw: string | null | undefined): BoothPlayerMap {
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
    if (isWriteResultLiteral(parsed)) {
      return emptyMap;
    }
    const next: BoothPlayerMap = {};
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
        note: normalizeBoothPlayerNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothPlayer(map: BoothPlayerMap) {
  return JSON.stringify(map);
}

export function boothPlayerCookieValue(map: BoothPlayerMap): string {
  return serializeBoothPlayer(map);
}

export const BOOTH_PLAYER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_PLAYER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_PLAYER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_PLAYER_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothPlayerStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothPlayerFor(
  stallId: string,
  map: BoothPlayerMap = emptyMap,
): BoothPlayerNote | undefined {
  return map[stallId];
}

export function tapeBoothPlayer(
  stall: Stall | undefined,
  map: BoothPlayerMap,
  raw: string,
  at = new Date(),
): BoothPlayerWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothPlayerNote(raw);
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

export function clearBoothPlayer(
  stall: Stall | undefined,
  map: BoothPlayerMap,
): BoothPlayerWriteResult {
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

export function mergeBoothPlayerMaps(...maps: BoothPlayerMap[]): BoothPlayerMap {
  const next: BoothPlayerMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothPlayer(): BoothPlayerMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothPlayer(
      window.localStorage.getItem(BOOTH_PLAYER_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothPlayer(map: BoothPlayerMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothPlayer(map);
  try {
    window.localStorage.setItem(BOOTH_PLAYER_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_PLAYER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_PLAYER_CHANGED_EVENT));
}

export function subscribeBoothPlayer(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_PLAYER_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_PLAYER_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_PLAYER_CHANGED_EVENT, listener);
  };
}
