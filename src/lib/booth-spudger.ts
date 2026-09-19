/**
 * I don't have a spudger — still a blister. Still fused.
 * Driver is Phillips. Shell is don't-open. Fix is no solder. Meter is no probe.
 * Wrap stays wrap. Caddy stays queued. Lens stays queued.
 * Walkers still want Half-Working to hand over a spudger, or a nylon pry
 * so Tetris comes out. I don't have a spudger. Still a blister. Still fused.
 *
 * Never write `iss:booth-driver`, `iss:booth-shell`, `iss:booth-fix`,
 * `iss:booth-meter`, `iss:booth-caddy`, `iss:lens-listing-ids`,
 * tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-spudger` is the client cork.
 * Cookie `iss-booth-spudger` is the same JSON so stall, `/lot`, and `/spudger` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_SPUDGER_STORAGE_KEY = "iss:booth-spudger";
export const BOOTH_SPUDGER_COOKIE_NAME = "iss-booth-spudger";
export const BOOTH_SPUDGER_CHANGED_EVENT = "iss:booth-spudger-changed";

export const BOOTH_SPUDGER_NOTE_MAX = 140;

export const BOOTH_SPUDGER_PAPER_LINE =
  "I don't have a spudger. Still a blister. Still fused.";
export const BOOTH_SPUDGER_EMPTY_COPY =
  "Nobody taped a spudger note on this booth. Still a blister. Still fused.";
export const BOOTH_SPUDGER_EMPTY_TAPE =
  "Say you don't have a spudger or leave the table.";
export const BOOTH_SPUDGER_PACKED_LEFTOVER =
  "The table went in the car. This spudger note is leftover.";
export const BOOTH_SPUDGER_MISSING_COPY = "That stall packed up.";

export function stallSpudgerPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/spudger`;
}

export function stallSpudgerWritePath() {
  return "/stalls/spudger";
}

export type BoothSpudgerNote = {
  note: string;
  at: string;
};

export type BoothSpudgerMap = Record<string, BoothSpudgerNote>;

export type BoothSpudgerWriteResult =
  | { ok: true; map: BoothSpudgerMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothSpudgerMap };

const emptyMap: BoothSpudgerMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothSpudgerNote {
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

export function normalizeBoothSpudgerNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_SPUDGER_NOTE_MAX);
}

export function parseBoothSpudger(raw: string | null | undefined): BoothSpudgerMap {
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
    const next: BoothSpudgerMap = {};
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
        note: normalizeBoothSpudgerNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothSpudger(map: BoothSpudgerMap) {
  return JSON.stringify(map);
}

export function boothSpudgerCookieValue(map: BoothSpudgerMap): string {
  return serializeBoothSpudger(map);
}

export const BOOTH_SPUDGER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_SPUDGER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_SPUDGER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_SPUDGER_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothSpudgerStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothSpudgerFor(
  stallId: string,
  map: BoothSpudgerMap = emptyMap,
): BoothSpudgerNote | undefined {
  return map[stallId];
}

export function tapeBoothSpudger(
  stall: Stall | undefined,
  map: BoothSpudgerMap,
  raw: string,
  at = new Date(),
): BoothSpudgerWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothSpudgerNote(raw);
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

export function clearBoothSpudger(
  stall: Stall | undefined,
  map: BoothSpudgerMap,
): BoothSpudgerWriteResult {
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

export function mergeBoothSpudgerMaps(...maps: BoothSpudgerMap[]): BoothSpudgerMap {
  const next: BoothSpudgerMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothSpudger(): BoothSpudgerMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothSpudger(
      window.localStorage.getItem(BOOTH_SPUDGER_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothSpudger(map: BoothSpudgerMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothSpudger(map);
  try {
    window.localStorage.setItem(BOOTH_SPUDGER_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_SPUDGER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_SPUDGER_CHANGED_EVENT));
}

export function subscribeBoothSpudger(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_SPUDGER_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_SPUDGER_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_SPUDGER_CHANGED_EVENT, listener);
  };
}
