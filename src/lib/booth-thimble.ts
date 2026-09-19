/**
 * I don't have a thimble — still a closet. Still worn twice.
 * Sew is no hem. Pins is hem-pin. Buttons is spare-snap. Stay is hangers.
 * Wrap stays wrap. Dart is listing paper.
 * Walkers still want Closet to hand over a thimble, or something to push the needle.
 * I don't have a thimble. Still a closet. Still worn twice.
 *
 * Never write `iss:booth-sew`, `iss:booth-pins`, `iss:booth-buttons`,
 * `iss:booth-stay`, `iss:booth-mirror`, `iss:dart-listing-ids`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-thimble` is the client cork.
 * Cookie `iss-booth-thimble` is the same JSON so stall, `/lot`, and `/thimble` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_THIMBLE_STORAGE_KEY = "iss:booth-thimble";
export const BOOTH_THIMBLE_COOKIE_NAME = "iss-booth-thimble";
export const BOOTH_THIMBLE_CHANGED_EVENT = "iss:booth-thimble-changed";

export const BOOTH_THIMBLE_NOTE_MAX = 140;

export const BOOTH_THIMBLE_PAPER_LINE =
  "I don't have a thimble. Still a closet. Still worn twice.";
export const BOOTH_THIMBLE_EMPTY_COPY =
  "Nobody taped a thimble note on this booth. Still a closet. Still worn twice.";
export const BOOTH_THIMBLE_EMPTY_TAPE =
  "Say you don't have a thimble or leave the table.";
export const BOOTH_THIMBLE_PACKED_LEFTOVER =
  "The table went in the car. This thimble note is leftover.";
export const BOOTH_THIMBLE_MISSING_COPY = "That stall packed up.";

export function stallThimblePath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/thimble`;
}

export function stallThimbleWritePath() {
  return "/stalls/thimble";
}

export type BoothThimbleNote = {
  note: string;
  at: string;
};

export type BoothThimbleMap = Record<string, BoothThimbleNote>;

export type BoothThimbleWriteResult =
  | { ok: true; map: BoothThimbleMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothThimbleMap };

const emptyMap: BoothThimbleMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothThimbleNote {
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
  // Cookie must stay the stall-id map. Never `{ ok: true }` or `{ ok, map }`.
  return typeof row.ok === "boolean";
}

export function normalizeBoothThimbleNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_THIMBLE_NOTE_MAX);
}

export function parseBoothThimble(raw: string | null | undefined): BoothThimbleMap {
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
    const next: BoothThimbleMap = {};
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
        note: normalizeBoothThimbleNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothThimble(map: BoothThimbleMap) {
  return JSON.stringify(map);
}

export function boothThimbleCookieValue(map: BoothThimbleMap): string {
  return serializeBoothThimble(map);
}

export const BOOTH_THIMBLE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_THIMBLE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_THIMBLE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_THIMBLE_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothThimbleStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothThimbleFor(
  stallId: string,
  map: BoothThimbleMap = emptyMap,
): BoothThimbleNote | undefined {
  return map[stallId];
}

export function tapeBoothThimble(
  stall: Stall | undefined,
  map: BoothThimbleMap,
  raw: string,
  at = new Date(),
): BoothThimbleWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothThimbleNote(raw);
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

export function clearBoothThimble(
  stall: Stall | undefined,
  map: BoothThimbleMap,
): BoothThimbleWriteResult {
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

export function mergeBoothThimbleMaps(...maps: BoothThimbleMap[]): BoothThimbleMap {
  const next: BoothThimbleMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothThimble(): BoothThimbleMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothThimble(
      window.localStorage.getItem(BOOTH_THIMBLE_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothThimble(map: BoothThimbleMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothThimble(map);
  try {
    window.localStorage.setItem(BOOTH_THIMBLE_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_THIMBLE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_THIMBLE_CHANGED_EVENT));
}

export function subscribeBoothThimble(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_THIMBLE_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_THIMBLE_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_THIMBLE_CHANGED_EVENT, listener);
  };
}
