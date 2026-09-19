/**
 * Don't unfold the pile — leave the stack folded. Ask what's on top.
 * Ask is the LP flip. Walkers still wreck Hall Closet for a Medium.
 *
 * Never write `iss:ask-listing-ids`, `iss:booth-stay`, `iss:booth-dig`,
 * skip, remote, pile, grade, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-stack` is the client cork.
 * Cookie `iss-booth-stack` is the same JSON so stall, `/lot`, and `/stack` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_STACK_STORAGE_KEY = "iss:booth-stack";
export const BOOTH_STACK_COOKIE_NAME = "iss-booth-stack";
export const BOOTH_STACK_CHANGED_EVENT = "iss:booth-stack-changed";

export const BOOTH_STACK_NOTE_MAX = 140;

export const BOOTH_STACK_PAPER_LINE =
  "Don't unfold the pile. Ask what's on top.";
export const BOOTH_STACK_EMPTY_COPY =
  "The pile stays folded. Nobody taped a stack note on this booth.";
export const BOOTH_STACK_EMPTY_TAPE =
  "Write the pile note or leave the stack folded.";
export const BOOTH_STACK_PACKED_LEFTOVER =
  "The table went in the car. This stack note is leftover.";
export const BOOTH_STACK_MISSING_COPY = "That stall packed up.";

export function stallStackPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/stack`;
}

export function stallStackWritePath() {
  return "/stalls/stack";
}

export type BoothStackNote = {
  note: string;
  at: string;
};

export type BoothStackMap = Record<string, BoothStackNote>;

export type BoothStackWriteResult =
  | { ok: true; map: BoothStackMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothStackMap };

const emptyMap: BoothStackMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothStackNote {
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

export function normalizeBoothStackNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_STACK_NOTE_MAX);
}

export function parseBoothStack(raw: string | null | undefined): BoothStackMap {
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
    const next: BoothStackMap = {};
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
        note: normalizeBoothStackNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothStack(map: BoothStackMap) {
  return JSON.stringify(map);
}

export function boothStackCookieValue(map: BoothStackMap): string {
  return serializeBoothStack(map);
}

export const BOOTH_STACK_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_STACK_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_STACK_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_STACK_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothStackStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothStackFor(
  stallId: string,
  map: BoothStackMap = emptyMap,
): BoothStackNote | undefined {
  return map[stallId];
}

export function tapeBoothStack(
  stall: Stall | undefined,
  map: BoothStackMap,
  raw: string,
  at = new Date(),
): BoothStackWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothStackNote(raw);
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

export function clearBoothStack(
  stall: Stall | undefined,
  map: BoothStackMap,
): BoothStackWriteResult {
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

export function mergeBoothStackMaps(...maps: BoothStackMap[]): BoothStackMap {
  const next: BoothStackMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothStack(): BoothStackMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothStack(
      window.localStorage.getItem(BOOTH_STACK_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothStack(map: BoothStackMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothStack(map);
  try {
    window.localStorage.setItem(BOOTH_STACK_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_STACK_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_STACK_CHANGED_EVENT));
}

export function subscribeBoothStack(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_STACK_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_STACK_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_STACK_CHANGED_EVENT, listener);
  };
}
