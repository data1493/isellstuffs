/**
 * I don't have snips — still a driveway. Still a tangle. Still Half-Working.
 * Wick is desolder-braid. Spudger is nylon-pry. Flux is rosin. Tin is solder.
 * Driver is Phillips. Wrap stays wrap. Dikes / flush are not this booth.
 * Darn / mask / pinch stay listing paper. Mallet stays Tuesday paper.
 * Walkers still want Half-Working to hand over snips, or so they can
 * flush-cut the USB without a dike. I don't have snips. Still a driveway.
 * Still a tangle.
 *
 * Never write `iss:booth-wick`, `iss:booth-spudger`, `iss:booth-driver`,
 * `iss:booth-mallet`, `iss:flux-listing-ids`, `iss:tin-listing-ids`,
 * `iss:darn-listing-ids`, `iss:mask-listing-ids`, `iss:pinch-listing-ids`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-snips` is the client cork.
 * Cookie `iss-booth-snips` is the same JSON so stall, `/lot`, and `/snips` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_SNIPS_STORAGE_KEY = "iss:booth-snips";
export const BOOTH_SNIPS_COOKIE_NAME = "iss-booth-snips";
export const BOOTH_SNIPS_CHANGED_EVENT = "iss:booth-snips-changed";

export const BOOTH_SNIPS_NOTE_MAX = 140;

export const BOOTH_SNIPS_PAPER_LINE =
  "I don't have snips. Still a driveway. Still a tangle.";
export const BOOTH_SNIPS_EMPTY_COPY =
  "Nobody taped a snips note on this booth. Still a driveway.";
export const BOOTH_SNIPS_EMPTY_TAPE =
  "Say you don't have snips or leave the driveway.";
export const BOOTH_SNIPS_PACKED_LEFTOVER =
  "The table went in the car. This snips note is leftover.";
export const BOOTH_SNIPS_MISSING_COPY = "That stall packed up.";

export function stallSnipsPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/snips`;
}

export function stallSnipsWritePath() {
  return "/stalls/snips";
}

export type BoothSnipsNote = {
  note: string;
  at: string;
};

export type BoothSnipsMap = Record<string, BoothSnipsNote>;

export type BoothSnipsWriteResult =
  | { ok: true; map: BoothSnipsMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothSnipsMap };

const emptyMap: BoothSnipsMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothSnipsNote {
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

export function normalizeBoothSnipsNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_SNIPS_NOTE_MAX);
}

export function parseBoothSnips(raw: string | null | undefined): BoothSnipsMap {
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
    const next: BoothSnipsMap = {};
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
        note: normalizeBoothSnipsNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothSnips(map: BoothSnipsMap) {
  return JSON.stringify(map);
}

export function boothSnipsCookieValue(map: BoothSnipsMap): string {
  return serializeBoothSnips(map);
}

export const BOOTH_SNIPS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_SNIPS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_SNIPS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_SNIPS_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothSnipsStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothSnipsFor(
  stallId: string,
  map: BoothSnipsMap = emptyMap,
): BoothSnipsNote | undefined {
  return map[stallId];
}

export function tapeBoothSnips(
  stall: Stall | undefined,
  map: BoothSnipsMap,
  raw: string,
  at = new Date(),
): BoothSnipsWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothSnipsNote(raw);
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

export function clearBoothSnips(
  stall: Stall | undefined,
  map: BoothSnipsMap,
): BoothSnipsWriteResult {
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

export function mergeBoothSnipsMaps(...maps: BoothSnipsMap[]): BoothSnipsMap {
  const next: BoothSnipsMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothSnips(): BoothSnipsMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothSnips(
      window.localStorage.getItem(BOOTH_SNIPS_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothSnips(map: BoothSnipsMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothSnips(map);
  try {
    window.localStorage.setItem(BOOTH_SNIPS_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_SNIPS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_SNIPS_CHANGED_EVENT));
}

export function subscribeBoothSnips(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_SNIPS_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_SNIPS_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_SNIPS_CHANGED_EVENT, listener);
  };
}
