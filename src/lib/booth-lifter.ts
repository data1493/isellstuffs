/**
 * I don't have a lifter — still a crate. Still a skip. Still Sunday Crate.
 * Bone is the folder. Wand is the anti-static. Riser is the back-row lift.
 * Protractor is the two-point arc. Slipmat is the platter felt. Spindle is
 * the center pin. Wrap stays wrap. Walkers still want Crate to hand over a
 * lifter, or so the unnamed LP cues without a shop bone. I don't have a
 * lifter. Still a crate. Still a skip.
 *
 * Never write `iss:booth-bone`, `iss:booth-wand`, `iss:booth-riser`,
 * `iss:booth-protractor`, `iss:booth-slipmat`, `iss:booth-spindle`,
 * `iss:booth-caliper`, `iss:booth-feeler`, `iss:booth-gobo`,
 * `iss:booth-chalk`, `iss:booth-tweezers`, `iss:booth-variac`,
 * `iss:booth-fume`, `iss:booth-plumb`, `iss:booth-preheater`,
 * `iss:booth-torpedo`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-lifter` is the client cork.
 * Cookie `iss-booth-lifter` is the same JSON so stall, `/lot`, and `/lifter` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_LIFTER_STORAGE_KEY = "iss:booth-lifter";
export const BOOTH_LIFTER_COOKIE_NAME = "iss-booth-lifter";
export const BOOTH_LIFTER_CHANGED_EVENT = "iss:booth-lifter-changed";

export const BOOTH_LIFTER_NOTE_MAX = 140;

export const BOOTH_LIFTER_PAPER_LINE =
  "I don't have a lifter. Still a crate. Still a skip.";
export const BOOTH_LIFTER_EMPTY_COPY =
  "Nobody taped a lifter note on this booth. Still a crate.";
export const BOOTH_LIFTER_EMPTY_TAPE =
  "Say you don't have a lifter or leave the table.";
export const BOOTH_LIFTER_PACKED_LEFTOVER =
  "The table went in the car. This lifter note is leftover.";
export const BOOTH_LIFTER_MISSING_COPY = "That stall packed up.";

export function stallLifterPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/lifter`;
}

export function stallLifterWritePath() {
  return "/stalls/lifter";
}

export type BoothLifterNote = {
  note: string;
  at: string;
};

export type BoothLifterMap = Record<string, BoothLifterNote>;

export type BoothLifterWriteResult =
  | { ok: true; map: BoothLifterMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothLifterMap };

const emptyMap: BoothLifterMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothLifterNote {
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

export function normalizeBoothLifterNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_LIFTER_NOTE_MAX);
}

export function parseBoothLifter(raw: string | null | undefined): BoothLifterMap {
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
    const next: BoothLifterMap = {};
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
        note: normalizeBoothLifterNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothLifter(map: BoothLifterMap) {
  return JSON.stringify(map);
}

export function boothLifterCookieValue(map: BoothLifterMap): string {
  return serializeBoothLifter(map);
}

export const BOOTH_LIFTER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_LIFTER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_LIFTER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_LIFTER_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothLifterStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothLifterFor(
  stallId: string,
  map: BoothLifterMap = emptyMap,
): BoothLifterNote | undefined {
  return map[stallId];
}

export function tapeBoothLifter(
  stall: Stall | undefined,
  map: BoothLifterMap,
  raw: string,
  at = new Date(),
): BoothLifterWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothLifterNote(raw);
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

export function clearBoothLifter(
  stall: Stall | undefined,
  map: BoothLifterMap,
): BoothLifterWriteResult {
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

export function mergeBoothLifterMaps(...maps: BoothLifterMap[]): BoothLifterMap {
  const next: BoothLifterMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothLifter(): BoothLifterMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothLifter(
      window.localStorage.getItem(BOOTH_LIFTER_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothLifter(map: BoothLifterMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothLifter(map);
  try {
    window.localStorage.setItem(BOOTH_LIFTER_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_LIFTER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_LIFTER_CHANGED_EVENT));
}

export function subscribeBoothLifter(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_LIFTER_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_LIFTER_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_LIFTER_CHANGED_EVENT, listener);
  };
}
