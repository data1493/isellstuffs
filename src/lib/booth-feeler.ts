/**
 * I don't have a feeler — still a crack. Still a stain. Still Tuesday.
 * Drift is drive-the-pin. Mallet is the soft face. Harp is the stall finial.
 * Clamp is the bench clamp. Wrap stays wrap. Vise is not this booth.
 * Singe / pregap / gang / upset stay listing paper.
 * Walkers still want Tuesday to hand over a feeler, or so they can
 * read the lamp neck gap without a shop drift. I don't have a feeler.
 * Still a crack. Still a stain.
 *
 * Never write `iss:booth-drift`, `iss:booth-mallet`, `iss:booth-harp`,
 * `iss:booth-clamp`, `iss:booth-gobo`, `iss:booth-chalk`,
 * `iss:booth-tweezers`, `iss:booth-bone`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-feeler` is the client cork.
 * Cookie `iss-booth-feeler` is the same JSON so stall, `/lot`, and `/feeler` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_FEELER_STORAGE_KEY = "iss:booth-feeler";
export const BOOTH_FEELER_COOKIE_NAME = "iss-booth-feeler";
export const BOOTH_FEELER_CHANGED_EVENT = "iss:booth-feeler-changed";

export const BOOTH_FEELER_NOTE_MAX = 140;

export const BOOTH_FEELER_PAPER_LINE =
  "I don't have a feeler. Still a crack. Still a stain.";
export const BOOTH_FEELER_EMPTY_COPY =
  "Nobody taped a feeler note on this booth. Still a crack.";
export const BOOTH_FEELER_EMPTY_TAPE =
  "Say you don't have a feeler or leave the table.";
export const BOOTH_FEELER_PACKED_LEFTOVER =
  "The table went in the car. This feeler note is leftover.";
export const BOOTH_FEELER_MISSING_COPY = "That stall packed up.";

export function stallFeelerPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/feeler`;
}

export function stallFeelerWritePath() {
  return "/stalls/feeler";
}

export type BoothFeelerNote = {
  note: string;
  at: string;
};

export type BoothFeelerMap = Record<string, BoothFeelerNote>;

export type BoothFeelerWriteResult =
  | { ok: true; map: BoothFeelerMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothFeelerMap };

const emptyMap: BoothFeelerMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothFeelerNote {
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

export function normalizeBoothFeelerNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_FEELER_NOTE_MAX);
}

export function parseBoothFeeler(raw: string | null | undefined): BoothFeelerMap {
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
    const next: BoothFeelerMap = {};
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
        note: normalizeBoothFeelerNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothFeeler(map: BoothFeelerMap) {
  return JSON.stringify(map);
}

export function boothFeelerCookieValue(map: BoothFeelerMap): string {
  return serializeBoothFeeler(map);
}

export const BOOTH_FEELER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_FEELER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_FEELER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_FEELER_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothFeelerStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothFeelerFor(
  stallId: string,
  map: BoothFeelerMap = emptyMap,
): BoothFeelerNote | undefined {
  return map[stallId];
}

export function tapeBoothFeeler(
  stall: Stall | undefined,
  map: BoothFeelerMap,
  raw: string,
  at = new Date(),
): BoothFeelerWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothFeelerNote(raw);
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

export function clearBoothFeeler(
  stall: Stall | undefined,
  map: BoothFeelerMap,
): BoothFeelerWriteResult {
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

export function mergeBoothFeelerMaps(...maps: BoothFeelerMap[]): BoothFeelerMap {
  const next: BoothFeelerMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothFeeler(): BoothFeelerMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothFeeler(
      window.localStorage.getItem(BOOTH_FEELER_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothFeeler(map: BoothFeelerMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothFeeler(map);
  try {
    window.localStorage.setItem(BOOTH_FEELER_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_FEELER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_FEELER_CHANGED_EVENT));
}

export function subscribeBoothFeeler(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_FEELER_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_FEELER_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_FEELER_CHANGED_EVENT, listener);
  };
}
