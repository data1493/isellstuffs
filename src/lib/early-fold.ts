/**
 * Folding up at noon — a last-call note on that booth.
 * Hours say 9–2. The seller starts boxing at noon. Walkers at 1
 * find a ghost that is not packed.
 *
 * Never write `iss:packed-stall-ids` or `iss:weekend-hours`.
 * Never write tote / sold / garage / here / scrap / tape / lunch keys.
 * Not packed. Not new hours. Not lunch. Not rain.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:early-fold` is the client cork.
 * Cookie `iss-early-fold` is the same JSON so stall, `/lot`, and `/fold` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const EARLY_FOLD_STORAGE_KEY = "iss:early-fold";
export const EARLY_FOLD_COOKIE_NAME = "iss-early-fold";
export const EARLY_FOLD_CHANGED_EVENT = "iss:early-fold-changed";

export const EARLY_FOLD_NOTE_MAX = 140;

export const EARLY_FOLD_PAPER_LINE =
  "Folding up at noon. Not packed. Not new hours.";
export const EARLY_FOLD_EMPTY_COPY =
  "Nobody is boxing yet. Hours are still the plan.";
export const EARLY_FOLD_EMPTY_TAPE =
  "Say when you fold or leave the table.";
export const EARLY_FOLD_PACKED_LEFTOVER =
  "The table went in the car. This last-call note is leftover.";
export const EARLY_FOLD_MISSING_COPY = "That stall packed up.";

export type EarlyFoldNote = {
  note: string;
  at: string;
};

export type EarlyFoldMap = Record<string, EarlyFoldNote>;

export type EarlyFoldWriteResult =
  | { ok: true; map: EarlyFoldMap }
  | { ok: false; reason: "missing" | "empty"; map: EarlyFoldMap };

const emptyMap: EarlyFoldMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is EarlyFoldNote {
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

export function normalizeEarlyFoldNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, EARLY_FOLD_NOTE_MAX);
}

export function parseEarlyFold(raw: string | null | undefined): EarlyFoldMap {
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
    const next: EarlyFoldMap = {};
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
        note: normalizeEarlyFoldNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeEarlyFold(map: EarlyFoldMap) {
  return JSON.stringify(map);
}

export function earlyFoldCookieValue(map: EarlyFoldMap): string {
  return serializeEarlyFold(map);
}

export const EARLY_FOLD_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${EARLY_FOLD_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(EARLY_FOLD_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(EARLY_FOLD_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveEarlyFoldStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function earlyFoldFor(
  stallId: string,
  map: EarlyFoldMap = emptyMap,
): EarlyFoldNote | undefined {
  return map[stallId];
}

export function tapeEarlyFold(
  stall: Stall | undefined,
  map: EarlyFoldMap,
  raw: string,
  at = new Date(),
): EarlyFoldWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeEarlyFoldNote(raw);
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

export function clearEarlyFold(
  stall: Stall | undefined,
  map: EarlyFoldMap,
): EarlyFoldWriteResult {
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

export function mergeEarlyFoldMaps(...maps: EarlyFoldMap[]): EarlyFoldMap {
  const next: EarlyFoldMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readEarlyFold(): EarlyFoldMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseEarlyFold(
      window.localStorage.getItem(EARLY_FOLD_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeEarlyFold(map: EarlyFoldMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeEarlyFold(map);
  try {
    window.localStorage.setItem(EARLY_FOLD_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${EARLY_FOLD_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(EARLY_FOLD_CHANGED_EVENT));
}

export function subscribeEarlyFold(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === EARLY_FOLD_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(EARLY_FOLD_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EARLY_FOLD_CHANGED_EVENT, listener);
  };
}
