/**
 * I don't have wifi — pay first. Still a folder.
 * Copy is no USB. Stick is no email. Folder delivers after pay.
 * Walkers still want Beats to run cafe wifi, or "download it here."
 * I don't have wifi. Pay first. Still a folder.
 *
 * Never write `iss:booth-copy`, `iss:booth-stick`, `iss:booth-burn`,
 * `iss:norm-listing-ids`, `iss:bold-listing-ids`, `iss:tray-listing-ids`,
 * `iss:booth-harp`, `iss:booth-inners`, tote, sold, packed, or $0 SKUs.
 *
 * Shape: JSON object `{ [stallId]: { note, at } }`.
 * localStorage key `iss:booth-wifi` is the client cork.
 * Cookie `iss-booth-wifi` is the same JSON so stall, `/lot`, and `/wifi` SSR it.
 *
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_WIFI_STORAGE_KEY = "iss:booth-wifi";
export const BOOTH_WIFI_COOKIE_NAME = "iss-booth-wifi";
export const BOOTH_WIFI_CHANGED_EVENT = "iss:booth-wifi-changed";

export const BOOTH_WIFI_NOTE_MAX = 140;

export const BOOTH_WIFI_PAPER_LINE =
  "I don't have wifi. Pay first. Still a folder. Not copy. Not stick. Not a cafe.";
export const BOOTH_WIFI_EMPTY_COPY =
  "Pay first. Nobody taped a wifi note on this booth.";
export const BOOTH_WIFI_EMPTY_TAPE =
  "Say you don't have wifi or leave the table.";
export const BOOTH_WIFI_PACKED_LEFTOVER =
  "The table went in the car. This wifi note is leftover.";
export const BOOTH_WIFI_MISSING_COPY = "That stall packed up.";

export function stallWifiPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/wifi`;
}

export function stallWifiWritePath() {
  return "/stalls/wifi";
}

export type BoothWifiNote = {
  note: string;
  at: string;
};

export type BoothWifiMap = Record<string, BoothWifiNote>;

export type BoothWifiWriteResult =
  | { ok: true; map: BoothWifiMap }
  | { ok: false; reason: "missing" | "empty"; map: BoothWifiMap };

const emptyMap: BoothWifiMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is BoothWifiNote {
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

export function normalizeBoothWifiNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_WIFI_NOTE_MAX);
}

export function parseBoothWifi(raw: string | null | undefined): BoothWifiMap {
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
    const next: BoothWifiMap = {};
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
        note: normalizeBoothWifiNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothWifi(map: BoothWifiMap) {
  return JSON.stringify(map);
}

export function boothWifiCookieValue(map: BoothWifiMap): string {
  return serializeBoothWifi(map);
}

export const BOOTH_WIFI_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_WIFI_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_WIFI_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_WIFI_CHANGED_EVENT)}));}}}catch(e){}`;

export function resolveBoothWifiStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function boothWifiFor(
  stallId: string,
  map: BoothWifiMap = emptyMap,
): BoothWifiNote | undefined {
  return map[stallId];
}

export function tapeBoothWifi(
  stall: Stall | undefined,
  map: BoothWifiMap,
  raw: string,
  at = new Date(),
): BoothWifiWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const note = normalizeBoothWifiNote(raw);
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

export function clearBoothWifi(
  stall: Stall | undefined,
  map: BoothWifiMap,
): BoothWifiWriteResult {
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

export function mergeBoothWifiMaps(...maps: BoothWifiMap[]): BoothWifiMap {
  const next: BoothWifiMap = {};
  for (const map of maps) {
    for (const [stallId, note] of Object.entries(map)) {
      next[stallId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothWifi(): BoothWifiMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothWifi(
      window.localStorage.getItem(BOOTH_WIFI_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothWifi(map: BoothWifiMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothWifi(map);
  try {
    window.localStorage.setItem(BOOTH_WIFI_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_WIFI_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_WIFI_CHANGED_EVENT));
}

export function subscribeBoothWifi(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_WIFI_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_WIFI_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_WIFI_CHANGED_EVENT, listener);
  };
}
