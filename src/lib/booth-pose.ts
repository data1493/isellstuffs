/**
 * Nothing with a lookbook — clothes had a season. Still on the rack.
 * Film is don't photograph the tags. Stack is don't unfold.
 * Sew is not a tailor. Look is display, don't bag.
 * Walkers still ask The Hall Closet for modeled photos.
 * Not film. Not a studio. Not stack.
 *
 * Never write `iss:booth-film`, `iss:booth-stack`, `iss:booth-sew`,
 * `iss:listing-look`, `iss:wash-listing-ids`, `iss:size-listing-ids`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-pose` is the client cork.
 * Cookie `iss-booth-pose` is the same JSON so stall, `/lot`, and `/pose` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_POSE_STORAGE_KEY = "iss:booth-pose";
export const BOOTH_POSE_COOKIE_NAME = "iss-booth-pose";
export const BOOTH_POSE_CHANGED_EVENT = "iss:booth-pose-changed";

export const BOOTH_POSE_NOTE_MAX = 140;

export const BOOTH_POSE_PAPER_LINE =
  "Nothing with a lookbook. Clothes had a season. Still on the rack. Not film. Not a studio. Not stack.";
export const BOOTH_POSE_EMPTY_COPY =
  "The rack is still folded. Nobody taped a lookbook note on this booth.";
export const BOOTH_POSE_EMPTY_TAPE =
  "Say you don't have a lookbook or leave the rack.";
export const BOOTH_POSE_PACKED_LEFTOVER =
  "The table went in the car. This lookbook note is leftover.";
export const BOOTH_POSE_MISSING_COPY = "That stall packed up.";

export function stallPosePath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/pose`;
}

export function stallPoseWritePath() {
  return "/stalls/pose";
}

export type BoothPoseNote = {
  note: string;
  at: string;
};

export type BoothPoseMap = Record<string, BoothPoseNote>;

export type BoothPoseWriteResult =
  | { ok: true; map: BoothPoseMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothPoseMap };

const emptyMap: BoothPoseMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothPoseNote {
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

export function normalizeBoothPoseNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_POSE_NOTE_MAX);
}

export function parseBoothPose(raw: string | null | undefined): BoothPoseMap {
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
    const next: BoothPoseMap = {};
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
        note: normalizeBoothPoseNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothPose(map: BoothPoseMap) {
  return JSON.stringify(map);
}

export function boothPoseCookieValue(map: BoothPoseMap): string {
  return serializeBoothPose(map);
}

export const BOOTH_POSE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_POSE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_POSE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_POSE_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothPoseStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothPoseFor(
  stallId: string,
  map: BoothPoseMap = emptyMap,
): BoothPoseNote | undefined {
  return map[stallId];
}

export function tapeBoothPose(
  stall: Stall | undefined,
  map: BoothPoseMap,
  raw: string,
  at = new Date(),
): BoothPoseWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothPoseNote(raw);
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

export function clearBoothPose(
  stall: Stall | undefined,
  map: BoothPoseMap,
): BoothPoseWriteResult {
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

export function mergeBoothPoseMaps(...maps: BoothPoseMap[]): BoothPoseMap {
  const next: BoothPoseMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothPose(): BoothPoseMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothPose(
      window.localStorage.getItem(BOOTH_POSE_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothPose(map: BoothPoseMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothPose(map);
  try {
    window.localStorage.setItem(BOOTH_POSE_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_POSE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_POSE_CHANGED_EVENT));
}

export function subscribeBoothPose(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_POSE_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_POSE_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_POSE_CHANGED_EVENT, listener);
  };
}
