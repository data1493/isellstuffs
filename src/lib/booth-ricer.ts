/**
 * I don't have a ricer — still a drawer.
 * Funnel is leftover oil. Dishes is hose. Pour is taste.
 * Walkers still want Sink Drawer to hand a ricer, or leftover mash pressed.
 * I don't have a ricer. Still a drawer.
 *
 * Never write `iss:booth-funnel`, `iss:booth-dishes`, `iss:booth-pour`,
 * `iss:booth-caliper`, `iss:booth-last`, `iss:booth-wick`,
 * `iss:tumble-listing-ids`, `iss:bleed-listing-ids`, `iss:ream-listing-ids`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-ricer` is the client cork.
 * Cookie `iss-booth-ricer` is the same JSON so stall, `/lot`, and `/ricer` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_RICER_STORAGE_KEY = "iss:booth-ricer";
export const BOOTH_RICER_COOKIE_NAME = "iss-booth-ricer";
export const BOOTH_RICER_CHANGED_EVENT = "iss:booth-ricer-changed";

export const BOOTH_RICER_NOTE_MAX = 140;

export const BOOTH_RICER_PAPER_LINE = "I don't have a ricer. Still a drawer.";
export const BOOTH_RICER_EMPTY_COPY =
  "Nobody taped a ricer note on this booth. Still a drawer.";
export const BOOTH_RICER_EMPTY_TAPE =
  "Say you don't have a ricer or leave the table.";
export const BOOTH_RICER_PACKED_LEFTOVER =
  "The table went in the car. This ricer note is leftover.";
export const BOOTH_RICER_MISSING_COPY = "That stall packed up.";

export function stallRicerPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/ricer`;
}

export function stallRicerWritePath() {
  return "/stalls/ricer";
}

export type BoothRicerNote = {
  note: string;
  at: string;
};

export type BoothRicerMap = Record<string, BoothRicerNote>;

export type BoothRicerWriteResult =
  | { ok: true; map: BoothRicerMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothRicerMap };

const emptyMap: BoothRicerMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothRicerNote {
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

export function normalizeBoothRicerNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_RICER_NOTE_MAX);
}

export function parseBoothRicer(raw: string | null | undefined): BoothRicerMap {
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
    const next: BoothRicerMap = {};
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
        note: normalizeBoothRicerNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothRicer(map: BoothRicerMap) {
  return JSON.stringify(map);
}

export function boothRicerCookieValue(map: BoothRicerMap): string {
  return serializeBoothRicer(map);
}

export const BOOTH_RICER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_RICER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_RICER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_RICER_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothRicerStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothRicerFor(
  stallId: string,
  map: BoothRicerMap = emptyMap,
): BoothRicerNote | undefined {
  return map[stallId];
}

export function tapeBoothRicer(
  stall: Stall | undefined,
  map: BoothRicerMap,
  raw: string,
  at = new Date(),
): BoothRicerWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothRicerNote(raw);
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

export function clearBoothRicer(
  stall: Stall | undefined,
  map: BoothRicerMap,
): BoothRicerWriteResult {
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

export function mergeBoothRicerMaps(...maps: BoothRicerMap[]): BoothRicerMap {
  const next: BoothRicerMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothRicer(): BoothRicerMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothRicer(
      window.localStorage.getItem(BOOTH_RICER_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothRicer(map: BoothRicerMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothRicer(map);
  try {
    window.localStorage.setItem(BOOTH_RICER_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_RICER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_RICER_CHANGED_EVENT));
}

export function subscribeBoothRicer(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_RICER_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_RICER_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_RICER_CHANGED_EVENT, listener);
  };
}
