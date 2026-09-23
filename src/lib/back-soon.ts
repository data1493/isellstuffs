/**
 * Back after lunch — a note on that booth.
 * Pack is the car. Hours are the plan. A taco-truck run looks like packed.
 *
 * Never write `iss:packed-stall-ids` or `iss:weekend-hours`.
 * Never write tote / sold / garage / here / scrap / tape keys.
 * Not `/walk`. Not new hours. Not a pack flag.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:back-soon` is the client cork.
 * Cookie `iss-back-soon` is the same JSON so stall, `/lot`, and `/back` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BACK_SOON_STORAGE_KEY = "iss:back-soon";
export const BACK_SOON_COOKIE_NAME = "iss-back-soon";
export const BACK_SOON_CHANGED_EVENT = "iss:back-soon-changed";

export const BACK_SOON_NOTE_MAX = 140;

export const BACK_SOON_PAPER_LINE =
  "Back after lunch. Not packed. Not new hours.";
export const BACK_SOON_EMPTY_COPY = "Nobody stepped away. The table is the table.";
export const BACK_SOON_EMPTY_TAPE =
  "Say when you’re back or leave the table.";
export const BACK_SOON_PACKED_LEFTOVER =
  "The table went in the car. This note is leftover.";
export const BACK_SOON_MISSING_COPY = "That stall packed up.";

export type BackSoonNote = {
  note: string;
  at: string;
};

export type BackSoonMap = Record<string, BackSoonNote>;

export type BackSoonWriteResult =
  | { ok: true; map: BackSoonMap }
  | { ok: false; reason: "missing" | "empty"; map: BackSoonMap };

const emptyMap: BackSoonMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BackSoonNote {
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

export function normalizeBackSoonNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BACK_SOON_NOTE_MAX);
}

export function parseBackSoon(raw: string | null | undefined): BackSoonMap {
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
    const next: BackSoonMap = {};
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
        note: normalizeBackSoonNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBackSoon(map: BackSoonMap) {
  return JSON.stringify(map);
}

export function backSoonCookieValue(map: BackSoonMap): string {
  return serializeBackSoon(map);
}

export const BACK_SOON_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BACK_SOON_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BACK_SOON_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BACK_SOON_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBackSoonStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function backSoonFor(
  stallId: string,
  map: BackSoonMap = emptyMap,
): BackSoonNote | undefined {
  return map[stallId];
}

export function tapeBackSoon(
  stall: Stall | undefined,
  map: BackSoonMap,
  raw: string,
  at = new Date(),
): BackSoonWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBackSoonNote(raw);
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

export function clearBackSoon(
  stall: Stall | undefined,
  map: BackSoonMap,
): BackSoonWriteResult {
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

export function mergeBackSoonMaps(...maps: BackSoonMap[]): BackSoonMap {
  const next: BackSoonMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBackSoon(): BackSoonMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBackSoon(
      window.localStorage.getItem(BACK_SOON_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBackSoon(map: BackSoonMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBackSoon(map);
  try {
    window.localStorage.setItem(BACK_SOON_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BACK_SOON_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BACK_SOON_CHANGED_EVENT));
}

export function subscribeBackSoon(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BACK_SOON_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BACK_SOON_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BACK_SOON_CHANGED_EVENT, listener);
  };
}
