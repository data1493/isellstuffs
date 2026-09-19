/**
 * I don't burn a disc — pay and open the folder. I don't burn a CD-R.
 * Stick is no email. Plays is this Sharpie copy. Folder already delivers.
 * Walkers still ask Beats to burn a fresh disc. Not stick. Not plays.
 *
 * Never write `iss:booth-stick`, `iss:plays-listing-ids`, folder keys,
 * `iss:listing-stems`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-burn` is the client cork.
 * Cookie `iss-booth-burn` is the same JSON so stall, `/lot`, and `/burn` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_BURN_STORAGE_KEY = "iss:booth-burn";
export const BOOTH_BURN_COOKIE_NAME = "iss-booth-burn";
export const BOOTH_BURN_CHANGED_EVENT = "iss:booth-burn-changed";

export const BOOTH_BURN_NOTE_MAX = 140;

export const BOOTH_BURN_PAPER_LINE =
  "I don't burn a disc. Pay and open the folder. The leftover disc is the leftover disc. Not plays. Not stick.";
export const BOOTH_BURN_EMPTY_COPY =
  "The leftover disc stays leftover. Nobody taped a burn note on this booth.";
export const BOOTH_BURN_EMPTY_TAPE =
  "Say you don't burn or leave the leftover disc.";
export const BOOTH_BURN_PACKED_LEFTOVER =
  "The table went in the car. This burn note is leftover.";
export const BOOTH_BURN_MISSING_COPY = "That stall packed up.";

export function stallBurnPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/burn`;
}

export function stallBurnWritePath() {
  return "/stalls/burn";
}

export type BoothBurnNote = {
  note: string;
  at: string;
};

export type BoothBurnMap = Record<string, BoothBurnNote>;

export type BoothBurnWriteResult =
  | { ok: true; map: BoothBurnMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothBurnMap };

const emptyMap: BoothBurnMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothBurnNote {
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

export function normalizeBoothBurnNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_BURN_NOTE_MAX);
}

export function parseBoothBurn(raw: string | null | undefined): BoothBurnMap {
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
    const next: BoothBurnMap = {};
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
        note: normalizeBoothBurnNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothBurn(map: BoothBurnMap) {
  return JSON.stringify(map);
}

export function boothBurnCookieValue(map: BoothBurnMap): string {
  return serializeBoothBurn(map);
}

export const BOOTH_BURN_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_BURN_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_BURN_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_BURN_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothBurnStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothBurnFor(
  stallId: string,
  map: BoothBurnMap = emptyMap,
): BoothBurnNote | undefined {
  return map[stallId];
}

export function tapeBoothBurn(
  stall: Stall | undefined,
  map: BoothBurnMap,
  raw: string,
  at = new Date(),
): BoothBurnWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothBurnNote(raw);
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

export function clearBoothBurn(
  stall: Stall | undefined,
  map: BoothBurnMap,
): BoothBurnWriteResult {
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

export function mergeBoothBurnMaps(...maps: BoothBurnMap[]): BoothBurnMap {
  const next: BoothBurnMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothBurn(): BoothBurnMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothBurn(
      window.localStorage.getItem(BOOTH_BURN_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothBurn(map: BoothBurnMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothBurn(map);
  try {
    window.localStorage.setItem(BOOTH_BURN_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_BURN_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_BURN_CHANGED_EVENT));
}

export function subscribeBoothBurn(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_BURN_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_BURN_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_BURN_CHANGED_EVENT, listener);
  };
}
