/**
 * I don't have tweezers — still a driveway. Still a crack. Still Half-Working.
 * Snips is cut-the-tie. Wick is desolder-braid. Spudger is nylon-pry.
 * Driver is the bit. Comb / drift / bone stay queued. Wrap stays wrap.
 * Walkers still want Half-Working to hand over tweezers, or so they can
 * lift the fused cart without Closet's snips. I don't have tweezers.
 * Still a driveway. Still a crack.
 *
 * Never write `iss:booth-snips`, `iss:booth-wick`, `iss:booth-spudger`,
 * `iss:booth-driver`, `iss:booth-comb`, `iss:booth-drift`, `iss:booth-bone`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-tweezers` is the client cork.
 * Cookie `iss-booth-tweezers` is the same JSON so stall, `/lot`, and `/tweezers` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_TWEEZERS_STORAGE_KEY = "iss:booth-tweezers";
export const BOOTH_TWEEZERS_COOKIE_NAME = "iss-booth-tweezers";
export const BOOTH_TWEEZERS_CHANGED_EVENT = "iss:booth-tweezers-changed";

export const BOOTH_TWEEZERS_NOTE_MAX = 140;

export const BOOTH_TWEEZERS_PAPER_LINE =
  "I don't have tweezers. Still a driveway. Still a crack.";
export const BOOTH_TWEEZERS_EMPTY_COPY =
  "Nobody taped a tweezers note on this booth. Still a driveway.";
export const BOOTH_TWEEZERS_EMPTY_TAPE =
  "Say you don't have tweezers or leave the table.";
export const BOOTH_TWEEZERS_PACKED_LEFTOVER =
  "The table went in the car. This tweezers note is leftover.";
export const BOOTH_TWEEZERS_MISSING_COPY = "That stall packed up.";

export function stallTweezersPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/tweezers`;
}

export function stallTweezersWritePath() {
  return "/stalls/tweezers";
}

export type BoothTweezersNote = {
  note: string;
  at: string;
};

export type BoothTweezersMap = Record<string, BoothTweezersNote>;

export type BoothTweezersWriteResult =
  | { ok: true; map: BoothTweezersMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothTweezersMap };

const emptyMap: BoothTweezersMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothTweezersNote {
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

export function normalizeBoothTweezersNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_TWEEZERS_NOTE_MAX);
}

export function parseBoothTweezers(raw: string | null | undefined): BoothTweezersMap {
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
    const next: BoothTweezersMap = {};
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
        note: normalizeBoothTweezersNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothTweezers(map: BoothTweezersMap) {
  return JSON.stringify(map);
}

export function boothTweezersCookieValue(map: BoothTweezersMap): string {
  return serializeBoothTweezers(map);
}

export const BOOTH_TWEEZERS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_TWEEZERS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_TWEEZERS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_TWEEZERS_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothTweezersStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothTweezersFor(
  stallId: string,
  map: BoothTweezersMap = emptyMap,
): BoothTweezersNote | undefined {
  return map[stallId];
}

export function tapeBoothTweezers(
  stall: Stall | undefined,
  map: BoothTweezersMap,
  raw: string,
  at = new Date(),
): BoothTweezersWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothTweezersNote(raw);
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

export function clearBoothTweezers(
  stall: Stall | undefined,
  map: BoothTweezersMap,
): BoothTweezersWriteResult {
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

export function mergeBoothTweezersMaps(...maps: BoothTweezersMap[]): BoothTweezersMap {
  const next: BoothTweezersMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothTweezers(): BoothTweezersMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothTweezers(
      window.localStorage.getItem(BOOTH_TWEEZERS_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothTweezers(map: BoothTweezersMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothTweezers(map);
  try {
    window.localStorage.setItem(BOOTH_TWEEZERS_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_TWEEZERS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_TWEEZERS_CHANGED_EVENT));
}

export function subscribeBoothTweezers(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_TWEEZERS_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_TWEEZERS_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_TWEEZERS_CHANGED_EVENT, listener);
  };
}
