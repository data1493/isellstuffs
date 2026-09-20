/**
 * I don't have a protractor — still a crate. Still a skip. Still Sunday Crate.
 * Bone is the folder. Wand is the anti-static. Riser is the back-row lift.
 * Slipmat is the platter felt. Spindle is the center pin. Wrap stays wrap.
 * Arc / two-point / null are not this booth. Walkers still want Crate to
 * hand over a protractor, or so the unnamed LP aligns without a shop wand.
 * I don't have a protractor. Still a crate. Still a skip.
 *
 * Never write `iss:booth-bone`, `iss:booth-wand`, `iss:booth-riser`,
 * `iss:booth-slipmat`, `iss:booth-spindle`, `iss:booth-torpedo`,
 * `iss:booth-gobo`, `iss:booth-chalk`, `iss:booth-tweezers`,
 * `iss:booth-variac`, `iss:booth-fume`, `iss:booth-plumb`,
 * `iss:booth-feeler`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-protractor` is the client cork.
 * Cookie `iss-booth-protractor` is the same JSON so stall, `/lot`, and
 * `/protractor` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_PROTRACTOR_STORAGE_KEY = "iss:booth-protractor";
export const BOOTH_PROTRACTOR_COOKIE_NAME = "iss-booth-protractor";
export const BOOTH_PROTRACTOR_CHANGED_EVENT = "iss:booth-protractor-changed";

export const BOOTH_PROTRACTOR_NOTE_MAX = 140;

export const BOOTH_PROTRACTOR_PAPER_LINE =
  "I don't have a protractor. Still a crate. Still a skip.";
export const BOOTH_PROTRACTOR_EMPTY_COPY =
  "Nobody taped a protractor note on this booth. Still a crate.";
export const BOOTH_PROTRACTOR_EMPTY_TAPE =
  "Say you don't have a protractor or leave the table.";
export const BOOTH_PROTRACTOR_PACKED_LEFTOVER =
  "The table went in the car. This protractor note is leftover.";
export const BOOTH_PROTRACTOR_MISSING_COPY = "That stall packed up.";

export function stallProtractorPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/protractor`;
}

export function stallProtractorWritePath() {
  return "/stalls/protractor";
}

export type BoothProtractorNote = {
  note: string;
  at: string;
};

export type BoothProtractorMap = Record<string, BoothProtractorNote>;

export type BoothProtractorWriteResult =
  | { ok: true; map: BoothProtractorMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothProtractorMap };

const emptyMap: BoothProtractorMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothProtractorNote {
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

export function normalizeBoothProtractorNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_PROTRACTOR_NOTE_MAX);
}

export function parseBoothProtractor(
  raw: string | null | undefined,
): BoothProtractorMap {
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
    const next: BoothProtractorMap = {};
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
        note: normalizeBoothProtractorNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothProtractor(map: BoothProtractorMap) {
  return JSON.stringify(map);
}

export function boothProtractorCookieValue(map: BoothProtractorMap): string {
  return serializeBoothProtractor(map);
}

export const BOOTH_PROTRACTOR_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_PROTRACTOR_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_PROTRACTOR_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_PROTRACTOR_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothProtractorStall(
  slugOrId: string,
): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothProtractorFor(
  stallId: string,
  map: BoothProtractorMap = emptyMap,
): BoothProtractorNote | undefined {
  return map[stallId];
}

export function tapeBoothProtractor(
  stall: Stall | undefined,
  map: BoothProtractorMap,
  raw: string,
  at = new Date(),
): BoothProtractorWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothProtractorNote(raw);
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

export function clearBoothProtractor(
  stall: Stall | undefined,
  map: BoothProtractorMap,
): BoothProtractorWriteResult {
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

export function mergeBoothProtractorMaps(
  ...maps: BoothProtractorMap[]
): BoothProtractorMap {
  const next: BoothProtractorMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothProtractor(): BoothProtractorMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothProtractor(
      window.localStorage.getItem(BOOTH_PROTRACTOR_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothProtractor(map: BoothProtractorMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothProtractor(map);
  try {
    window.localStorage.setItem(BOOTH_PROTRACTOR_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_PROTRACTOR_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_PROTRACTOR_CHANGED_EVENT));
}

export function subscribeBoothProtractor(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_PROTRACTOR_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_PROTRACTOR_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_PROTRACTOR_CHANGED_EVENT, listener);
  };
}
