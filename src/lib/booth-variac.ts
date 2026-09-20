/**
 * I don't have a variac — still a driveway. Still no bench. Still Half-Working.
 * Tweezers is the grabber. Loupe is the bench glass. Comb is the cable dress.
 * Wick is the braid-sucker. Spudger is nylon-pry. Wrap stays wrap.
 * Walkers still want Half-Working to hand over a variac, or so the cracked
 * Game Boy comes up slow without a shop tweezers. I don't have a variac.
 * Still a driveway. Still no bench.
 *
 * Never write `iss:booth-tweezers`, `iss:booth-loupe`, `iss:booth-comb`,
 * `iss:booth-wick`, `iss:booth-spudger`, `iss:booth-riser`,
 * `iss:booth-gobo`, `iss:booth-chalk`, `iss:booth-feeler`,
 * `iss:booth-bone`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-variac` is the client cork.
 * Cookie `iss-booth-variac` is the same JSON so stall, `/lot`, and `/variac` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_VARIAC_STORAGE_KEY = "iss:booth-variac";
export const BOOTH_VARIAC_COOKIE_NAME = "iss-booth-variac";
export const BOOTH_VARIAC_CHANGED_EVENT = "iss:booth-variac-changed";

export const BOOTH_VARIAC_NOTE_MAX = 140;

export const BOOTH_VARIAC_PAPER_LINE =
  "I don't have a variac. Still a driveway. Still no bench.";
export const BOOTH_VARIAC_EMPTY_COPY =
  "Nobody taped a variac note on this booth. Still a driveway.";
export const BOOTH_VARIAC_EMPTY_TAPE =
  "Say you don't have a variac or leave the table.";
export const BOOTH_VARIAC_PACKED_LEFTOVER =
  "The table went in the car. This variac note is leftover.";
export const BOOTH_VARIAC_MISSING_COPY = "That stall packed up.";

export function stallVariacPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/variac`;
}

export function stallVariacWritePath() {
  return "/stalls/variac";
}

export type BoothVariacNote = {
  note: string;
  at: string;
};

export type BoothVariacMap = Record<string, BoothVariacNote>;

export type BoothVariacWriteResult =
  | { ok: true; map: BoothVariacMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothVariacMap };

const emptyMap: BoothVariacMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothVariacNote {
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

export function normalizeBoothVariacNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_VARIAC_NOTE_MAX);
}

export function parseBoothVariac(raw: string | null | undefined): BoothVariacMap {
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
    const next: BoothVariacMap = {};
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
        note: normalizeBoothVariacNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothVariac(map: BoothVariacMap) {
  return JSON.stringify(map);
}

export function boothVariacCookieValue(map: BoothVariacMap): string {
  return serializeBoothVariac(map);
}

export const BOOTH_VARIAC_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_VARIAC_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_VARIAC_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_VARIAC_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothVariacStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothVariacFor(
  stallId: string,
  map: BoothVariacMap = emptyMap,
): BoothVariacNote | undefined {
  return map[stallId];
}

export function tapeBoothVariac(
  stall: Stall | undefined,
  map: BoothVariacMap,
  raw: string,
  at = new Date(),
): BoothVariacWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothVariacNote(raw);
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

export function clearBoothVariac(
  stall: Stall | undefined,
  map: BoothVariacMap,
): BoothVariacWriteResult {
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

export function mergeBoothVariacMaps(...maps: BoothVariacMap[]): BoothVariacMap {
  const next: BoothVariacMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothVariac(): BoothVariacMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothVariac(
      window.localStorage.getItem(BOOTH_VARIAC_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothVariac(map: BoothVariacMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothVariac(map);
  try {
    window.localStorage.setItem(BOOTH_VARIAC_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_VARIAC_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_VARIAC_CHANGED_EVENT));
}

export function subscribeBoothVariac(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_VARIAC_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_VARIAC_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_VARIAC_CHANGED_EVENT, listener);
  };
}
