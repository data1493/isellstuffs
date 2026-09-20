/**
 * I don't have a headshell — still a crate. Still a skip. Still Sunday Crate.
 * Bone is the folder. Cradle is the tonearm rest. Lifter is the cue lift.
 * Wand is the anti-static. Riser is the back-row lift. Protractor is the
 * two-point arc. Slipmat is the platter felt. Wrap stays wrap. Walkers
 * still want Crate to hand over a headshell, or so the unnamed LP mounts
 * without a shop cradle. I don't have a headshell. Still a crate. Still a
 * skip.
 *
 * Never write `iss:booth-cradle`, `iss:booth-lifter`, `iss:booth-bone`,
 * `iss:booth-wand`, `iss:booth-riser`, `iss:booth-protractor`,
 * `iss:booth-slipmat`, `iss:booth-spindle`, `iss:booth-caliper`,
 * `iss:booth-feeler`, `iss:booth-gobo`, `iss:booth-chalk`,
 * `iss:booth-tweezers`, `iss:booth-variac`, `iss:booth-fume`,
 * `iss:booth-plumb`, `iss:booth-preheater`, `iss:booth-torpedo`, tote,
 * sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-headshell` is the client cork.
 * Cookie `iss-booth-headshell` is the same JSON so stall, `/lot`, and
 * `/headshell` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_HEADSHELL_STORAGE_KEY = "iss:booth-headshell";
export const BOOTH_HEADSHELL_COOKIE_NAME = "iss-booth-headshell";
export const BOOTH_HEADSHELL_CHANGED_EVENT = "iss:booth-headshell-changed";

export const BOOTH_HEADSHELL_NOTE_MAX = 140;

export const BOOTH_HEADSHELL_PAPER_LINE =
  "I don't have a headshell. Still a crate. Still a skip.";
export const BOOTH_HEADSHELL_EMPTY_COPY =
  "Nobody taped a headshell note on this booth. Still a crate.";
export const BOOTH_HEADSHELL_EMPTY_TAPE =
  "Say you don't have a headshell or leave the table.";
export const BOOTH_HEADSHELL_PACKED_LEFTOVER =
  "The table went in the car. This headshell note is leftover.";
export const BOOTH_HEADSHELL_MISSING_COPY = "That stall packed up.";

export function stallHeadshellPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/headshell`;
}

export function stallHeadshellWritePath() {
  return "/stalls/headshell";
}

export type BoothHeadshellNote = {
  note: string;
  at: string;
};

export type BoothHeadshellMap = Record<string, BoothHeadshellNote>;

export type BoothHeadshellWriteResult =
  | { ok: true; map: BoothHeadshellMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothHeadshellMap };

const emptyMap: BoothHeadshellMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothHeadshellNote {
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

export function normalizeBoothHeadshellNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_HEADSHELL_NOTE_MAX);
}

export function parseBoothHeadshell(
  raw: string | null | undefined,
): BoothHeadshellMap {
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
    const next: BoothHeadshellMap = {};
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
        note: normalizeBoothHeadshellNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothHeadshell(map: BoothHeadshellMap) {
  return JSON.stringify(map);
}

export function boothHeadshellCookieValue(map: BoothHeadshellMap): string {
  return serializeBoothHeadshell(map);
}

export const BOOTH_HEADSHELL_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_HEADSHELL_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_HEADSHELL_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_HEADSHELL_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothHeadshellStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothHeadshellFor(
  stallId: string,
  map: BoothHeadshellMap = emptyMap,
): BoothHeadshellNote | undefined {
  return map[stallId];
}

export function tapeBoothHeadshell(
  stall: Stall | undefined,
  map: BoothHeadshellMap,
  raw: string,
  at = new Date(),
): BoothHeadshellWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothHeadshellNote(raw);
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

export function clearBoothHeadshell(
  stall: Stall | undefined,
  map: BoothHeadshellMap,
): BoothHeadshellWriteResult {
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

export function mergeBoothHeadshellMaps(
  ...maps: BoothHeadshellMap[]
): BoothHeadshellMap {
  const next: BoothHeadshellMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothHeadshell(): BoothHeadshellMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothHeadshell(
      window.localStorage.getItem(BOOTH_HEADSHELL_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothHeadshell(map: BoothHeadshellMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothHeadshell(map);
  try {
    window.localStorage.setItem(BOOTH_HEADSHELL_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_HEADSHELL_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_HEADSHELL_CHANGED_EVENT));
}

export function subscribeBoothHeadshell(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_HEADSHELL_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_HEADSHELL_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_HEADSHELL_CHANGED_EVENT, listener);
  };
}
