/**
 * I don't have a footer — still a crate. Still a skip. Still Sunday Crate.
 * Bone is the folder. Bearing is the spin. Plinth is the base. Headshell is
 * the cartridge mount. Cradle is the tonearm rest. Lifter is the cue lift.
 * Wand is the anti-static. Riser is the back-row lift. Protractor is the
 * alignment card. Wrap stays wrap. Footer here is isolation feet, not chrome.
 * Walkers still want Crate to hand over a footer, or so the unnamed LP sits
 * shop-level without a shop bearing. I don't have a footer. Still a crate.
 * Still a skip.
 *
 * Never write `iss:booth-bearing`, `iss:booth-plinth`, `iss:booth-headshell`,
 * `iss:booth-cradle`, `iss:booth-lifter`, `iss:booth-bone`, `iss:booth-wand`,
 * `iss:booth-riser`, `iss:booth-protractor`, `iss:booth-slipmat`,
 * `iss:booth-spindle`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-footer` is the client cork.
 * Cookie `iss-booth-footer` is the same JSON so stall, `/lot`, and `/footer` SSR it.
 * Cookie and storage stay the map. Never a write-result literal `{ ok, map }`
 * or `{ ok: true }`.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_FOOTER_STORAGE_KEY = "iss:booth-footer";
export const BOOTH_FOOTER_COOKIE_NAME = "iss-booth-footer";
export const BOOTH_FOOTER_CHANGED_EVENT = "iss:booth-footer-changed";

export const BOOTH_FOOTER_NOTE_MAX = 140;

export const BOOTH_FOOTER_PAPER_LINE =
  "I don't have a footer. Still a crate. Still a skip.";
export const BOOTH_FOOTER_EMPTY_COPY =
  "Nobody taped a footer note on this booth. Still a crate.";
export const BOOTH_FOOTER_EMPTY_TAPE =
  "Say you don't have a footer or leave the table.";
export const BOOTH_FOOTER_PACKED_LEFTOVER =
  "The table went in the car. This footer note is leftover.";
export const BOOTH_FOOTER_MISSING_COPY = "That stall packed up.";

export function stallFooterPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/footer`;
}

export function stallFooterWritePath() {
  return "/stalls/footer";
}

export type BoothFooterNote = {
  note: string;
  at: string;
};

export type BoothFooterMap = Record<string, BoothFooterNote>;

export type BoothFooterWriteResult =
  | { ok: true; map: BoothFooterMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothFooterMap };

const emptyMap: BoothFooterMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothFooterNote {
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

export function normalizeBoothFooterNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_FOOTER_NOTE_MAX);
}

export function parseBoothFooter(raw: string | null | undefined): BoothFooterMap {
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
    const next: BoothFooterMap = {};
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
        note: normalizeBoothFooterNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothFooter(map: BoothFooterMap) {
  return JSON.stringify(map);
}

export function boothFooterCookieValue(map: BoothFooterMap): string {
  return serializeBoothFooter(map);
}

export const BOOTH_FOOTER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_FOOTER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"&&v.indexOf('"ok"')!==0){var p=JSON.parse(v);if(p&&typeof p==="object"&&!Array.isArray(p)&&typeof p.ok!=="boolean"){localStorage.setItem(${JSON.stringify(BOOTH_FOOTER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_FOOTER_CHANGED_EVENT)}));}}}}catch(e){}`;

export function resolveBoothFooterStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothFooterFor(
  stallId: string,
  map: BoothFooterMap = emptyMap,
): BoothFooterNote | undefined {
  return map[stallId];
}

export function tapeBoothFooter(
  stall: Stall | undefined,
  map: BoothFooterMap,
  raw: string,
  at = new Date(),
): BoothFooterWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothFooterNote(raw);
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

export function clearBoothFooter(
  stall: Stall | undefined,
  map: BoothFooterMap,
): BoothFooterWriteResult {
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

export function mergeBoothFooterMaps(...maps: BoothFooterMap[]): BoothFooterMap {
  const next: BoothFooterMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothFooter(): BoothFooterMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothFooter(
      window.localStorage.getItem(BOOTH_FOOTER_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothFooter(map: BoothFooterMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothFooter(map);
  try {
    window.localStorage.setItem(BOOTH_FOOTER_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_FOOTER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_FOOTER_CHANGED_EVENT));
}

export function subscribeBoothFooter(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_FOOTER_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_FOOTER_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_FOOTER_CHANGED_EVENT, listener);
  };
}
