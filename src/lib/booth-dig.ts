/**
 * Don't dig under — the zips are not in the gravel.
 * Van is more out back. Lost is sunglasses. Walkers still crawl
 * under Sunday Crate. Ask what's on the table.
 *
 * Never write `iss:booth-stick`, `iss:booth-lost`, `iss:van-listing-ids`,
 * `iss:booth-poly`, wash, cord, cases, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-dig` is the client cork.
 * Cookie `iss-booth-dig` is the same JSON so stall, `/lot`, and `/dig` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_DIG_STORAGE_KEY = "iss:booth-dig";
export const BOOTH_DIG_COOKIE_NAME = "iss-booth-dig";
export const BOOTH_DIG_CHANGED_EVENT = "iss:booth-dig-changed";

export const BOOTH_DIG_NOTE_MAX = 140;

export const BOOTH_DIG_PAPER_LINE =
  "Don't dig under. The zips are not in the gravel. Ask what's on the table.";
export const BOOTH_DIG_EMPTY_COPY =
  "The zips are not in the gravel. Nobody taped a dig note on this booth.";
export const BOOTH_DIG_EMPTY_TAPE =
  "Write the gravel note or leave the crate alone.";
export const BOOTH_DIG_PACKED_LEFTOVER =
  "The table went in the car. This dig note is leftover.";
export const BOOTH_DIG_MISSING_COPY = "That stall packed up.";

export function stallDigPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/dig`;
}

export function stallDigWritePath() {
  return "/stalls/dig";
}

export type BoothDigNote = {
  note: string;
  at: string;
};

export type BoothDigMap = Record<string, BoothDigNote>;

export type BoothDigWriteResult =
  | { ok: true; map: BoothDigMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothDigMap };

const emptyMap: BoothDigMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothDigNote {
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

export function normalizeBoothDigNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_DIG_NOTE_MAX);
}

export function parseBoothDig(raw: string | null | undefined): BoothDigMap {
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
    const next: BoothDigMap = {};
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
        note: normalizeBoothDigNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothDig(map: BoothDigMap) {
  return JSON.stringify(map);
}

export function boothDigCookieValue(map: BoothDigMap): string {
  return serializeBoothDig(map);
}

export const BOOTH_DIG_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_DIG_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_DIG_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_DIG_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothDigStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothDigFor(
  stallId: string,
  map: BoothDigMap = emptyMap,
): BoothDigNote | undefined {
  return map[stallId];
}

export function tapeBoothDig(
  stall: Stall | undefined,
  map: BoothDigMap,
  raw: string,
  at = new Date(),
): BoothDigWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothDigNote(raw);
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

export function clearBoothDig(
  stall: Stall | undefined,
  map: BoothDigMap,
): BoothDigWriteResult {
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

export function mergeBoothDigMaps(...maps: BoothDigMap[]): BoothDigMap {
  const next: BoothDigMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothDig(): BoothDigMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothDig(
      window.localStorage.getItem(BOOTH_DIG_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothDig(map: BoothDigMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothDig(map);
  try {
    window.localStorage.setItem(BOOTH_DIG_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_DIG_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_DIG_CHANGED_EVENT));
}

export function subscribeBoothDig(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_DIG_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_DIG_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_DIG_CHANGED_EVENT, listener);
  };
}
