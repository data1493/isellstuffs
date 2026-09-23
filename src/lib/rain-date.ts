/**
 * Sunday rain date. Saturday hours stay on `/sell/hours`.
 *
 * Shape: JSON object `{ [stallId]: { hours, place, note } }`.
 * localStorage key `iss:rain-dates` is the client tape.
 * Cookie `iss-rain-dates` is the same JSON so `/rain` and
 * `/sell/rain` SSR it.
 *
 * Not a Stall field. Not `iss:weekend-hours`. Pickup still
 * recites the Saturday plan. Never write packed / watched /
 * hours / sold / tote keys.
 */
import { allStalls, stallById, stallBySlug, type Stall } from "./commerce";

export const RAIN_DATE_STORAGE_KEY = "iss:rain-dates";
export const RAIN_DATE_COOKIE = "iss-rain-dates";
export const RAIN_DATE_CHANGED_EVENT = "iss:rain-dates-changed";

export const DEFAULT_RAIN_STALL_ID = "folding-table-tuesday";

export type RainDateTape = {
  hours: string;
  place: string;
  note: string;
};

export type RainDateMap = Record<string, RainDateTape>;

export type RainDateRow = {
  stall: Stall;
  tape: RainDateTape;
};

const SERVER_STORE = Symbol.for("iss.rain-dates");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: RainDateMap;
};

const emptyMap: RainDateMap = {};

let cachedRaw: string | null | undefined;
let cachedMap: RainDateMap = emptyMap;

function canUseStorage() {
  return typeof window !== "undefined";
}

function isTape(value: unknown): value is RainDateTape {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as Record<string, unknown>;
  return (
    typeof row.hours === "string" &&
    row.hours.trim().length > 0 &&
    typeof row.place === "string" &&
    row.place.trim().length > 0 &&
    typeof row.note === "string" &&
    row.note.trim().length > 0
  );
}

function cleanTape(value: RainDateTape): RainDateTape {
  return {
    hours: value.hours.trim(),
    place: value.place.trim(),
    note: value.note.trim(),
  };
}

export function parseRainDates(raw: string | null | undefined): RainDateMap {
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
    const next: RainDateMap = {};
    for (const [stallId, tape] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (typeof stallId !== "string" || stallId.length === 0) {
        continue;
      }
      if (!isTape(tape)) {
        continue;
      }
      next[stallId] = cleanTape(tape);
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function rainDateCookieValue(map: RainDateMap): string {
  return JSON.stringify(map);
}

export const RAIN_DATE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${RAIN_DATE_COOKIE}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(RAIN_DATE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(RAIN_DATE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${RAIN_DATE_COOKIE}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedMap;
  }
  cachedRaw = raw;
  cachedMap = parseRainDates(raw);
  return cachedMap;
}

function serverStore(): RainDateMap {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyMap;
}

function mergeRainMaps(...maps: RainDateMap[]): RainDateMap {
  const next: RainDateMap = {};
  for (const map of maps) {
    for (const [stallId, tape] of Object.entries(map)) {
      next[stallId] = tape;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readRainDates(): RainDateMap {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(RAIN_DATE_STORAGE_KEY);
    if (fromStorage) {
      const stored = snapshotFromRaw(fromStorage);
      if (Object.keys(stored).length > 0) {
        return stored;
      }
    }
    const fromCookie = readCookieRaw();
    if (fromCookie) {
      const map = snapshotFromRaw(fromCookie);
      if (Object.keys(map).length > 0) {
        try {
          window.localStorage.setItem(
            RAIN_DATE_STORAGE_KEY,
            rainDateCookieValue(map),
          );
        } catch {
          // blocked storage
        }
        return map;
      }
    }
    return snapshotFromRaw(fromStorage ?? null);
  }

  return serverStore();
}

export function writeRainDates(map: RainDateMap) {
  const next = parseRainDates(rainDateCookieValue(map));
  const raw = rainDateCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(RAIN_DATE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${RAIN_DATE_COOKIE}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedMap = next;
    window.dispatchEvent(new Event(RAIN_DATE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedMap = next;
}

export function tapedRainDateFor(
  stallId: string,
  map = readRainDates(),
): RainDateTape | undefined {
  return map[stallId];
}

export function rainStallFromInput(raw: string | undefined): Stall | undefined {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function rainStallFromQuery(raw: string | undefined): Stall | undefined {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) {
    return stallById(DEFAULT_RAIN_STALL_ID);
  }
  return rainStallFromInput(trimmed);
}

export type RainDateWriteResult =
  | { ok: true; map: RainDateMap }
  | { ok: false; reason: "missing" | "empty"; map: RainDateMap };

export function tapeRainDate(
  stall: Stall | undefined,
  map: RainDateMap,
  fields: { hours: string; place: string; note: string },
): RainDateWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const tape = {
    hours: fields.hours.trim(),
    place: fields.place.trim(),
    note: fields.note.trim(),
  };
  if (!tape.hours || !tape.place || !tape.note) {
    return { ok: false, reason: "empty", map };
  }
  return { ok: true, map: { ...map, [stall.id]: tape } };
}

export function restoreRainDate(
  stall: Stall | undefined,
  map: RainDateMap,
): RainDateWriteResult {
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

/** Catalog booths that taped a Sunday rain date. Missing ids drop off. */
export function rainDateBoard(map: RainDateMap = readRainDates()): RainDateRow[] {
  return allStalls().flatMap((stall) => {
    const tape = map[stall.id];
    return tape ? [{ stall, tape }] : [];
  });
}
