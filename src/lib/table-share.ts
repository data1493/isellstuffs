/**
 * Sharing this table — two sellers, one folding table.
 * Cover is a sitter. Share is two names on one table.
 * Not a seventh stall. SKUs stay with their stall.
 *
 * Never write `iss:booth-cover`, `iss:packed-stall-ids`,
 * `iss:weekend-hours`, `iss:back-soon`, `iss:moved-spot`,
 * `iss:early-fold`, or `iss:watched-stall-ids`.
 * Never write tote / sold / garage / here / scrap / tape / rain keys.
 * Not a sitter. Not packed. Not a new booth.
 *
 * Shape: JSON object `{ [stallId]: { sharerId, at } }`.
 * localStorage key `iss:table-share` is the client cork.
 * Cookie `iss-table-share` is the same JSON so stall, `/lot`, and `/share` SSR it.
 *
 * Sharer must be a real catalog `Stall.id`. A booth cannot share itself.
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import {
  allStalls,
  stallById,
  stallBySlug,
  type Stall,
} from "@/lib/commerce";

export const TABLE_SHARE_STORAGE_KEY = "iss:table-share";
export const TABLE_SHARE_COOKIE_NAME = "iss-table-share";
export const TABLE_SHARE_CHANGED_EVENT = "iss:table-share-changed";

export const TABLE_SHARE_PAPER_LINE =
  "Sharing this table. Two names. One folding table.";
export const TABLE_SHARE_EMPTY_COPY = "Nobody is sharing this table.";
export const TABLE_SHARE_EMPTY_TAPE =
  "Name a real booth. This table cannot share itself.";
export const TABLE_SHARE_SELF_TAPE = "A booth cannot share itself.";
export const TABLE_SHARE_PACKED_LEFTOVER =
  "The table went in the car. This share note is leftover.";
export const TABLE_SHARE_MISSING_COPY = "That stall packed up.";

export type TableShare = {
  sharerId: string;
  at: string;
};

export type TableShareMap = Record<string, TableShare>;

export type TableShareWriteResult =
  | { ok: true; map: TableShareMap }
  | {
      ok: false;
      reason: "missing" | "empty" | "self";
      map: TableShareMap;
    };

const emptyMap: TableShareMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isShare(value: unknown): value is TableShare {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as Record<string, unknown>;
  return (
    typeof row.sharerId === "string" &&
    row.sharerId.trim().length > 0 &&
    typeof row.at === "string"
  );
}

export function resolveShareStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function resolveSharePartner(sharerId: string): Stall | undefined {
  const trimmed = sharerId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed);
}

export function sharePartnerStalls(stallId: string): Stall[] {
  return allStalls().filter((stall) => stall.id !== stallId);
}

export function parseTableShare(
  raw: string | null | undefined,
): TableShareMap {
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
    const next: TableShareMap = {};
    for (const [stallId, share] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (typeof stallId !== "string" || stallId.length === 0) {
        continue;
      }
      if (!isShare(share)) {
        continue;
      }
      const sharer = resolveSharePartner(share.sharerId);
      if (!sharer || sharer.id === stallId) {
        continue;
      }
      next[stallId] = {
        sharerId: sharer.id,
        at: share.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeTableShare(map: TableShareMap) {
  return JSON.stringify(map);
}

export function tableShareCookieValue(map: TableShareMap): string {
  return serializeTableShare(map);
}

export const TABLE_SHARE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${TABLE_SHARE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(TABLE_SHARE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(TABLE_SHARE_CHANGED_EVENT)}));}}}catch(e){}`;

export function tableShareFor(
  stallId: string,
  map: TableShareMap = emptyMap,
): TableShare | undefined {
  return map[stallId];
}

export function sharePartnerFor(
  stallId: string,
  map: TableShareMap = emptyMap,
): Stall | undefined {
  const share = tableShareFor(stallId, map);
  if (!share) {
    return undefined;
  }
  return resolveSharePartner(share.sharerId);
}

export function tapeTableShare(
  stall: Stall | undefined,
  map: TableShareMap,
  rawSharerId: string,
  at = new Date(),
): TableShareWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const trimmed = rawSharerId.trim();
  if (!trimmed) {
    return { ok: false, reason: "empty", map };
  }
  const sharer = resolveSharePartner(trimmed);
  if (!sharer) {
    return { ok: false, reason: "empty", map };
  }
  if (sharer.id === stall.id) {
    return { ok: false, reason: "self", map };
  }
  return {
    ok: true,
    map: {
      ...map,
      [stall.id]: { sharerId: sharer.id, at: at.toISOString() },
    },
  };
}

export function clearTableShare(
  stall: Stall | undefined,
  map: TableShareMap,
): TableShareWriteResult {
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

export function mergeTableShareMaps(...maps: TableShareMap[]): TableShareMap {
  const next: TableShareMap = {};
  for (const map of maps) {
    for (const [stallId, share] of Object.entries(map)) {
      const sharer = resolveSharePartner(share.sharerId);
      if (!sharer || sharer.id === stallId) {
        continue;
      }
      next[stallId] = { sharerId: sharer.id, at: share.at };
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readTableShare(): TableShareMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseTableShare(
      window.localStorage.getItem(TABLE_SHARE_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeTableShare(map: TableShareMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeTableShare(map);
  try {
    window.localStorage.setItem(TABLE_SHARE_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${TABLE_SHARE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(TABLE_SHARE_CHANGED_EVENT));
}

export function subscribeTableShare(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === TABLE_SHARE_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(TABLE_SHARE_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TABLE_SHARE_CHANGED_EVENT, listener);
  };
}
