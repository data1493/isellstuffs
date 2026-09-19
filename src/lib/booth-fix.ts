/**
 * I don't fix — I sell it, I don't repair it. Still tote.
 * Walkers still ask Half-Working to fix the Game Boy.
 * Parts is it doesn't run. Shell is don't crack the blister.
 * Not parts. Not remote. Not shell.
 *
 * Never write `iss:parts-listing-ids`, `iss:remote-listing-ids`,
 * `iss:booth-shell`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-fix` is the client cork.
 * Cookie `iss-booth-fix` is the same JSON so stall, `/lot`, and `/fix` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_FIX_STORAGE_KEY = "iss:booth-fix";
export const BOOTH_FIX_COOKIE_NAME = "iss-booth-fix";
export const BOOTH_FIX_CHANGED_EVENT = "iss:booth-fix-changed";

export const BOOTH_FIX_NOTE_MAX = 140;

export const BOOTH_FIX_PAPER_LINE =
  "I sell it, I don't repair it. Walkers still ask Half-Working to fix the Game Boy. Not parts. Not remote.";
export const BOOTH_FIX_EMPTY_COPY =
  "The iron is still out. Nobody taped a no-repair note on this booth.";
export const BOOTH_FIX_EMPTY_TAPE =
  "Write the no-repair note or leave the iron on the table.";
export const BOOTH_FIX_PACKED_LEFTOVER =
  "The table went in the car. This no-repair note is leftover.";
export const BOOTH_FIX_MISSING_COPY = "That stall packed up.";

export function stallFixPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/fix`;
}

export function stallFixWritePath() {
  return "/stalls/fix";
}

export type BoothFixNote = {
  note: string;
  at: string;
};

export type BoothFixMap = Record<string, BoothFixNote>;

export type BoothFixWriteResult =
  | { ok: true; map: BoothFixMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothFixMap };

const emptyMap: BoothFixMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothFixNote {
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

export function normalizeBoothFixNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_FIX_NOTE_MAX);
}

export function parseBoothFix(raw: string | null | undefined): BoothFixMap {
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
    const next: BoothFixMap = {};
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
        note: normalizeBoothFixNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothFix(map: BoothFixMap) {
  return JSON.stringify(map);
}

export function boothFixCookieValue(map: BoothFixMap): string {
  return serializeBoothFix(map);
}

export const BOOTH_FIX_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_FIX_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_FIX_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_FIX_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothFixStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothFixFor(
  stallId: string,
  map: BoothFixMap = emptyMap,
): BoothFixNote | undefined {
  return map[stallId];
}

export function tapeBoothFix(
  stall: Stall | undefined,
  map: BoothFixMap,
  raw: string,
  at = new Date(),
): BoothFixWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothFixNote(raw);
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

export function clearBoothFix(
  stall: Stall | undefined,
  map: BoothFixMap,
): BoothFixWriteResult {
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

export function mergeBoothFixMaps(...maps: BoothFixMap[]): BoothFixMap {
  const next: BoothFixMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothFix(): BoothFixMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothFix(
      window.localStorage.getItem(BOOTH_FIX_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothFix(map: BoothFixMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothFix(map);
  try {
    window.localStorage.setItem(BOOTH_FIX_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_FIX_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_FIX_CHANGED_EVENT));
}

export function subscribeBoothFix(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_FIX_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_FIX_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_FIX_CHANGED_EVENT, listener);
  };
}
