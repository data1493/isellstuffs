/**
 * I don't have a caliper — still a table. Still Tuesday.
 * Square is try-square. Clamp is C-clamp. Kit is assemble. Bush is the lamp bushing.
 * Walkers still want Tuesday to hand over a caliper, or so they can measure
 * the shade ring. I don't have a caliper. Still a table.
 *
 * Never write `iss:booth-square`, `iss:booth-clamp`, `iss:booth-kit`,
 * `iss:booth-jig`, `iss:booth-last`, `iss:booth-wick`, `iss:bush-listing-ids`,
 * `iss:swage-listing-ids`, `iss:preflight-listing-ids`, `iss:rinse-listing-ids`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-caliper` is the client cork.
 * Cookie `iss-booth-caliper` is the same JSON so stall, `/lot`, and `/caliper` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_CALIPER_STORAGE_KEY = "iss:booth-caliper";
export const BOOTH_CALIPER_COOKIE_NAME = "iss-booth-caliper";
export const BOOTH_CALIPER_CHANGED_EVENT = "iss:booth-caliper-changed";

export const BOOTH_CALIPER_NOTE_MAX = 140;

export const BOOTH_CALIPER_PAPER_LINE =
  "I don't have a caliper. Still a table.";
export const BOOTH_CALIPER_EMPTY_COPY =
  "Nobody taped a caliper note on this booth. Still a table.";
export const BOOTH_CALIPER_EMPTY_TAPE =
  "Say you don't have a caliper or leave the table.";
export const BOOTH_CALIPER_PACKED_LEFTOVER =
  "The table went in the car. This caliper note is leftover.";
export const BOOTH_CALIPER_MISSING_COPY = "That stall packed up.";

export function stallCaliperPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/caliper`;
}

export function stallCaliperWritePath() {
  return "/stalls/caliper";
}

export type BoothCaliperNote = {
  note: string;
  at: string;
};

export type BoothCaliperMap = Record<string, BoothCaliperNote>;

export type BoothCaliperWriteResult =
  | { ok: true; map: BoothCaliperMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothCaliperMap };

const emptyMap: BoothCaliperMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothCaliperNote {
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

export function normalizeBoothCaliperNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_CALIPER_NOTE_MAX);
}

export function parseBoothCaliper(
  raw: string | null | undefined,
): BoothCaliperMap {
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
    const next: BoothCaliperMap = {};
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
        note: normalizeBoothCaliperNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothCaliper(map: BoothCaliperMap) {
  return JSON.stringify(map);
}

export function boothCaliperCookieValue(map: BoothCaliperMap): string {
  return serializeBoothCaliper(map);
}

export const BOOTH_CALIPER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_CALIPER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_CALIPER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_CALIPER_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothCaliperStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothCaliperFor(
  stallId: string,
  map: BoothCaliperMap = emptyMap,
): BoothCaliperNote | undefined {
  return map[stallId];
}

export function tapeBoothCaliper(
  stall: Stall | undefined,
  map: BoothCaliperMap,
  raw: string,
  at = new Date(),
): BoothCaliperWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothCaliperNote(raw);
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

export function clearBoothCaliper(
  stall: Stall | undefined,
  map: BoothCaliperMap,
): BoothCaliperWriteResult {
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

export function mergeBoothCaliperMaps(
  ...maps: BoothCaliperMap[]
): BoothCaliperMap {
  const next: BoothCaliperMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothCaliper(): BoothCaliperMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothCaliper(
      window.localStorage.getItem(BOOTH_CALIPER_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothCaliper(map: BoothCaliperMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothCaliper(map);
  try {
    window.localStorage.setItem(BOOTH_CALIPER_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_CALIPER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_CALIPER_CHANGED_EVENT));
}

export function subscribeBoothCaliper(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_CALIPER_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_CALIPER_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_CALIPER_CHANGED_EVENT, listener);
  };
}
