/**
 * I don't have a funnel — still a drawer. Still a table.
 * Pour is taste. Dishes is hose. Sponge is mug-wipe. Trivet is hot-glass.
 * Walkers still want Sink Drawer to hand a funnel, or leftover oil bottled.
 * I don't have a funnel. Still a drawer. Still a table.
 *
 * Never write `iss:booth-pour`, `iss:booth-dishes`, `iss:booth-sponge`,
 * `iss:booth-trivet`, `iss:booth-towel`, `iss:booth-foil`, `iss:booth-wrap`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-funnel` is the client cork.
 * Cookie `iss-booth-funnel` is the same JSON so stall, `/lot`, and `/funnel` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_FUNNEL_STORAGE_KEY = "iss:booth-funnel";
export const BOOTH_FUNNEL_COOKIE_NAME = "iss-booth-funnel";
export const BOOTH_FUNNEL_CHANGED_EVENT = "iss:booth-funnel-changed";

export const BOOTH_FUNNEL_NOTE_MAX = 140;

export const BOOTH_FUNNEL_PAPER_LINE =
  "I don't have a funnel. Still a drawer. Still a table.";
export const BOOTH_FUNNEL_EMPTY_COPY =
  "Nobody taped a funnel note on this booth. Still a drawer. Still a table.";
export const BOOTH_FUNNEL_EMPTY_TAPE =
  "Say you don't have a funnel or leave the table.";
export const BOOTH_FUNNEL_PACKED_LEFTOVER =
  "The table went in the car. This funnel note is leftover.";
export const BOOTH_FUNNEL_MISSING_COPY = "That stall packed up.";

export function stallFunnelPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/funnel`;
}

export function stallFunnelWritePath() {
  return "/stalls/funnel";
}

export type BoothFunnelNote = {
  note: string;
  at: string;
};

export type BoothFunnelMap = Record<string, BoothFunnelNote>;

export type BoothFunnelWriteResult =
  | { ok: true; map: BoothFunnelMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothFunnelMap };

const emptyMap: BoothFunnelMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothFunnelNote {
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
  // `{ ok, map }` / `{ ok: true }` / `{ ok, listingIds }` 500 the stall if treated as notes.
  return typeof row.ok === "boolean";
}

export function normalizeBoothFunnelNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_FUNNEL_NOTE_MAX);
}

export function parseBoothFunnel(raw: string | null | undefined): BoothFunnelMap {
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
    const next: BoothFunnelMap = {};
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
        note: normalizeBoothFunnelNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothFunnel(map: BoothFunnelMap) {
  return JSON.stringify(map);
}

export function boothFunnelCookieValue(map: BoothFunnelMap): string {
  return serializeBoothFunnel(map);
}

export const BOOTH_FUNNEL_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_FUNNEL_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_FUNNEL_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_FUNNEL_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothFunnelStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothFunnelFor(
  stallId: string,
  map: BoothFunnelMap = emptyMap,
): BoothFunnelNote | undefined {
  return map[stallId];
}

export function tapeBoothFunnel(
  stall: Stall | undefined,
  map: BoothFunnelMap,
  raw: string,
  at = new Date(),
): BoothFunnelWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothFunnelNote(raw);
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

export function clearBoothFunnel(
  stall: Stall | undefined,
  map: BoothFunnelMap,
): BoothFunnelWriteResult {
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

export function mergeBoothFunnelMaps(...maps: BoothFunnelMap[]): BoothFunnelMap {
  const next: BoothFunnelMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothFunnel(): BoothFunnelMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothFunnel(
      window.localStorage.getItem(BOOTH_FUNNEL_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothFunnel(map: BoothFunnelMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothFunnel(map);
  try {
    window.localStorage.setItem(BOOTH_FUNNEL_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_FUNNEL_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_FUNNEL_CHANGED_EVENT));
}

export function subscribeBoothFunnel(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_FUNNEL_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_FUNNEL_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_FUNNEL_CHANGED_EVENT, listener);
  };
}
