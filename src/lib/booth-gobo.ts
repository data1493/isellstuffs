/**
 * I don't have a gobo — still a folder. Still a jewel case. Still Beats.
 * Fid is splice-spike. Preamp is the bench pre. Player is the deck.
 * Aux is the minijack. Strobe / loupe / drift / tweezers stay neighbor paper.
 * Walkers still want Beats to hand over a gobo, or so they can deaden the
 * table without Tuesday's drift pin. I don't have a gobo. Still a folder.
 * Still a jewel case.
 *
 * Never write `iss:booth-fid`, `iss:booth-preamp`, `iss:booth-player`,
 * `iss:booth-aux`, `iss:booth-strobe`, `iss:booth-loupe`, `iss:booth-drift`,
 * `iss:booth-tweezers`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-gobo` is the client cork.
 * Cookie `iss-booth-gobo` is the same JSON so stall, `/lot`, and `/gobo` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_GOBO_STORAGE_KEY = "iss:booth-gobo";
export const BOOTH_GOBO_COOKIE_NAME = "iss-booth-gobo";
export const BOOTH_GOBO_CHANGED_EVENT = "iss:booth-gobo-changed";

export const BOOTH_GOBO_NOTE_MAX = 140;

export const BOOTH_GOBO_PAPER_LINE =
  "I don't have a gobo. Still a folder. Still a jewel case.";
export const BOOTH_GOBO_EMPTY_COPY =
  "Nobody taped a gobo note on this booth. Still a folder.";
export const BOOTH_GOBO_EMPTY_TAPE =
  "Say you don't have a gobo or leave the table.";
export const BOOTH_GOBO_PACKED_LEFTOVER =
  "The table went in the car. This gobo note is leftover.";
export const BOOTH_GOBO_MISSING_COPY = "That stall packed up.";

export function stallGoboPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/gobo`;
}

export function stallGoboWritePath() {
  return "/stalls/gobo";
}

export type BoothGoboNote = {
  note: string;
  at: string;
};

export type BoothGoboMap = Record<string, BoothGoboNote>;

export type BoothGoboWriteResult =
  | { ok: true; map: BoothGoboMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothGoboMap };

const emptyMap: BoothGoboMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothGoboNote {
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

export function normalizeBoothGoboNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_GOBO_NOTE_MAX);
}

export function parseBoothGobo(raw: string | null | undefined): BoothGoboMap {
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
    const next: BoothGoboMap = {};
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
        note: normalizeBoothGoboNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothGobo(map: BoothGoboMap) {
  return JSON.stringify(map);
}

export function boothGoboCookieValue(map: BoothGoboMap): string {
  return serializeBoothGobo(map);
}

export const BOOTH_GOBO_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_GOBO_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_GOBO_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_GOBO_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothGoboStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothGoboFor(
  stallId: string,
  map: BoothGoboMap = emptyMap,
): BoothGoboNote | undefined {
  return map[stallId];
}

export function tapeBoothGobo(
  stall: Stall | undefined,
  map: BoothGoboMap,
  raw: string,
  at = new Date(),
): BoothGoboWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothGoboNote(raw);
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

export function clearBoothGobo(
  stall: Stall | undefined,
  map: BoothGoboMap,
): BoothGoboWriteResult {
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

export function mergeBoothGoboMaps(...maps: BoothGoboMap[]): BoothGoboMap {
  const next: BoothGoboMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothGobo(): BoothGoboMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothGobo(
      window.localStorage.getItem(BOOTH_GOBO_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothGobo(map: BoothGoboMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothGobo(map);
  try {
    window.localStorage.setItem(BOOTH_GOBO_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_GOBO_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_GOBO_CHANGED_EVENT));
}

export function subscribeBoothGobo(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_GOBO_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_GOBO_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_GOBO_CHANGED_EVENT, listener);
  };
}
