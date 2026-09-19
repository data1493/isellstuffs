/**
 * I don't have a mirror — still a rack.
 * Pose is no lookbook. Stack is don't unfold. Sew is no tailor.
 * Pins is no hem-pin. Looking / fitting were killed as pose twins.
 * Walkers still want Closet to hang a mirror, or "let me see the pits."
 * I don't have a mirror. Still a rack. Still no lookbook.
 *
 * Never write `iss:booth-pose`, `iss:booth-stack`, `iss:booth-sew`,
 * `iss:booth-pins`, `iss:hood-listing-ids`, `iss:pad-listing-ids`,
 * `iss:lining-listing-ids`, `iss:booth-inners`, tote, sold, packed,
 * or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-mirror` is the client cork.
 * Cookie `iss-booth-mirror` is the same JSON so stall, `/lot`, and `/mirror` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_MIRROR_STORAGE_KEY = "iss:booth-mirror";
export const BOOTH_MIRROR_COOKIE_NAME = "iss-booth-mirror";
export const BOOTH_MIRROR_CHANGED_EVENT = "iss:booth-mirror-changed";

export const BOOTH_MIRROR_NOTE_MAX = 140;

export const BOOTH_MIRROR_PAPER_LINE =
  "I don't have a mirror. Still a rack. Still no lookbook. Not pose. Not a dressing room. Not pins.";
export const BOOTH_MIRROR_EMPTY_COPY =
  "Nobody taped a mirror note on this booth. Still a rack. Still no lookbook.";
export const BOOTH_MIRROR_EMPTY_TAPE =
  "Say you don't have a mirror or leave the rack.";
export const BOOTH_MIRROR_PACKED_LEFTOVER =
  "The table went in the car. This mirror note is leftover.";
export const BOOTH_MIRROR_MISSING_COPY = "That stall packed up.";

export function stallMirrorPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/mirror`;
}

export function stallMirrorWritePath() {
  return "/stalls/mirror";
}

export type BoothMirrorNote = {
  note: string;
  at: string;
};

export type BoothMirrorMap = Record<string, BoothMirrorNote>;

export type BoothMirrorWriteResult =
  | { ok: true; map: BoothMirrorMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothMirrorMap };

const emptyMap: BoothMirrorMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothMirrorNote {
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

export function normalizeBoothMirrorNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_MIRROR_NOTE_MAX);
}

export function parseBoothMirror(raw: string | null | undefined): BoothMirrorMap {
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
    const next: BoothMirrorMap = {};
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
        note: normalizeBoothMirrorNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothMirror(map: BoothMirrorMap) {
  return JSON.stringify(map);
}

export function boothMirrorCookieValue(map: BoothMirrorMap): string {
  return serializeBoothMirror(map);
}

export const BOOTH_MIRROR_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_MIRROR_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_MIRROR_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_MIRROR_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothMirrorStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothMirrorFor(
  stallId: string,
  map: BoothMirrorMap = emptyMap,
): BoothMirrorNote | undefined {
  return map[stallId];
}

export function tapeBoothMirror(
  stall: Stall | undefined,
  map: BoothMirrorMap,
  raw: string,
  at = new Date(),
): BoothMirrorWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothMirrorNote(raw);
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

export function clearBoothMirror(
  stall: Stall | undefined,
  map: BoothMirrorMap,
): BoothMirrorWriteResult {
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

export function mergeBoothMirrorMaps(...maps: BoothMirrorMap[]): BoothMirrorMap {
  const next: BoothMirrorMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothMirror(): BoothMirrorMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothMirror(
      window.localStorage.getItem(BOOTH_MIRROR_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothMirror(map: BoothMirrorMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothMirror(map);
  try {
    window.localStorage.setItem(BOOTH_MIRROR_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_MIRROR_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_MIRROR_CHANGED_EVENT));
}

export function subscribeBoothMirror(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_MIRROR_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_MIRROR_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_MIRROR_CHANGED_EVENT, listener);
  };
}
