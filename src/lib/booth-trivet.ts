/**
 * I don't have a trivet — still a drawer. Still a chip.
 * Dishes is I don't do dishes. Pour is I don't pour. Wrap is newspaper.
 * Walkers still want Sink Drawer to hand a trivet, or set the pot on the table.
 * I don't have a trivet. Still a drawer. Still a chip.
 *
 * Never write `iss:booth-dishes`, `iss:booth-pour`, `iss:booth-wrap`,
 * `iss:booth-towel`, `iss:booth-foil`, `iss:booth-soap`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-trivet` is the client cork.
 * Cookie `iss-booth-trivet` is the same JSON so stall, `/lot`, and `/trivet` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_TRIVET_STORAGE_KEY = "iss:booth-trivet";
export const BOOTH_TRIVET_COOKIE_NAME = "iss-booth-trivet";
export const BOOTH_TRIVET_CHANGED_EVENT = "iss:booth-trivet-changed";

export const BOOTH_TRIVET_NOTE_MAX = 140;

export const BOOTH_TRIVET_PAPER_LINE =
  "I don't have a trivet. Still a drawer. Still a chip.";
export const BOOTH_TRIVET_EMPTY_COPY =
  "Nobody taped a trivet note on this booth. Still a drawer. Still a chip.";
export const BOOTH_TRIVET_EMPTY_TAPE =
  "Say you don't have a trivet or leave the table.";
export const BOOTH_TRIVET_PACKED_LEFTOVER =
  "The table went in the car. This trivet note is leftover.";
export const BOOTH_TRIVET_MISSING_COPY = "That stall packed up.";

export function stallTrivetPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/trivet`;
}

export function stallTrivetWritePath() {
  return "/stalls/trivet";
}

export type BoothTrivetNote = {
  note: string;
  at: string;
};

export type BoothTrivetMap = Record<string, BoothTrivetNote>;

export type BoothTrivetWriteResult =
  | { ok: true; map: BoothTrivetMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothTrivetMap };

const emptyMap: BoothTrivetMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothTrivetNote {
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
  // `{ ok, map }` / `{ ok, listingIds }` 500 the stall if treated as notes.
  return typeof row.ok === "boolean" && ("map" in row || "listingIds" in row);
}

export function normalizeBoothTrivetNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_TRIVET_NOTE_MAX);
}

export function parseBoothTrivet(raw: string | null | undefined): BoothTrivetMap {
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
    const next: BoothTrivetMap = {};
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
        note: normalizeBoothTrivetNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothTrivet(map: BoothTrivetMap) {
  return JSON.stringify(map);
}

export function boothTrivetCookieValue(map: BoothTrivetMap): string {
  return serializeBoothTrivet(map);
}

export const BOOTH_TRIVET_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_TRIVET_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_TRIVET_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_TRIVET_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothTrivetStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothTrivetFor(
  stallId: string,
  map: BoothTrivetMap = emptyMap,
): BoothTrivetNote | undefined {
  return map[stallId];
}

export function tapeBoothTrivet(
  stall: Stall | undefined,
  map: BoothTrivetMap,
  raw: string,
  at = new Date(),
): BoothTrivetWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothTrivetNote(raw);
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

export function clearBoothTrivet(
  stall: Stall | undefined,
  map: BoothTrivetMap,
): BoothTrivetWriteResult {
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

export function mergeBoothTrivetMaps(...maps: BoothTrivetMap[]): BoothTrivetMap {
  const next: BoothTrivetMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothTrivet(): BoothTrivetMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothTrivet(
      window.localStorage.getItem(BOOTH_TRIVET_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothTrivet(map: BoothTrivetMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothTrivet(map);
  try {
    window.localStorage.setItem(BOOTH_TRIVET_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_TRIVET_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_TRIVET_CHANGED_EVENT));
}

export function subscribeBoothTrivet(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_TRIVET_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_TRIVET_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_TRIVET_CHANGED_EVENT, listener);
  };
}
