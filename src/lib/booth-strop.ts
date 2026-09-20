/**
 * I don't have a strop — still a crate. Still a skip. Still Sunday Crate.
 * Last is cobbler-last. Pony is stitching-clamp. Thimble is push-the-needle.
 * Skive is thin-the-peel. Wrap stays wrap. Hone-strop / leather-strop are
 * not this booth. Snips stays Half-Working paper. Scrape / trap / pleat
 * stay listing paper. Walkers still want Sunday Crate to hand over a
 * strop, or so they can finish the peel without Closet's last. I don't
 * have a strop. Still a crate. Still a skip.
 *
 * Never write `iss:booth-last`, `iss:booth-pony`, `iss:booth-thimble`,
 * `iss:skive-listing-ids`, `iss:booth-snips`, `iss:booth-mallet`,
 * `iss:scrape-listing-ids`, `iss:trap-listing-ids`, `iss:pleat-listing-ids`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-strop` is the client cork.
 * Cookie `iss-booth-strop` is the same JSON so stall, `/lot`, and `/strop` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_STROP_STORAGE_KEY = "iss:booth-strop";
export const BOOTH_STROP_COOKIE_NAME = "iss-booth-strop";
export const BOOTH_STROP_CHANGED_EVENT = "iss:booth-strop-changed";

export const BOOTH_STROP_NOTE_MAX = 140;

export const BOOTH_STROP_PAPER_LINE =
  "I don't have a strop. Still a crate. Still a skip.";
export const BOOTH_STROP_EMPTY_COPY =
  "Nobody taped a strop note on this booth. Still a crate.";
export const BOOTH_STROP_EMPTY_TAPE =
  "Say you don't have a strop or leave the table.";
export const BOOTH_STROP_PACKED_LEFTOVER =
  "The table went in the car. This strop note is leftover.";
export const BOOTH_STROP_MISSING_COPY = "That stall packed up.";

export function stallStropPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/strop`;
}

export function stallStropWritePath() {
  return "/stalls/strop";
}

export type BoothStropNote = {
  note: string;
  at: string;
};

export type BoothStropMap = Record<string, BoothStropNote>;

export type BoothStropWriteResult =
  | { ok: true; map: BoothStropMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothStropMap };

const emptyMap: BoothStropMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothStropNote {
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
  // `{ ok, map }` / `{ ok: true }` / `{ ok, listingIds }` 500 the stall if treated as notes.
  return typeof row.ok === "boolean";
}

export function normalizeBoothStropNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_STROP_NOTE_MAX);
}

export function parseBoothStrop(raw: string | null | undefined): BoothStropMap {
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
    const next: BoothStropMap = {};
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
        note: normalizeBoothStropNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothStrop(map: BoothStropMap) {
  return JSON.stringify(map);
}

export function boothStropCookieValue(map: BoothStropMap): string {
  return serializeBoothStrop(map);
}

export const BOOTH_STROP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_STROP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_STROP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_STROP_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothStropStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothStropFor(
  stallId: string,
  map: BoothStropMap = emptyMap,
): BoothStropNote | undefined {
  return map[stallId];
}

export function tapeBoothStrop(
  stall: Stall | undefined,
  map: BoothStropMap,
  raw: string,
  at = new Date(),
): BoothStropWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothStropNote(raw);
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

export function clearBoothStrop(
  stall: Stall | undefined,
  map: BoothStropMap,
): BoothStropWriteResult {
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

export function mergeBoothStropMaps(...maps: BoothStropMap[]): BoothStropMap {
  const next: BoothStropMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothStrop(): BoothStropMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothStrop(
      window.localStorage.getItem(BOOTH_STROP_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothStrop(map: BoothStropMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothStrop(map);
  try {
    window.localStorage.setItem(BOOTH_STROP_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_STROP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_STROP_CHANGED_EVENT));
}

export function subscribeBoothStrop(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_STROP_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_STROP_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_STROP_CHANGED_EVENT, listener);
  };
}
