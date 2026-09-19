/**
 * I don't print — take the file. I don't print the PDF at the table.
 * Burn is no CD-R. Stick is no email. Folder already delivers after pay.
 * Walkers still ask Beats to print the liner. Not burn. Not stick.
 *
 * Never write `iss:booth-burn`, `iss:booth-stick`, `iss:foundry-listing-ids`,
 * `iss:workbook-listing-ids`, folder keys, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-print` is the client cork.
 * Cookie `iss-booth-print` is the same JSON so stall, `/lot`, and `/print` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_PRINT_STORAGE_KEY = "iss:booth-print";
export const BOOTH_PRINT_COOKIE_NAME = "iss-booth-print";
export const BOOTH_PRINT_CHANGED_EVENT = "iss:booth-print-changed";

export const BOOTH_PRINT_NOTE_MAX = 140;

export const BOOTH_PRINT_PAPER_LINE =
  "I don't print. Take the file. Not burn. Not stick. Not a copy shop.";
export const BOOTH_PRINT_EMPTY_COPY =
  "The file stays a file. Nobody taped a print note on this booth.";
export const BOOTH_PRINT_EMPTY_TAPE =
  "Say you don't print or leave the file.";
export const BOOTH_PRINT_PACKED_LEFTOVER =
  "The table went in the car. This print note is leftover.";
export const BOOTH_PRINT_MISSING_COPY = "That stall packed up.";

export function stallPrintPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/print`;
}

export function stallPrintWritePath() {
  return "/stalls/print";
}

export type BoothPrintNote = {
  note: string;
  at: string;
};

export type BoothPrintMap = Record<string, BoothPrintNote>;

export type BoothPrintWriteResult =
  | { ok: true; map: BoothPrintMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothPrintMap };

const emptyMap: BoothPrintMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothPrintNote {
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

export function normalizeBoothPrintNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_PRINT_NOTE_MAX);
}

export function parseBoothPrint(raw: string | null | undefined): BoothPrintMap {
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
    const next: BoothPrintMap = {};
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
        note: normalizeBoothPrintNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothPrint(map: BoothPrintMap) {
  return JSON.stringify(map);
}

export function boothPrintCookieValue(map: BoothPrintMap): string {
  return serializeBoothPrint(map);
}

export const BOOTH_PRINT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_PRINT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_PRINT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_PRINT_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothPrintStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothPrintFor(
  stallId: string,
  map: BoothPrintMap = emptyMap,
): BoothPrintNote | undefined {
  return map[stallId];
}

export function tapeBoothPrint(
  stall: Stall | undefined,
  map: BoothPrintMap,
  raw: string,
  at = new Date(),
): BoothPrintWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothPrintNote(raw);
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

export function clearBoothPrint(
  stall: Stall | undefined,
  map: BoothPrintMap,
): BoothPrintWriteResult {
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

export function mergeBoothPrintMaps(...maps: BoothPrintMap[]): BoothPrintMap {
  const next: BoothPrintMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothPrint(): BoothPrintMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothPrint(
      window.localStorage.getItem(BOOTH_PRINT_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothPrint(map: BoothPrintMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothPrint(map);
  try {
    window.localStorage.setItem(BOOTH_PRINT_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_PRINT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_PRINT_CHANGED_EVENT));
}

export function subscribeBoothPrint(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_PRINT_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_PRINT_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_PRINT_CHANGED_EVENT, listener);
  };
}
