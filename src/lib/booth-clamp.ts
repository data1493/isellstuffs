/**
 * I don't have a clamp — still a folding table.
 * Stay is hangers. Tape is the price sheet. Harp is no finial.
 * Walkers still want Tuesday to clamp the table, or "hold the lamp."
 * I don't have a clamp. Still a folding table.
 *
 * Never write `iss:booth-stay`, `iss:booth-harp`, `iss:booth-tape`,
 * `iss:booth-kit`, `iss:booth-shim`, `iss:booth-socket`,
 * `iss:booth-mirror`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-clamp` is the client cork.
 * Cookie `iss-booth-clamp` is the same JSON so stall, `/lot`, and `/clamp` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_CLAMP_STORAGE_KEY = "iss:booth-clamp";
export const BOOTH_CLAMP_COOKIE_NAME = "iss-booth-clamp";
export const BOOTH_CLAMP_CHANGED_EVENT = "iss:booth-clamp-changed";

export const BOOTH_CLAMP_NOTE_MAX = 140;

export const BOOTH_CLAMP_PAPER_LINE =
  "I don't have a clamp. Still a folding table. Not stay. Not tape. Not harp.";
export const BOOTH_CLAMP_EMPTY_COPY =
  "Nobody taped a clamp note on this booth. Still a folding table.";
export const BOOTH_CLAMP_EMPTY_TAPE =
  "Say you don't have a clamp or leave the table.";
export const BOOTH_CLAMP_PACKED_LEFTOVER =
  "The table went in the car. This clamp note is leftover.";
export const BOOTH_CLAMP_MISSING_COPY = "That stall packed up.";

export function stallClampPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/clamp`;
}

export function stallClampWritePath() {
  return "/stalls/clamp";
}

export type BoothClampNote = {
  note: string;
  at: string;
};

export type BoothClampMap = Record<string, BoothClampNote>;

export type BoothClampWriteResult =
  | { ok: true; map: BoothClampMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothClampMap };

const emptyMap: BoothClampMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothClampNote {
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

export function normalizeBoothClampNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_CLAMP_NOTE_MAX);
}

export function parseBoothClamp(raw: string | null | undefined): BoothClampMap {
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
    const next: BoothClampMap = {};
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
        note: normalizeBoothClampNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothClamp(map: BoothClampMap) {
  return JSON.stringify(map);
}

export function boothClampCookieValue(map: BoothClampMap): string {
  return serializeBoothClamp(map);
}

export const BOOTH_CLAMP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_CLAMP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_CLAMP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_CLAMP_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothClampStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothClampFor(
  stallId: string,
  map: BoothClampMap = emptyMap,
): BoothClampNote | undefined {
  return map[stallId];
}

export function tapeBoothClamp(
  stall: Stall | undefined,
  map: BoothClampMap,
  raw: string,
  at = new Date(),
): BoothClampWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothClampNote(raw);
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

export function clearBoothClamp(
  stall: Stall | undefined,
  map: BoothClampMap,
): BoothClampWriteResult {
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

export function mergeBoothClampMaps(...maps: BoothClampMap[]): BoothClampMap {
  const next: BoothClampMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothClamp(): BoothClampMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothClamp(
      window.localStorage.getItem(BOOTH_CLAMP_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothClamp(map: BoothClampMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothClamp(map);
  try {
    window.localStorage.setItem(BOOTH_CLAMP_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_CLAMP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_CLAMP_CHANGED_EVENT));
}

export function subscribeBoothClamp(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_CLAMP_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_CLAMP_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_CLAMP_CHANGED_EVENT, listener);
  };
}
