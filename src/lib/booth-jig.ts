/**
 * I don't have a jig — still a table. Still Tuesday.
 * Kit is assemble. Square is try-square. Clamp is C-clamp. Harp is the finial.
 * Walkers still want Tuesday to hand over a jig, or so they can seat the harp.
 * I don't have a jig. Still a table.
 *
 * Never write `iss:booth-kit`, `iss:booth-square`, `iss:booth-clamp`,
 * `iss:booth-harp`, `iss:booth-caddy`, `iss:chase-listing-ids`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-jig` is the client cork.
 * Cookie `iss-booth-jig` is the same JSON so stall, `/lot`, and `/jig` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_JIG_STORAGE_KEY = "iss:booth-jig";
export const BOOTH_JIG_COOKIE_NAME = "iss-booth-jig";
export const BOOTH_JIG_CHANGED_EVENT = "iss:booth-jig-changed";

export const BOOTH_JIG_NOTE_MAX = 140;

export const BOOTH_JIG_PAPER_LINE = "I don't have a jig. Still a table.";
export const BOOTH_JIG_EMPTY_COPY =
  "Nobody taped a jig note on this booth. Still a table.";
export const BOOTH_JIG_EMPTY_TAPE =
  "Say you don't have a jig or leave the table.";
export const BOOTH_JIG_PACKED_LEFTOVER =
  "The table went in the car. This jig note is leftover.";
export const BOOTH_JIG_MISSING_COPY = "That stall packed up.";

export function stallJigPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/jig`;
}

export function stallJigWritePath() {
  return "/stalls/jig";
}

export type BoothJigNote = {
  note: string;
  at: string;
};

export type BoothJigMap = Record<string, BoothJigNote>;

export type BoothJigWriteResult =
  | { ok: true; map: BoothJigMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothJigMap };

const emptyMap: BoothJigMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothJigNote {
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

export function normalizeBoothJigNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_JIG_NOTE_MAX);
}

export function parseBoothJig(raw: string | null | undefined): BoothJigMap {
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
    const next: BoothJigMap = {};
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
        note: normalizeBoothJigNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothJig(map: BoothJigMap) {
  return JSON.stringify(map);
}

export function boothJigCookieValue(map: BoothJigMap): string {
  return serializeBoothJig(map);
}

export const BOOTH_JIG_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_JIG_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_JIG_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_JIG_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothJigStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothJigFor(
  stallId: string,
  map: BoothJigMap = emptyMap,
): BoothJigNote | undefined {
  return map[stallId];
}

export function tapeBoothJig(
  stall: Stall | undefined,
  map: BoothJigMap,
  raw: string,
  at = new Date(),
): BoothJigWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothJigNote(raw);
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

export function clearBoothJig(
  stall: Stall | undefined,
  map: BoothJigMap,
): BoothJigWriteResult {
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

export function mergeBoothJigMaps(...maps: BoothJigMap[]): BoothJigMap {
  const next: BoothJigMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothJig(): BoothJigMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothJig(
      window.localStorage.getItem(BOOTH_JIG_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothJig(map: BoothJigMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothJig(map);
  try {
    window.localStorage.setItem(BOOTH_JIG_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_JIG_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_JIG_CHANGED_EVENT));
}

export function subscribeBoothJig(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_JIG_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_JIG_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_JIG_CHANGED_EVENT, listener);
  };
}
