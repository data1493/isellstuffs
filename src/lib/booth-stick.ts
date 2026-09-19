/**
 * I don't email the zip — pay and open the folder, or bring a stick.
 * Plays is the disc. Folder already delivers. Walkers still ask Beats
 * to mail the zip. Not SMTP.
 *
 * Never write `iss:booth-shell`, plays, scan, folder, bent, cord,
 * look, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-stick` is the client cork.
 * Cookie `iss-booth-stick` is the same JSON so stall, `/lot`, and `/stick` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_STICK_STORAGE_KEY = "iss:booth-stick";
export const BOOTH_STICK_COOKIE_NAME = "iss-booth-stick";
export const BOOTH_STICK_CHANGED_EVENT = "iss:booth-stick-changed";

export const BOOTH_STICK_NOTE_MAX = 140;

export const BOOTH_STICK_PAPER_LINE =
  "I don't email the zip. Pay and open the folder. Or bring a stick. Not SMTP.";
export const BOOTH_STICK_EMPTY_COPY =
  "The zip stays in the folder. Nobody taped a stick note on this booth.";
export const BOOTH_STICK_EMPTY_TAPE =
  "Write the zip note or leave the folder to deliver it.";
export const BOOTH_STICK_PACKED_LEFTOVER =
  "The table went in the car. This stick note is leftover.";
export const BOOTH_STICK_MISSING_COPY = "That stall packed up.";

export function stallStickPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/stick`;
}

export function stallStickWritePath() {
  return "/stalls/stick";
}

export type BoothStickNote = {
  note: string;
  at: string;
};

export type BoothStickMap = Record<string, BoothStickNote>;

export type BoothStickWriteResult =
  | { ok: true; map: BoothStickMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothStickMap };

const emptyMap: BoothStickMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothStickNote {
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

export function normalizeBoothStickNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_STICK_NOTE_MAX);
}

export function parseBoothStick(raw: string | null | undefined): BoothStickMap {
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
    const next: BoothStickMap = {};
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
        note: normalizeBoothStickNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothStick(map: BoothStickMap) {
  return JSON.stringify(map);
}

export function boothStickCookieValue(map: BoothStickMap): string {
  return serializeBoothStick(map);
}

export const BOOTH_STICK_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_STICK_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_STICK_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_STICK_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothStickStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothStickFor(
  stallId: string,
  map: BoothStickMap = emptyMap,
): BoothStickNote | undefined {
  return map[stallId];
}

export function tapeBoothStick(
  stall: Stall | undefined,
  map: BoothStickMap,
  raw: string,
  at = new Date(),
): BoothStickWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothStickNote(raw);
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

export function clearBoothStick(
  stall: Stall | undefined,
  map: BoothStickMap,
): BoothStickWriteResult {
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

export function mergeBoothStickMaps(...maps: BoothStickMap[]): BoothStickMap {
  const next: BoothStickMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothStick(): BoothStickMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothStick(
      window.localStorage.getItem(BOOTH_STICK_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothStick(map: BoothStickMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothStick(map);
  try {
    window.localStorage.setItem(BOOTH_STICK_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_STICK_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_STICK_CHANGED_EVENT));
}

export function subscribeBoothStick(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_STICK_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_STICK_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_STICK_CHANGED_EVENT, listener);
  };
}
