/**
 * I don't have a preheater — still a driveway. Still no bench. Still Half-Working.
 * Tweezers is the grabber. Fume is the extractor. Variac is the dimmer.
 * Wick is the braid-sucker. Spudger is nylon-pry. Wrap stays wrap.
 * Hotplate / bottomheat / pcbheat are not this booth. Walkers still want
 * Half-Working to hand over a preheater, or so the cracked Game Boy joints
 * loosen without a shop tweezers. I don't have a preheater. Still a driveway.
 * Still no bench.
 *
 * Never write `iss:booth-tweezers`, `iss:booth-fume`, `iss:booth-variac`,
 * `iss:booth-loupe`, `iss:booth-comb`, `iss:booth-wick`, `iss:booth-spudger`,
 * `iss:booth-protractor`, `iss:booth-gobo`, `iss:booth-chalk`,
 * `iss:booth-wand`, `iss:booth-plumb`, `iss:booth-riser`, `iss:booth-feeler`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-preheater` is the client cork.
 * Cookie `iss-booth-preheater` is the same JSON so stall, `/lot`, and
 * `/preheater` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_PREHEATER_STORAGE_KEY = "iss:booth-preheater";
export const BOOTH_PREHEATER_COOKIE_NAME = "iss-booth-preheater";
export const BOOTH_PREHEATER_CHANGED_EVENT = "iss:booth-preheater-changed";

export const BOOTH_PREHEATER_NOTE_MAX = 140;

export const BOOTH_PREHEATER_PAPER_LINE =
  "I don't have a preheater. Still a driveway. Still no bench.";
export const BOOTH_PREHEATER_EMPTY_COPY =
  "Nobody taped a preheater note on this booth. Still a driveway.";
export const BOOTH_PREHEATER_EMPTY_TAPE =
  "Say you don't have a preheater or leave the table.";
export const BOOTH_PREHEATER_PACKED_LEFTOVER =
  "The table went in the car. This preheater note is leftover.";
export const BOOTH_PREHEATER_MISSING_COPY = "That stall packed up.";

export function stallPreheaterPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/preheater`;
}

export function stallPreheaterWritePath() {
  return "/stalls/preheater";
}

export type BoothPreheaterNote = {
  note: string;
  at: string;
};

export type BoothPreheaterMap = Record<string, BoothPreheaterNote>;

export type BoothPreheaterWriteResult =
  | { ok: true; map: BoothPreheaterMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothPreheaterMap };

const emptyMap: BoothPreheaterMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothPreheaterNote {
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

export function normalizeBoothPreheaterNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_PREHEATER_NOTE_MAX);
}

export function parseBoothPreheater(
  raw: string | null | undefined,
): BoothPreheaterMap {
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
    const next: BoothPreheaterMap = {};
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
        note: normalizeBoothPreheaterNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothPreheater(map: BoothPreheaterMap) {
  return JSON.stringify(map);
}

export function boothPreheaterCookieValue(map: BoothPreheaterMap): string {
  return serializeBoothPreheater(map);
}

export const BOOTH_PREHEATER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_PREHEATER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_PREHEATER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_PREHEATER_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothPreheaterStall(
  slugOrId: string,
): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothPreheaterFor(
  stallId: string,
  map: BoothPreheaterMap = emptyMap,
): BoothPreheaterNote | undefined {
  return map[stallId];
}

export function tapeBoothPreheater(
  stall: Stall | undefined,
  map: BoothPreheaterMap,
  raw: string,
  at = new Date(),
): BoothPreheaterWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothPreheaterNote(raw);
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

export function clearBoothPreheater(
  stall: Stall | undefined,
  map: BoothPreheaterMap,
): BoothPreheaterWriteResult {
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

export function mergeBoothPreheaterMaps(
  ...maps: BoothPreheaterMap[]
): BoothPreheaterMap {
  const next: BoothPreheaterMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothPreheater(): BoothPreheaterMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothPreheater(
      window.localStorage.getItem(BOOTH_PREHEATER_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothPreheater(map: BoothPreheaterMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothPreheater(map);
  try {
    window.localStorage.setItem(BOOTH_PREHEATER_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_PREHEATER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_PREHEATER_CHANGED_EVENT));
}

export function subscribeBoothPreheater(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_PREHEATER_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_PREHEATER_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_PREHEATER_CHANGED_EVENT, listener);
  };
}
