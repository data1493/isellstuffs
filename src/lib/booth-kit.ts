/**
 * I don't assemble — shade stays in the box. Still a table.
 * Box is shade in the carton. Harp is no finial. Bulb is no spare.
 * Walkers still want Tuesday to put the shade on, or "make it a lamp."
 * I don't assemble. Shade stays in the box.
 *
 * Never write `iss:booth-harp`, `iss:booth-bulb`, `iss:booth-shade`,
 * `iss:box-listing-ids`, `iss:led-listing-ids`, `iss:cast-listing-ids`,
 * `iss:consult-listing-ids`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-kit` is the client cork.
 * Cookie `iss-booth-kit` is the same JSON so stall, `/lot`, and `/kit` SSR it.
 * Never persist a write-result `{ ok, map }` — that literal 500s the stall.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_KIT_STORAGE_KEY = "iss:booth-kit";
export const BOOTH_KIT_COOKIE_NAME = "iss-booth-kit";
export const BOOTH_KIT_CHANGED_EVENT = "iss:booth-kit-changed";

export const BOOTH_KIT_NOTE_MAX = 140;

export const BOOTH_KIT_PAPER_LINE =
  "I don't assemble. Shade stays in the box. Still a table. Not harp. Not bulb. Not a kit shop.";
export const BOOTH_KIT_EMPTY_COPY =
  "Shade stays in the box. Nobody taped a kit note on this booth.";
export const BOOTH_KIT_EMPTY_TAPE =
  "Say you don't assemble or leave the table.";
export const BOOTH_KIT_PACKED_LEFTOVER =
  "The table went in the car. This kit note is leftover.";
export const BOOTH_KIT_MISSING_COPY = "That stall packed up.";

export function stallKitPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/kit`;
}

export function stallKitWritePath() {
  return "/stalls/kit";
}

export type BoothKitNote = {
  note: string;
  at: string;
};

export type BoothKitMap = Record<string, BoothKitNote>;

export type BoothKitWriteResult =
  | { ok: true; map: BoothKitMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothKitMap };

const emptyMap: BoothKitMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isWriteResultLiteral(value: object): boolean {
  return (
    "ok" in value &&
    typeof (value as { ok: unknown }).ok === "boolean" &&
    "map" in value
  );
}

function isNote(value: unknown): value is BoothKitNote {
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

export function normalizeBoothKitNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_KIT_NOTE_MAX);
}

export function parseBoothKit(raw: string | null | undefined): BoothKitMap {
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
    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      isWriteResultLiteral(parsed)
    ) {
      return emptyMap;
    }
    const next: BoothKitMap = {};
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
        note: normalizeBoothKitNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothKit(map: BoothKitMap) {
  return JSON.stringify(map);
}

export function boothKitCookieValue(map: BoothKitMap): string {
  return serializeBoothKit(map);
}

export const BOOTH_KIT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_KIT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){try{var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_KIT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_KIT_CHANGED_EVENT)}));}}catch(e){}}}}catch(e){}`;

export function resolveBoothKitStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothKitFor(
  stallId: string,
  map: BoothKitMap = emptyMap,
): BoothKitNote | undefined {
  return map[stallId];
}

export function tapeBoothKit(
  stall: Stall | undefined,
  map: BoothKitMap,
  raw: string,
  at = new Date(),
): BoothKitWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothKitNote(raw);
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

export function clearBoothKit(
  stall: Stall | undefined,
  map: BoothKitMap,
): BoothKitWriteResult {
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

export function mergeBoothKitMaps(...maps: BoothKitMap[]): BoothKitMap {
  const next: BoothKitMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothKit(): BoothKitMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothKit(
      window.localStorage.getItem(BOOTH_KIT_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothKit(map: BoothKitMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothKit(map);
  try {
    window.localStorage.setItem(BOOTH_KIT_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_KIT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_KIT_CHANGED_EVENT));
}

export function subscribeBoothKit(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_KIT_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_KIT_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_KIT_CHANGED_EVENT, listener);
  };
}
