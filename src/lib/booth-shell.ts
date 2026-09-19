/**
 * Don't open the shell — don't crack the blister. Still tote.
 * Boxed unit on the table, factory seal. Not wrap. Not poly. Not cases.
 *
 * Never write `iss:booth-wrap`, `iss:booth-poly`, size, cases, heat,
 * laces, plays, fits, look, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-shell` is the client cork.
 * Cookie `iss-booth-shell` is the same JSON so stall, `/lot`, and `/shell` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_SHELL_STORAGE_KEY = "iss:booth-shell";
export const BOOTH_SHELL_COOKIE_NAME = "iss-booth-shell";
export const BOOTH_SHELL_CHANGED_EVENT = "iss:booth-shell-changed";

export const BOOTH_SHELL_NOTE_MAX = 140;

export const BOOTH_SHELL_PAPER_LINE =
  "Don't open the shell. Don't crack the blister. The boxed unit stays factory sealed. Still tote. Not wrap. Not poly. Not cases.";
export const BOOTH_SHELL_EMPTY_COPY =
  "The blister is still closed. Nobody taped a shell note on this booth.";
export const BOOTH_SHELL_EMPTY_TAPE =
  "Write the shell note or leave the blister closed.";
export const BOOTH_SHELL_PACKED_LEFTOVER =
  "The table went in the car. This shell note is leftover.";
export const BOOTH_SHELL_MISSING_COPY = "That stall packed up.";

export function stallShellPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/shell`;
}

export function stallShellWritePath() {
  return "/stalls/shell";
}

export type BoothShellNote = {
  note: string;
  at: string;
};

export type BoothShellMap = Record<string, BoothShellNote>;

export type BoothShellWriteResult =
  | { ok: true; map: BoothShellMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothShellMap };

const emptyMap: BoothShellMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothShellNote {
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

export function normalizeBoothShellNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_SHELL_NOTE_MAX);
}

export function parseBoothShell(raw: string | null | undefined): BoothShellMap {
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
    const next: BoothShellMap = {};
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
        note: normalizeBoothShellNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothShell(map: BoothShellMap) {
  return JSON.stringify(map);
}

export function boothShellCookieValue(map: BoothShellMap): string {
  return serializeBoothShell(map);
}

export const BOOTH_SHELL_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_SHELL_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_SHELL_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_SHELL_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothShellStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothShellFor(
  stallId: string,
  map: BoothShellMap = emptyMap,
): BoothShellNote | undefined {
  return map[stallId];
}

export function tapeBoothShell(
  stall: Stall | undefined,
  map: BoothShellMap,
  raw: string,
  at = new Date(),
): BoothShellWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothShellNote(raw);
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

export function clearBoothShell(
  stall: Stall | undefined,
  map: BoothShellMap,
): BoothShellWriteResult {
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

export function mergeBoothShellMaps(...maps: BoothShellMap[]): BoothShellMap {
  const next: BoothShellMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothShell(): BoothShellMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothShell(
      window.localStorage.getItem(BOOTH_SHELL_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothShell(map: BoothShellMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothShell(map);
  try {
    window.localStorage.setItem(BOOTH_SHELL_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_SHELL_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_SHELL_CHANGED_EVENT));
}

export function subscribeBoothShell(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_SHELL_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_SHELL_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_SHELL_CHANGED_EVENT, listener);
  };
}
