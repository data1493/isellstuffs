/**
 * I don't have buttons — snaps stay. Still tote. Not a tailor.
 * Walkers still want Closet to throw a spare, or "make the
 * windbreaker close." I don't have buttons. Snaps stay.
 *
 * Never write `iss:booth-sew`, `iss:booth-pose`, `iss:booth-stay`,
 * `iss:booth-stack`, `iss:spray-listing-ids`, `iss:even-listing-ids`,
 * `iss:wash-listing-ids`, `iss:booth-harp`, tote, sold, packed,
 * or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-buttons` is the client cork.
 * Cookie `iss-booth-buttons` is the same JSON so stall, `/lot`, and `/buttons` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_BUTTONS_STORAGE_KEY = "iss:booth-buttons";
export const BOOTH_BUTTONS_COOKIE_NAME = "iss-booth-buttons";
export const BOOTH_BUTTONS_CHANGED_EVENT = "iss:booth-buttons-changed";

export const BOOTH_BUTTONS_NOTE_MAX = 140;

export const BOOTH_BUTTONS_PAPER_LINE =
  "I don't have buttons. Snaps stay. Still tote. Not a tailor.";
export const BOOTH_BUTTONS_EMPTY_COPY =
  "Snaps stay. Nobody taped a buttons note on this booth.";
export const BOOTH_BUTTONS_EMPTY_TAPE =
  "Say you don't have buttons or leave the table.";
export const BOOTH_BUTTONS_PACKED_LEFTOVER =
  "The table went in the car. This buttons note is leftover.";
export const BOOTH_BUTTONS_MISSING_COPY = "That stall packed up.";

export function stallButtonsPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/buttons`;
}

export function stallButtonsWritePath() {
  return "/stalls/buttons";
}

export type BoothButtonsNote = {
  note: string;
  at: string;
};

export type BoothButtonsMap = Record<string, BoothButtonsNote>;

export type BoothButtonsWriteResult =
  | { ok: true; map: BoothButtonsMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothButtonsMap };

const emptyMap: BoothButtonsMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothButtonsNote {
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

export function normalizeBoothButtonsNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_BUTTONS_NOTE_MAX);
}

export function parseBoothButtons(raw: string | null | undefined): BoothButtonsMap {
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
    const next: BoothButtonsMap = {};
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
        note: normalizeBoothButtonsNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothButtons(map: BoothButtonsMap) {
  return JSON.stringify(map);
}

export function boothButtonsCookieValue(map: BoothButtonsMap): string {
  return serializeBoothButtons(map);
}

export const BOOTH_BUTTONS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_BUTTONS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_BUTTONS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_BUTTONS_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothButtonsStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothButtonsFor(
  stallId: string,
  map: BoothButtonsMap = emptyMap,
): BoothButtonsNote | undefined {
  return map[stallId];
}

export function tapeBoothButtons(
  stall: Stall | undefined,
  map: BoothButtonsMap,
  raw: string,
  at = new Date(),
): BoothButtonsWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothButtonsNote(raw);
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

export function clearBoothButtons(
  stall: Stall | undefined,
  map: BoothButtonsMap,
): BoothButtonsWriteResult {
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

export function mergeBoothButtonsMaps(...maps: BoothButtonsMap[]): BoothButtonsMap {
  const next: BoothButtonsMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothButtons(): BoothButtonsMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothButtons(
      window.localStorage.getItem(BOOTH_BUTTONS_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothButtons(map: BoothButtonsMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothButtons(map);
  try {
    window.localStorage.setItem(BOOTH_BUTTONS_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_BUTTONS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_BUTTONS_CHANGED_EVENT));
}

export function subscribeBoothButtons(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_BUTTONS_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_BUTTONS_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_BUTTONS_CHANGED_EVENT, listener);
  };
}
