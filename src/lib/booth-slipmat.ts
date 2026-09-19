/**
 * I don't have a slipmat — still a crate. Still no deck.
 * Deck is I don't have a deck. Seat is don't sit on the crate.
 * Walkers still want Sunday Crate to hand a slipmat, or cue the LP on felt.
 * I don't have a slipmat. Still a crate. Still no deck.
 *
 * Never write `iss:booth-deck`, `iss:booth-seat`, `iss:booth-felt`,
 * `iss:booth-wrap`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-slipmat` is the client cork.
 * Cookie `iss-booth-slipmat` is the same JSON so stall, `/lot`, and `/slipmat` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_SLIPMAT_STORAGE_KEY = "iss:booth-slipmat";
export const BOOTH_SLIPMAT_COOKIE_NAME = "iss-booth-slipmat";
export const BOOTH_SLIPMAT_CHANGED_EVENT = "iss:booth-slipmat-changed";

export const BOOTH_SLIPMAT_NOTE_MAX = 140;

export const BOOTH_SLIPMAT_PAPER_LINE =
  "I don't have a slipmat. Still a crate. Still no deck.";
export const BOOTH_SLIPMAT_EMPTY_COPY =
  "Nobody taped a slipmat note on this booth. Still a crate. Still no deck.";
export const BOOTH_SLIPMAT_EMPTY_TAPE =
  "Say you don't have a slipmat or leave the table.";
export const BOOTH_SLIPMAT_PACKED_LEFTOVER =
  "The table went in the car. This slipmat note is leftover.";
export const BOOTH_SLIPMAT_MISSING_COPY = "That stall packed up.";

export function stallSlipmatPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/slipmat`;
}

export function stallSlipmatWritePath() {
  return "/stalls/slipmat";
}

export type BoothSlipmatNote = {
  note: string;
  at: string;
};

export type BoothSlipmatMap = Record<string, BoothSlipmatNote>;

export type BoothSlipmatWriteResult =
  | { ok: true; map: BoothSlipmatMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothSlipmatMap };

const emptyMap: BoothSlipmatMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothSlipmatNote {
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

export function normalizeBoothSlipmatNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_SLIPMAT_NOTE_MAX);
}

export function parseBoothSlipmat(raw: string | null | undefined): BoothSlipmatMap {
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
    const next: BoothSlipmatMap = {};
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
        note: normalizeBoothSlipmatNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothSlipmat(map: BoothSlipmatMap) {
  return JSON.stringify(map);
}

export function boothSlipmatCookieValue(map: BoothSlipmatMap): string {
  return serializeBoothSlipmat(map);
}

export const BOOTH_SLIPMAT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_SLIPMAT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_SLIPMAT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_SLIPMAT_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothSlipmatStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothSlipmatFor(
  stallId: string,
  map: BoothSlipmatMap = emptyMap,
): BoothSlipmatNote | undefined {
  return map[stallId];
}

export function tapeBoothSlipmat(
  stall: Stall | undefined,
  map: BoothSlipmatMap,
  raw: string,
  at = new Date(),
): BoothSlipmatWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothSlipmatNote(raw);
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

export function clearBoothSlipmat(
  stall: Stall | undefined,
  map: BoothSlipmatMap,
): BoothSlipmatWriteResult {
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

export function mergeBoothSlipmatMaps(...maps: BoothSlipmatMap[]): BoothSlipmatMap {
  const next: BoothSlipmatMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothSlipmat(): BoothSlipmatMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothSlipmat(
      window.localStorage.getItem(BOOTH_SLIPMAT_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothSlipmat(map: BoothSlipmatMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothSlipmat(map);
  try {
    window.localStorage.setItem(BOOTH_SLIPMAT_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_SLIPMAT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_SLIPMAT_CHANGED_EVENT));
}

export function subscribeBoothSlipmat(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_SLIPMAT_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_SLIPMAT_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_SLIPMAT_CHANGED_EVENT, listener);
  };
}
