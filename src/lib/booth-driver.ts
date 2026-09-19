/**
 * I don't have a driver — blister stays closed. Still tested kinda.
 * Shell is don't open. Fix is no solder. Meter is no probe. Flash is
 * the cart. Walkers still want Half-Working to open the Game Boy, or
 * "just a driver." I don't have a driver. Blister stays closed.
 *
 * Never write `iss:booth-shell`, `iss:booth-fix`, `iss:booth-meter`,
 * `iss:booth-flash`, `iss:glow-listing-ids`, `iss:recap-listing-ids`,
 * `iss:beep-listing-ids`, `iss:log-listing-ids`, tote, sold, packed,
 * or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-driver` is the client cork.
 * Cookie `iss-booth-driver` is the same JSON so stall, `/lot`, and `/driver` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_DRIVER_STORAGE_KEY = "iss:booth-driver";
export const BOOTH_DRIVER_COOKIE_NAME = "iss-booth-driver";
export const BOOTH_DRIVER_CHANGED_EVENT = "iss:booth-driver-changed";

export const BOOTH_DRIVER_NOTE_MAX = 140;

export const BOOTH_DRIVER_PAPER_LINE =
  "I don't have a driver. Blister stays closed. Still tested kinda. Not shell. Not fix. Not meter.";
export const BOOTH_DRIVER_EMPTY_COPY =
  "Nobody taped a driver note on this booth. Blister stays closed.";
export const BOOTH_DRIVER_EMPTY_TAPE =
  "Say you don't have a driver or leave the table.";
export const BOOTH_DRIVER_PACKED_LEFTOVER =
  "The table went in the car. This driver note is leftover.";
export const BOOTH_DRIVER_MISSING_COPY = "That stall packed up.";

export function stallDriverPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/driver`;
}

export function stallDriverWritePath() {
  return "/stalls/driver";
}

export type BoothDriverNote = {
  note: string;
  at: string;
};

export type BoothDriverMap = Record<string, BoothDriverNote>;

export type BoothDriverWriteResult =
  | { ok: true; map: BoothDriverMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothDriverMap };

const emptyMap: BoothDriverMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothDriverNote {
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

export function normalizeBoothDriverNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_DRIVER_NOTE_MAX);
}

export function parseBoothDriver(raw: string | null | undefined): BoothDriverMap {
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
    const next: BoothDriverMap = {};
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
        note: normalizeBoothDriverNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothDriver(map: BoothDriverMap) {
  return JSON.stringify(map);
}

export function boothDriverCookieValue(map: BoothDriverMap): string {
  return serializeBoothDriver(map);
}

export const BOOTH_DRIVER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_DRIVER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_DRIVER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_DRIVER_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothDriverStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothDriverFor(
  stallId: string,
  map: BoothDriverMap = emptyMap,
): BoothDriverNote | undefined {
  return map[stallId];
}

export function tapeBoothDriver(
  stall: Stall | undefined,
  map: BoothDriverMap,
  raw: string,
  at = new Date(),
): BoothDriverWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothDriverNote(raw);
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

export function clearBoothDriver(
  stall: Stall | undefined,
  map: BoothDriverMap,
): BoothDriverWriteResult {
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

export function mergeBoothDriverMaps(...maps: BoothDriverMap[]): BoothDriverMap {
  const next: BoothDriverMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothDriver(): BoothDriverMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothDriver(
      window.localStorage.getItem(BOOTH_DRIVER_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothDriver(map: BoothDriverMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothDriver(map);
  try {
    window.localStorage.setItem(BOOTH_DRIVER_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_DRIVER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_DRIVER_CHANGED_EVENT));
}

export function subscribeBoothDriver(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_DRIVER_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_DRIVER_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_DRIVER_CHANGED_EVENT, listener);
  };
}
