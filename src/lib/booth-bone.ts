/**
 * I don't have a bone — still a driveway. Still a grocery bag. Still Sunday Crate.
 * Strop is leather-strop. Comb is dress-the-tangle. Slicker is edge-slick.
 * Fid is splice-spike. Drift is pin-punch. Wrap stays wrap. Folder / crease
 * are not this booth. Walkers still want Sunday Crate to hand over a bone, or
 * so they can crease the liner without Closet's slicker. I don't have a bone.
 * Still a driveway. Still a grocery bag.
 *
 * Never write `iss:booth-strop`, `iss:booth-comb`, `iss:booth-slicker`,
 * `iss:booth-fid`, `iss:booth-drift`, `iss:booth-awl`, `iss:booth-rib`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-bone` is the client cork.
 * Cookie `iss-booth-bone` is the same JSON so stall, `/lot`, and `/bone` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_BONE_STORAGE_KEY = "iss:booth-bone";
export const BOOTH_BONE_COOKIE_NAME = "iss-booth-bone";
export const BOOTH_BONE_CHANGED_EVENT = "iss:booth-bone-changed";

export const BOOTH_BONE_NOTE_MAX = 140;

export const BOOTH_BONE_PAPER_LINE =
  "I don't have a bone. Still a driveway. Still a grocery bag.";
export const BOOTH_BONE_EMPTY_COPY =
  "Nobody taped a bone note on this booth. Still a driveway.";
export const BOOTH_BONE_EMPTY_TAPE =
  "Say you don't have a bone or leave the table.";
export const BOOTH_BONE_PACKED_LEFTOVER =
  "The table went in the car. This bone note is leftover.";
export const BOOTH_BONE_MISSING_COPY = "That stall packed up.";

export function stallBonePath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/bone`;
}

export function stallBoneWritePath() {
  return "/stalls/bone";
}

export type BoothBoneNote = {
  note: string;
  at: string;
};

export type BoothBoneMap = Record<string, BoothBoneNote>;

export type BoothBoneWriteResult =
  | { ok: true; map: BoothBoneMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothBoneMap };

const emptyMap: BoothBoneMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothBoneNote {
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

export function normalizeBoothBoneNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_BONE_NOTE_MAX);
}

export function parseBoothBone(raw: string | null | undefined): BoothBoneMap {
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
    const next: BoothBoneMap = {};
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
        note: normalizeBoothBoneNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothBone(map: BoothBoneMap) {
  return JSON.stringify(map);
}

export function boothBoneCookieValue(map: BoothBoneMap): string {
  return serializeBoothBone(map);
}

export const BOOTH_BONE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_BONE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_BONE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_BONE_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothBoneStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothBoneFor(
  stallId: string,
  map: BoothBoneMap = emptyMap,
): BoothBoneNote | undefined {
  return map[stallId];
}

export function tapeBoothBone(
  stall: Stall | undefined,
  map: BoothBoneMap,
  raw: string,
  at = new Date(),
): BoothBoneWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothBoneNote(raw);
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

export function clearBoothBone(
  stall: Stall | undefined,
  map: BoothBoneMap,
): BoothBoneWriteResult {
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

export function mergeBoothBoneMaps(...maps: BoothBoneMap[]): BoothBoneMap {
  const next: BoothBoneMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothBone(): BoothBoneMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothBone(
      window.localStorage.getItem(BOOTH_BONE_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothBone(map: BoothBoneMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothBone(map);
  try {
    window.localStorage.setItem(BOOTH_BONE_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_BONE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_BONE_CHANGED_EVENT));
}

export function subscribeBoothBone(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_BONE_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_BONE_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_BONE_CHANGED_EVENT, listener);
  };
}
