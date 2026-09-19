/**
 * I don't have a preamp — still a crate. Still a table.
 * Deck is no turntable. Slipmat is platter-felt. Player is Discman.
 * Walkers still want Sunday Crate to hand a preamp, or hear Side A.
 * I don't have a preamp. Still a crate. Still a table.
 *
 * Never write `iss:booth-deck`, `iss:booth-slipmat`, `iss:booth-brush`,
 * `iss:booth-player`, `iss:booth-spider`, `iss:puck-listing-ids`,
 * `iss:dolby-listing-ids`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-preamp` is the client cork.
 * Cookie `iss-booth-preamp` is the same JSON so stall, `/lot`, and `/preamp` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_PREAMP_STORAGE_KEY = "iss:booth-preamp";
export const BOOTH_PREAMP_COOKIE_NAME = "iss-booth-preamp";
export const BOOTH_PREAMP_CHANGED_EVENT = "iss:booth-preamp-changed";

export const BOOTH_PREAMP_NOTE_MAX = 140;

export const BOOTH_PREAMP_PAPER_LINE =
  "I don't have a preamp. Still a crate. Still a table.";
export const BOOTH_PREAMP_EMPTY_COPY =
  "Nobody taped a preamp note on this booth. Still a crate. Still a table.";
export const BOOTH_PREAMP_EMPTY_TAPE =
  "Say you don't have a preamp or leave the table.";
export const BOOTH_PREAMP_PACKED_LEFTOVER =
  "The table went in the car. This preamp note is leftover.";
export const BOOTH_PREAMP_MISSING_COPY = "That stall packed up.";

export function stallPreampPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/preamp`;
}

export function stallPreampWritePath() {
  return "/stalls/preamp";
}

export type BoothPreampNote = {
  note: string;
  at: string;
};

export type BoothPreampMap = Record<string, BoothPreampNote>;

export type BoothPreampWriteResult =
  | { ok: true; map: BoothPreampMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothPreampMap };

const emptyMap: BoothPreampMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothPreampNote {
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

export function normalizeBoothPreampNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_PREAMP_NOTE_MAX);
}

export function parseBoothPreamp(raw: string | null | undefined): BoothPreampMap {
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
    const next: BoothPreampMap = {};
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
        note: normalizeBoothPreampNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothPreamp(map: BoothPreampMap) {
  return JSON.stringify(map);
}

export function boothPreampCookieValue(map: BoothPreampMap): string {
  return serializeBoothPreamp(map);
}

export const BOOTH_PREAMP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_PREAMP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_PREAMP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_PREAMP_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothPreampStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothPreampFor(
  stallId: string,
  map: BoothPreampMap = emptyMap,
): BoothPreampNote | undefined {
  return map[stallId];
}

export function tapeBoothPreamp(
  stall: Stall | undefined,
  map: BoothPreampMap,
  raw: string,
  at = new Date(),
): BoothPreampWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothPreampNote(raw);
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

export function clearBoothPreamp(
  stall: Stall | undefined,
  map: BoothPreampMap,
): BoothPreampWriteResult {
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

export function mergeBoothPreampMaps(...maps: BoothPreampMap[]): BoothPreampMap {
  const next: BoothPreampMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothPreamp(): BoothPreampMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothPreamp(
      window.localStorage.getItem(BOOTH_PREAMP_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothPreamp(map: BoothPreampMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothPreamp(map);
  try {
    window.localStorage.setItem(BOOTH_PREAMP_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_PREAMP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_PREAMP_CHANGED_EVENT));
}

export function subscribeBoothPreamp(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_PREAMP_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_PREAMP_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_PREAMP_CHANGED_EVENT, listener);
  };
}
