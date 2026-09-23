/**
 * I can break a twenty — ones in the jar on that booth.
 * Tender is the slip. Change in the jar is paper on that table.
 *
 * Never write `iss:mock-tender`, checkout tender, `iss:weekend-hours`,
 * or till keys. Never write tote / sold / packed / fold / cover / lost.
 * Not cash vs card. Not a register. Not new hours.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:break-bills` is the client cork.
 * Cookie `iss-break-bills` is the same JSON so stall, `/lot`, and `/break` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BREAK_BILLS_STORAGE_KEY = "iss:break-bills";
export const BREAK_BILLS_COOKIE_NAME = "iss-break-bills";
export const BREAK_BILLS_CHANGED_EVENT = "iss:break-bills-changed";

export const BREAK_BILLS_NOTE_MAX = 140;

export const BREAK_BILLS_PAPER_LINE =
  "I can break a twenty. Change in the jar. Not the slip.";
export const BREAK_BILLS_EMPTY_COPY =
  "The jar is empty. Nobody taped change on this booth.";
export const BREAK_BILLS_EMPTY_TAPE =
  "Say what is in the jar or leave the table.";
export const BREAK_BILLS_PACKED_LEFTOVER =
  "The table went in the car. This change note is leftover.";
export const BREAK_BILLS_MISSING_COPY = "That stall packed up.";

export type BreakBillsNote = {
  note: string;
  at: string;
};

export type BreakBillsMap = Record<string, BreakBillsNote>;

export type BreakBillsWriteResult =
  | { ok: true; map: BreakBillsMap }
  | { ok: false; reason: "missing" | "empty"; map: BreakBillsMap };

const emptyMap: BreakBillsMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BreakBillsNote {
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

export function normalizeBreakBillsNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BREAK_BILLS_NOTE_MAX);
}

export function parseBreakBills(raw: string | null | undefined): BreakBillsMap {
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
    const next: BreakBillsMap = {};
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
        note: normalizeBreakBillsNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBreakBills(map: BreakBillsMap) {
  return JSON.stringify(map);
}

export function breakBillsCookieValue(map: BreakBillsMap): string {
  return serializeBreakBills(map);
}

export const BREAK_BILLS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BREAK_BILLS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BREAK_BILLS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BREAK_BILLS_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBreakBillsStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function breakBillsFor(
  stallId: string,
  map: BreakBillsMap = emptyMap,
): BreakBillsNote | undefined {
  return map[stallId];
}

export function tapeBreakBills(
  stall: Stall | undefined,
  map: BreakBillsMap,
  raw: string,
  at = new Date(),
): BreakBillsWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBreakBillsNote(raw);
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

export function clearBreakBills(
  stall: Stall | undefined,
  map: BreakBillsMap,
): BreakBillsWriteResult {
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

export function mergeBreakBillsMaps(...maps: BreakBillsMap[]): BreakBillsMap {
  const next: BreakBillsMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBreakBills(): BreakBillsMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBreakBills(
      window.localStorage.getItem(BREAK_BILLS_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBreakBills(map: BreakBillsMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBreakBills(map);
  try {
    window.localStorage.setItem(BREAK_BILLS_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BREAK_BILLS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BREAK_BILLS_CHANGED_EVENT));
}

export function subscribeBreakBills(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BREAK_BILLS_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BREAK_BILLS_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BREAK_BILLS_CHANGED_EVENT, listener);
  };
}
