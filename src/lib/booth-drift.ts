/**
 * I don't have a drift — still a driveway. Still a crack. Still Tuesday.
 * Mallet is soft-face. Peen is hammer-the-collar. Caliper is pipe-measure.
 * Jig is seat-the-harp. Walkers still want Tuesday to hand over a drift, or
 * so they can drive the lamp pin without Closet's last. I don't have a drift.
 * Still a driveway. Still a crack.
 *
 * Never write `iss:booth-mallet`, `iss:peen-listing-ids`, `iss:booth-caliper`,
 * `iss:booth-strop`, `iss:booth-pony`, `iss:booth-jig`, tote, sold, packed,
 * or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-drift` is the client cork.
 * Cookie `iss-booth-drift` is the same JSON so stall, `/lot`, and `/drift` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_DRIFT_STORAGE_KEY = "iss:booth-drift";
export const BOOTH_DRIFT_COOKIE_NAME = "iss-booth-drift";
export const BOOTH_DRIFT_CHANGED_EVENT = "iss:booth-drift-changed";

export const BOOTH_DRIFT_NOTE_MAX = 140;

export const BOOTH_DRIFT_PAPER_LINE =
  "I don't have a drift. Still a driveway. Still a crack.";
export const BOOTH_DRIFT_EMPTY_COPY =
  "Nobody taped a drift note on this booth. Still a driveway.";
export const BOOTH_DRIFT_EMPTY_TAPE =
  "Say you don't have a drift or leave the table.";
export const BOOTH_DRIFT_PACKED_LEFTOVER =
  "The table went in the car. This drift note is leftover.";
export const BOOTH_DRIFT_MISSING_COPY = "That stall packed up.";

export function stallDriftPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/drift`;
}

export function stallDriftWritePath() {
  return "/stalls/drift";
}

export type BoothDriftNote = {
  note: string;
  at: string;
};

export type BoothDriftMap = Record<string, BoothDriftNote>;

export type BoothDriftWriteResult =
  | { ok: true; map: BoothDriftMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothDriftMap };

const emptyMap: BoothDriftMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothDriftNote {
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

export function normalizeBoothDriftNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_DRIFT_NOTE_MAX);
}

export function parseBoothDrift(raw: string | null | undefined): BoothDriftMap {
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
    const next: BoothDriftMap = {};
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
        note: normalizeBoothDriftNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothDrift(map: BoothDriftMap) {
  return JSON.stringify(map);
}

export function boothDriftCookieValue(map: BoothDriftMap): string {
  return serializeBoothDrift(map);
}

export const BOOTH_DRIFT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_DRIFT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_DRIFT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_DRIFT_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothDriftStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothDriftFor(
  stallId: string,
  map: BoothDriftMap = emptyMap,
): BoothDriftNote | undefined {
  return map[stallId];
}

export function tapeBoothDrift(
  stall: Stall | undefined,
  map: BoothDriftMap,
  raw: string,
  at = new Date(),
): BoothDriftWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothDriftNote(raw);
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

export function clearBoothDrift(
  stall: Stall | undefined,
  map: BoothDriftMap,
): BoothDriftWriteResult {
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

export function mergeBoothDriftMaps(...maps: BoothDriftMap[]): BoothDriftMap {
  const next: BoothDriftMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothDrift(): BoothDriftMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothDrift(
      window.localStorage.getItem(BOOTH_DRIFT_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothDrift(map: BoothDriftMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothDrift(map);
  try {
    window.localStorage.setItem(BOOTH_DRIFT_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_DRIFT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_DRIFT_CHANGED_EVENT));
}

export function subscribeBoothDrift(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_DRIFT_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_DRIFT_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_DRIFT_CHANGED_EVENT, listener);
  };
}
