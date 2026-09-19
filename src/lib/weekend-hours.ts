/**
 * This weekend’s hours. Fixture copy in `boothPickups` stays.
 *
 * Shape: JSON object `{ [stallId]: { hours, place, note } }`.
 * localStorage key `iss:weekend-hours` is the client tape.
 * Cookie `iss-weekend-hours` is the same JSON so stall, PDP,
 * pickup, and the queue SSR it.
 *
 * Not a Stall field. Not a mall `/hours` directory.
 * Never write packed / watched / wanted / sold / tote keys.
 */
import { stallById, stallBySlug, type Stall } from "./commerce";

export const WEEKEND_HOURS_STORAGE_KEY = "iss:weekend-hours";
export const WEEKEND_HOURS_COOKIE = "iss-weekend-hours";
export const WEEKEND_HOURS_CHANGED_EVENT = "iss:weekend-hours-changed";

export const DEFAULT_HOURS_STALL_ID = "folding-table-tuesday";

export type WeekendHoursTape = {
  hours: string;
  place: string;
  note: string;
};

export type WeekendHoursMap = Record<string, WeekendHoursTape>;

const SERVER_STORE = Symbol.for("iss.weekend-hours");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: WeekendHoursMap;
};

const emptyMap: WeekendHoursMap = {};

let cachedRaw: string | null | undefined;
let cachedMap: WeekendHoursMap = emptyMap;

function canUseStorage() {
  return typeof window !== "undefined";
}

function isTape(value: unknown): value is WeekendHoursTape {
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

function cleanTape(value: WeekendHoursTape): WeekendHoursTape {
  return {
    hours: value.hours.trim(),
    place: value.place.trim(),
    note: value.note.trim(),
  };
}

export function parseWeekendHours(
  raw: string | null | undefined,
): WeekendHoursMap {
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
    const next: WeekendHoursMap = {};
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

export function weekendHoursCookieValue(map: WeekendHoursMap): string {
  return JSON.stringify(map);
}

export const WEEKEND_HOURS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${WEEKEND_HOURS_COOKIE}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(WEEKEND_HOURS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(WEEKEND_HOURS_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${WEEKEND_HOURS_COOKIE}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedMap;
  }
  cachedRaw = raw;
  cachedMap = parseWeekendHours(raw);
  return cachedMap;
}

function serverStore(): WeekendHoursMap {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyMap;
}

type WorkUnitStore = {
  cookies?: { get?: (name: string) => { value?: string } | undefined };
  headers?: { get?: (name: string) => string | null };
};

function peekCookieHeader(header: string | null | undefined) {
  if (!header) {
    return undefined;
  }
  const parts = header.split("; ");
  const prefix = `${WEEKEND_HOURS_COOKIE}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function peekRequestHoursRaw(): string | undefined {
  if (canUseStorage()) {
    return undefined;
  }

  try {
    const builtin = (
      process as NodeJS.Process & {
        getBuiltinModule?: (name: string) => {
          createRequire: (url: string) => (id: string) => {
            workUnitAsyncStorage?: {
              getStore?: () => WorkUnitStore | undefined;
            };
          };
        };
      }
    ).getBuiltinModule?.("module");
    const req = builtin?.createRequire(import.meta.url);
    if (!req) {
      return undefined;
    }
    const paths = [
      "next/dist/server/app-render/work-unit-async-storage.external",
      "next/dist/server/app-render/work-unit-async-storage-instance",
    ];
    for (const id of paths) {
      try {
        const mod = req(id) as {
          workUnitAsyncStorage?: {
            getStore?: () => WorkUnitStore | undefined;
          };
          workUnitAsyncStorageInstance?: {
            getStore?: () => WorkUnitStore | undefined;
          };
        };
        const store =
          mod.workUnitAsyncStorage?.getStore?.() ??
          mod.workUnitAsyncStorageInstance?.getStore?.();
        if (!store) {
          continue;
        }

        const fromCookies = store.cookies?.get?.(WEEKEND_HOURS_COOKIE)?.value;
        if (fromCookies) {
          return fromCookies;
        }

        const fromHeader = peekCookieHeader(store.headers?.get?.("cookie"));
        if (fromHeader) {
          return fromHeader;
        }
      } catch {
        // try the next Next.js store module
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function mergeHoursMaps(
  ...maps: WeekendHoursMap[]
): WeekendHoursMap {
  const next: WeekendHoursMap = {};
  for (const map of maps) {
    for (const [stallId, tape] of Object.entries(map)) {
      next[stallId] = tape;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readWeekendHours(): WeekendHoursMap {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(WEEKEND_HOURS_STORAGE_KEY);
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
            WEEKEND_HOURS_STORAGE_KEY,
            weekendHoursCookieValue(map),
          );
        } catch {
          // blocked storage
        }
        return map;
      }
    }
    return snapshotFromRaw(fromStorage ?? null);
  }

  const peeked = parseWeekendHours(peekRequestHoursRaw());
  const stored = serverStore();
  const merged = mergeHoursMaps(stored, peeked);
  if (Object.keys(peeked).length > 0) {
    const g = globalThis as ServerGlobal;
    g[SERVER_STORE] = merged;
  }
  return merged;
}

export function writeWeekendHours(map: WeekendHoursMap) {
  const next = parseWeekendHours(weekendHoursCookieValue(map));
  const raw = weekendHoursCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(WEEKEND_HOURS_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${WEEKEND_HOURS_COOKIE}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedMap = next;
    window.dispatchEvent(new Event(WEEKEND_HOURS_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedMap = next;
}

export function tapedHoursFor(
  stallId: string,
  map = readWeekendHours(),
): WeekendHoursTape | undefined {
  return map[stallId];
}

export function hoursStallFromInput(raw: string | undefined): Stall | undefined {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function hoursStallFromQuery(raw: string | undefined): Stall | undefined {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) {
    return stallById(DEFAULT_HOURS_STALL_ID);
  }
  return hoursStallFromInput(trimmed);
}

export type WeekendHoursWriteResult =
  | { ok: true; map: WeekendHoursMap }
  | { ok: false; reason: "missing" | "empty"; map: WeekendHoursMap };

export function tapeWeekendHours(
  stall: Stall | undefined,
  map: WeekendHoursMap,
  fields: { hours: string; place: string; note: string },
): WeekendHoursWriteResult {
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

export function restoreWeekendHours(
  stall: Stall | undefined,
  map: WeekendHoursMap,
): WeekendHoursWriteResult {
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
