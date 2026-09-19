/**
 * Don't sit on the crate — the crate is stock, not a chair.
 * Stay is hangers. Kids is you-buy-it. Walkers still sit on
 * Sunday Crate.
 *
 * Never write `iss:booth-stay`, `iss:booth-kids`, `iss:booth-dig`,
 * `iss:booth-match`, ring, strap, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-seat` is the client cork.
 * Cookie `iss-booth-seat` is the same JSON so stall, `/lot`, and `/seat` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_SEAT_STORAGE_KEY = "iss:booth-seat";
export const BOOTH_SEAT_COOKIE_NAME = "iss-booth-seat";
export const BOOTH_SEAT_CHANGED_EVENT = "iss:booth-seat-changed";

export const BOOTH_SEAT_NOTE_MAX = 140;

export const BOOTH_SEAT_PAPER_LINE =
  "Don't sit on the crate. The crate is stock, not a chair. Not stay. Not kids.";
export const BOOTH_SEAT_EMPTY_COPY =
  "The crate is still a chair. Nobody taped a sit note on this booth.";
export const BOOTH_SEAT_EMPTY_TAPE =
  "Write the sit note or leave the crate as a chair.";
export const BOOTH_SEAT_PACKED_LEFTOVER =
  "The table went in the car. This sit note is leftover.";
export const BOOTH_SEAT_MISSING_COPY = "That stall packed up.";

export function stallSeatPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/seat`;
}

export function stallSeatWritePath() {
  return "/stalls/seat";
}

export type BoothSeatNote = {
  note: string;
  at: string;
};

export type BoothSeatMap = Record<string, BoothSeatNote>;

export type BoothSeatWriteResult =
  | { ok: true; map: BoothSeatMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothSeatMap };

const emptyMap: BoothSeatMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothSeatNote {
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

export function normalizeBoothSeatNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_SEAT_NOTE_MAX);
}

export function parseBoothSeat(raw: string | null | undefined): BoothSeatMap {
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
    const next: BoothSeatMap = {};
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
        note: normalizeBoothSeatNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothSeat(map: BoothSeatMap) {
  return JSON.stringify(map);
}

export function boothSeatCookieValue(map: BoothSeatMap): string {
  return serializeBoothSeat(map);
}

export const BOOTH_SEAT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_SEAT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_SEAT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_SEAT_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothSeatStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothSeatFor(
  stallId: string,
  map: BoothSeatMap = emptyMap,
): BoothSeatNote | undefined {
  return map[stallId];
}

export function tapeBoothSeat(
  stall: Stall | undefined,
  map: BoothSeatMap,
  raw: string,
  at = new Date(),
): BoothSeatWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothSeatNote(raw);
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

export function clearBoothSeat(
  stall: Stall | undefined,
  map: BoothSeatMap,
): BoothSeatWriteResult {
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

export function mergeBoothSeatMaps(...maps: BoothSeatMap[]): BoothSeatMap {
  const next: BoothSeatMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothSeat(): BoothSeatMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothSeat(
      window.localStorage.getItem(BOOTH_SEAT_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothSeat(map: BoothSeatMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothSeat(map);
  try {
    window.localStorage.setItem(BOOTH_SEAT_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_SEAT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_SEAT_CHANGED_EVENT));
}

export function subscribeBoothSeat(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_SEAT_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_SEAT_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_SEAT_CHANGED_EVENT, listener);
  };
}
