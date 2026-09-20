/**
 * I don't have a mandrel — still a table. Still Beats.
 * Spindle is the jewel stack. Burn is I don't burn a disc.
 * Overburn is the CD-R tape. Wrap stays wrap.
 * Walkers still want Beats to hand a mandrel, or form the disc on a pin.
 * I don't have a mandrel. Still a table.
 *
 * Never write `iss:booth-spindle`, `iss:booth-burn`, `iss:overburn-listing-ids`,
 * `iss:booth-wrap`, `iss:truss-listing-ids`, `iss:booth-register`,
 * `iss:booth-shield`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-mandrel` is the client cork.
 * Cookie `iss-booth-mandrel` is the same JSON so stall, `/lot`, and `/mandrel` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_MANDREL_STORAGE_KEY = "iss:booth-mandrel";
export const BOOTH_MANDREL_COOKIE_NAME = "iss-booth-mandrel";
export const BOOTH_MANDREL_CHANGED_EVENT = "iss:booth-mandrel-changed";

export const BOOTH_MANDREL_NOTE_MAX = 140;

export const BOOTH_MANDREL_PAPER_LINE =
  "I don't have a mandrel. Still a table.";
export const BOOTH_MANDREL_EMPTY_COPY =
  "Nobody taped a mandrel note on this booth. Still a table.";
export const BOOTH_MANDREL_EMPTY_TAPE =
  "Say you don't have a mandrel or leave the table.";
export const BOOTH_MANDREL_PACKED_LEFTOVER =
  "The table went in the car. This mandrel note is leftover.";
export const BOOTH_MANDREL_MISSING_COPY = "That stall packed up.";

export function stallMandrelPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/mandrel`;
}

export function stallMandrelWritePath() {
  return "/stalls/mandrel";
}

export type BoothMandrelNote = {
  note: string;
  at: string;
};

export type BoothMandrelMap = Record<string, BoothMandrelNote>;

export type BoothMandrelWriteResult =
  | { ok: true; map: BoothMandrelMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothMandrelMap };

const emptyMap: BoothMandrelMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothMandrelNote {
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

export function normalizeBoothMandrelNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_MANDREL_NOTE_MAX);
}

export function parseBoothMandrel(
  raw: string | null | undefined,
): BoothMandrelMap {
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
    const next: BoothMandrelMap = {};
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
        note: normalizeBoothMandrelNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothMandrel(map: BoothMandrelMap) {
  return JSON.stringify(map);
}

export function boothMandrelCookieValue(map: BoothMandrelMap): string {
  return serializeBoothMandrel(map);
}

export const BOOTH_MANDREL_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_MANDREL_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_MANDREL_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_MANDREL_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothMandrelStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothMandrelFor(
  stallId: string,
  map: BoothMandrelMap = emptyMap,
): BoothMandrelNote | undefined {
  return map[stallId];
}

export function tapeBoothMandrel(
  stall: Stall | undefined,
  map: BoothMandrelMap,
  raw: string,
  at = new Date(),
): BoothMandrelWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothMandrelNote(raw);
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

export function clearBoothMandrel(
  stall: Stall | undefined,
  map: BoothMandrelMap,
): BoothMandrelWriteResult {
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

export function mergeBoothMandrelMaps(
  ...maps: BoothMandrelMap[]
): BoothMandrelMap {
  const next: BoothMandrelMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothMandrel(): BoothMandrelMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothMandrel(
      window.localStorage.getItem(BOOTH_MANDREL_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothMandrel(map: BoothMandrelMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothMandrel(map);
  try {
    window.localStorage.setItem(BOOTH_MANDREL_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_MANDREL_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_MANDREL_CHANGED_EVENT));
}

export function subscribeBoothMandrel(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_MANDREL_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_MANDREL_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_MANDREL_CHANGED_EVENT, listener);
  };
}
