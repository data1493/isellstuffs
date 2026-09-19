/**
 * I don't have a sponge — still dishes. Still a hose.
 * Dishes is I don't do dishes. Pour is I don't pour. Wrap is newspaper.
 * Walkers still want Sink Drawer to hand a sponge, or wash at the hose.
 * I don't have a sponge. Still dishes. Still a hose.
 *
 * Never write `iss:booth-dishes`, `iss:booth-pour`, `iss:booth-wrap`,
 * `iss:booth-towel`, `iss:booth-foil`, `iss:booth-soap`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-sponge` is the client cork.
 * Cookie `iss-booth-sponge` is the same JSON so stall, `/lot`, and `/sponge` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_SPONGE_STORAGE_KEY = "iss:booth-sponge";
export const BOOTH_SPONGE_COOKIE_NAME = "iss-booth-sponge";
export const BOOTH_SPONGE_CHANGED_EVENT = "iss:booth-sponge-changed";

export const BOOTH_SPONGE_NOTE_MAX = 140;

export const BOOTH_SPONGE_PAPER_LINE =
  "I don't have a sponge. Still dishes. Still a hose.";
export const BOOTH_SPONGE_EMPTY_COPY =
  "Nobody taped a sponge note on this booth. Still dishes. Still a hose.";
export const BOOTH_SPONGE_EMPTY_TAPE =
  "Say you don't have a sponge or leave the table.";
export const BOOTH_SPONGE_PACKED_LEFTOVER =
  "The table went in the car. This sponge note is leftover.";
export const BOOTH_SPONGE_MISSING_COPY = "That stall packed up.";

export function stallSpongePath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/sponge`;
}

export function stallSpongeWritePath() {
  return "/stalls/sponge";
}

export type BoothSpongeNote = {
  note: string;
  at: string;
};

export type BoothSpongeMap = Record<string, BoothSpongeNote>;

export type BoothSpongeWriteResult =
  | { ok: true; map: BoothSpongeMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothSpongeMap };

const emptyMap: BoothSpongeMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothSpongeNote {
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

export function normalizeBoothSpongeNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_SPONGE_NOTE_MAX);
}

export function parseBoothSponge(raw: string | null | undefined): BoothSpongeMap {
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
    const next: BoothSpongeMap = {};
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
        note: normalizeBoothSpongeNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothSponge(map: BoothSpongeMap) {
  return JSON.stringify(map);
}

export function boothSpongeCookieValue(map: BoothSpongeMap): string {
  return serializeBoothSponge(map);
}

export const BOOTH_SPONGE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_SPONGE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_SPONGE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_SPONGE_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothSpongeStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothSpongeFor(
  stallId: string,
  map: BoothSpongeMap = emptyMap,
): BoothSpongeNote | undefined {
  return map[stallId];
}

export function tapeBoothSponge(
  stall: Stall | undefined,
  map: BoothSpongeMap,
  raw: string,
  at = new Date(),
): BoothSpongeWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothSpongeNote(raw);
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

export function clearBoothSponge(
  stall: Stall | undefined,
  map: BoothSpongeMap,
): BoothSpongeWriteResult {
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

export function mergeBoothSpongeMaps(...maps: BoothSpongeMap[]): BoothSpongeMap {
  const next: BoothSpongeMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothSponge(): BoothSpongeMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothSponge(
      window.localStorage.getItem(BOOTH_SPONGE_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothSponge(map: BoothSpongeMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothSponge(map);
  try {
    window.localStorage.setItem(BOOTH_SPONGE_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_SPONGE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_SPONGE_CHANGED_EVENT));
}

export function subscribeBoothSponge(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_SPONGE_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_SPONGE_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_SPONGE_CHANGED_EVENT, listener);
  };
}
