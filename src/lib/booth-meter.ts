/**
 * I don't have a meter — sold as a pile. Not a bench.
 * Walkers still want Half-Working to probe the tangle, or "test it
 * with a meter." I don't have a meter. Sold as a pile.
 *
 * Never write `iss:booth-fix`, `iss:booth-claim`, `iss:booth-shell`,
 * `iss:glue-listing-ids`, `iss:phone-listing-ids`, `iss:parts-listing-ids`,
 * `iss:pile-listing-ids`, `iss:warm-listing-ids`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-meter` is the client cork.
 * Cookie `iss-booth-meter` is the same JSON so stall, `/lot`, and `/meter` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_METER_STORAGE_KEY = "iss:booth-meter";
export const BOOTH_METER_COOKIE_NAME = "iss-booth-meter";
export const BOOTH_METER_CHANGED_EVENT = "iss:booth-meter-changed";

export const BOOTH_METER_NOTE_MAX = 140;

export const BOOTH_METER_PAPER_LINE =
  "I don't have a meter. Sold as a pile. Not a bench. Not fix. Not claim.";
export const BOOTH_METER_EMPTY_COPY =
  "Nobody taped a meter note on this booth. Sold as a pile.";
export const BOOTH_METER_EMPTY_TAPE =
  "Say you don't have a meter or leave the table.";
export const BOOTH_METER_PACKED_LEFTOVER =
  "The table went in the car. This meter note is leftover.";
export const BOOTH_METER_MISSING_COPY = "That stall packed up.";

export function stallMeterPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/meter`;
}

export function stallMeterWritePath() {
  return "/stalls/meter";
}

export type BoothMeterNote = {
  note: string;
  at: string;
};

export type BoothMeterMap = Record<string, BoothMeterNote>;

export type BoothMeterWriteResult =
  | { ok: true; map: BoothMeterMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothMeterMap };

const emptyMap: BoothMeterMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothMeterNote {
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

export function normalizeBoothMeterNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_METER_NOTE_MAX);
}

export function parseBoothMeter(raw: string | null | undefined): BoothMeterMap {
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
    const next: BoothMeterMap = {};
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
        note: normalizeBoothMeterNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothMeter(map: BoothMeterMap) {
  return JSON.stringify(map);
}

export function boothMeterCookieValue(map: BoothMeterMap): string {
  return serializeBoothMeter(map);
}

export const BOOTH_METER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_METER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_METER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_METER_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothMeterStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothMeterFor(
  stallId: string,
  map: BoothMeterMap = emptyMap,
): BoothMeterNote | undefined {
  return map[stallId];
}

export function tapeBoothMeter(
  stall: Stall | undefined,
  map: BoothMeterMap,
  raw: string,
  at = new Date(),
): BoothMeterWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothMeterNote(raw);
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

export function clearBoothMeter(
  stall: Stall | undefined,
  map: BoothMeterMap,
): BoothMeterWriteResult {
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

export function mergeBoothMeterMaps(...maps: BoothMeterMap[]): BoothMeterMap {
  const next: BoothMeterMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothMeter(): BoothMeterMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothMeter(
      window.localStorage.getItem(BOOTH_METER_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothMeter(map: BoothMeterMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothMeter(map);
  try {
    window.localStorage.setItem(BOOTH_METER_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_METER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_METER_CHANGED_EVENT));
}

export function subscribeBoothMeter(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_METER_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_METER_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_METER_CHANGED_EVENT, listener);
  };
}
