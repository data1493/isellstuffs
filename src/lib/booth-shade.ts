/**
 * Keep it in the shade — the crate sits in the sun.
 * Rain is Sunday if wet. Shade is this afternoon’s sun.
 *
 * Never write `iss:rain-dates`, `iss:booth-stay`, `iss:free-box`,
 * hours, tarp, tote, sold, packed, buy, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-shade` is the client cork.
 * Cookie `iss-booth-shade` is the same JSON so stall, `/lot`, and `/shade` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_SHADE_STORAGE_KEY = "iss:booth-shade";
export const BOOTH_SHADE_COOKIE_NAME = "iss-booth-shade";
export const BOOTH_SHADE_CHANGED_EVENT = "iss:booth-shade-changed";

export const BOOTH_SHADE_NOTE_MAX = 140;

export const BOOTH_SHADE_PAPER_LINE =
  "Keep it in the shade. Not rain. Not the tarp. Not hangers stay.";
export const BOOTH_SHADE_EMPTY_COPY =
  "This table sits in whatever light it got.";
export const BOOTH_SHADE_EMPTY_TAPE =
  "Say what stays in the shade or leave the sun.";
export const BOOTH_SHADE_PACKED_LEFTOVER =
  "The table went in the car. This shade note is leftover.";
export const BOOTH_SHADE_MISSING_COPY = "That stall packed up.";

export type BoothShadeNote = {
  note: string;
  at: string;
};

export type BoothShadeMap = Record<string, BoothShadeNote>;

export type BoothShadeWriteResult =
  | { ok: true; map: BoothShadeMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothShadeMap };

const emptyMap: BoothShadeMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothShadeNote {
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

export function normalizeBoothShadeNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_SHADE_NOTE_MAX);
}

export function parseBoothShade(raw: string | null | undefined): BoothShadeMap {
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
    const next: BoothShadeMap = {};
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
        note: normalizeBoothShadeNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothShade(map: BoothShadeMap) {
  return JSON.stringify(map);
}

export function boothShadeCookieValue(map: BoothShadeMap): string {
  return serializeBoothShade(map);
}

export const BOOTH_SHADE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_SHADE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_SHADE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_SHADE_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothShadeStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothShadeFor(
  stallId: string,
  map: BoothShadeMap = emptyMap,
): BoothShadeNote | undefined {
  return map[stallId];
}

export function tapeBoothShade(
  stall: Stall | undefined,
  map: BoothShadeMap,
  raw: string,
  at = new Date(),
): BoothShadeWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothShadeNote(raw);
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

export function clearBoothShade(
  stall: Stall | undefined,
  map: BoothShadeMap,
): BoothShadeWriteResult {
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

export function mergeBoothShadeMaps(...maps: BoothShadeMap[]): BoothShadeMap {
  const next: BoothShadeMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothShade(): BoothShadeMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothShade(
      window.localStorage.getItem(BOOTH_SHADE_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothShade(map: BoothShadeMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothShade(map);
  try {
    window.localStorage.setItem(BOOTH_SHADE_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_SHADE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_SHADE_CHANGED_EVENT));
}

export function subscribeBoothShade(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_SHADE_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_SHADE_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_SHADE_CHANGED_EVENT, listener);
  };
}
