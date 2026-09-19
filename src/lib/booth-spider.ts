/**
 * I don't have a spider — still Side A. Still a crate.
 * Deck is no turntable. Needle is the walked stylus. Center is the hole.
 * Inners is no aftermarket sleeve. Walkers still want Sunday Crate to
 * hand a spider, or "play my 45." I don't have a spider. Still Side A.
 *
 * Never write `iss:booth-deck`, `iss:booth-name`, `iss:booth-inners`,
 * `iss:fill-listing-ids`, `iss:gum-listing-ids`, `iss:etch-listing-ids`,
 * `iss:radio-listing-ids`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-spider` is the client cork.
 * Cookie `iss-booth-spider` is the same JSON so stall, `/lot`, and `/spider` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_SPIDER_STORAGE_KEY = "iss:booth-spider";
export const BOOTH_SPIDER_COOKIE_NAME = "iss-booth-spider";
export const BOOTH_SPIDER_CHANGED_EVENT = "iss:booth-spider-changed";

export const BOOTH_SPIDER_NOTE_MAX = 140;

export const BOOTH_SPIDER_PAPER_LINE =
  "I don't have a spider. Still Side A. Still a crate. Not deck. Not a listen booth. Not inners.";
export const BOOTH_SPIDER_EMPTY_COPY =
  "Nobody taped a spider note on this booth. Still Side A.";
export const BOOTH_SPIDER_EMPTY_TAPE =
  "Say you don't have a spider or leave the table.";
export const BOOTH_SPIDER_PACKED_LEFTOVER =
  "The table went in the car. This spider note is leftover.";
export const BOOTH_SPIDER_MISSING_COPY = "That stall packed up.";

export function stallSpiderPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/spider`;
}

export function stallSpiderWritePath() {
  return "/stalls/spider";
}

export type BoothSpiderNote = {
  note: string;
  at: string;
};

export type BoothSpiderMap = Record<string, BoothSpiderNote>;

export type BoothSpiderWriteResult =
  | { ok: true; map: BoothSpiderMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothSpiderMap };

const emptyMap: BoothSpiderMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothSpiderNote {
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

export function normalizeBoothSpiderNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_SPIDER_NOTE_MAX);
}

export function parseBoothSpider(raw: string | null | undefined): BoothSpiderMap {
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
    const next: BoothSpiderMap = {};
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
        note: normalizeBoothSpiderNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothSpider(map: BoothSpiderMap) {
  return JSON.stringify(map);
}

export function boothSpiderCookieValue(map: BoothSpiderMap): string {
  return serializeBoothSpider(map);
}

export const BOOTH_SPIDER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_SPIDER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_SPIDER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_SPIDER_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothSpiderStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothSpiderFor(
  stallId: string,
  map: BoothSpiderMap = emptyMap,
): BoothSpiderNote | undefined {
  return map[stallId];
}

export function tapeBoothSpider(
  stall: Stall | undefined,
  map: BoothSpiderMap,
  raw: string,
  at = new Date(),
): BoothSpiderWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothSpiderNote(raw);
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

export function clearBoothSpider(
  stall: Stall | undefined,
  map: BoothSpiderMap,
): BoothSpiderWriteResult {
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

export function mergeBoothSpiderMaps(...maps: BoothSpiderMap[]): BoothSpiderMap {
  const next: BoothSpiderMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothSpider(): BoothSpiderMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothSpider(
      window.localStorage.getItem(BOOTH_SPIDER_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothSpider(map: BoothSpiderMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothSpider(map);
  try {
    window.localStorage.setItem(BOOTH_SPIDER_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_SPIDER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_SPIDER_CHANGED_EVENT));
}

export function subscribeBoothSpider(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_SPIDER_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_SPIDER_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_SPIDER_CHANGED_EVENT, listener);
  };
}
