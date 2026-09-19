/**
 * I will not copy onto your stick — folder after pay.
 * Walkers still want Beats to put the pack on a USB, or "copy it
 * while I wait." I will not copy onto your stick. Folder after pay.
 *
 * Never write `iss:booth-stick`, `iss:booth-burn`, `iss:booth-print`,
 * leftover jewel keys, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-copy` is the client cork.
 * Cookie `iss-booth-copy` is the same JSON so stall, `/lot`, and `/copy` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_COPY_STORAGE_KEY = "iss:booth-copy";
export const BOOTH_COPY_COOKIE_NAME = "iss-booth-copy";
export const BOOTH_COPY_CHANGED_EVENT = "iss:booth-copy-changed";

export const BOOTH_COPY_NOTE_MAX = 140;

export const BOOTH_COPY_PAPER_LINE =
  "I will not copy onto your stick. Folder after pay. Not a copy booth. Not stick. Not burn.";
export const BOOTH_COPY_EMPTY_COPY =
  "Nobody taped a copy note on this booth. Folder after pay.";
export const BOOTH_COPY_EMPTY_TAPE =
  "Say you will not copy onto a stick or leave the table.";
export const BOOTH_COPY_PACKED_LEFTOVER =
  "The table went in the car. This copy note is leftover.";
export const BOOTH_COPY_MISSING_COPY = "That stall packed up.";

export function stallCopyPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/copy`;
}

export function stallCopyWritePath() {
  return "/stalls/copy";
}

export type BoothCopyNote = {
  note: string;
  at: string;
};

export type BoothCopyMap = Record<string, BoothCopyNote>;

export type BoothCopyWriteResult =
  | { ok: true; map: BoothCopyMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothCopyMap };

const emptyMap: BoothCopyMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothCopyNote {
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

export function normalizeBoothCopyNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_COPY_NOTE_MAX);
}

export function parseBoothCopy(raw: string | null | undefined): BoothCopyMap {
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
    const next: BoothCopyMap = {};
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
        note: normalizeBoothCopyNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothCopy(map: BoothCopyMap) {
  return JSON.stringify(map);
}

export function boothCopyCookieValue(map: BoothCopyMap): string {
  return serializeBoothCopy(map);
}

export const BOOTH_COPY_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_COPY_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_COPY_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_COPY_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothCopyStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothCopyFor(
  stallId: string,
  map: BoothCopyMap = emptyMap,
): BoothCopyNote | undefined {
  return map[stallId];
}

export function tapeBoothCopy(
  stall: Stall | undefined,
  map: BoothCopyMap,
  raw: string,
  at = new Date(),
): BoothCopyWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothCopyNote(raw);
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

export function clearBoothCopy(
  stall: Stall | undefined,
  map: BoothCopyMap,
): BoothCopyWriteResult {
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

export function mergeBoothCopyMaps(...maps: BoothCopyMap[]): BoothCopyMap {
  const next: BoothCopyMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothCopy(): BoothCopyMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothCopy(
      window.localStorage.getItem(BOOTH_COPY_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothCopy(map: BoothCopyMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothCopy(map);
  try {
    window.localStorage.setItem(BOOTH_COPY_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_COPY_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_COPY_CHANGED_EVENT));
}

export function subscribeBoothCopy(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_COPY_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_COPY_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_COPY_CHANGED_EVENT, listener);
  };
}
