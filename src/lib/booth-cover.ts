/**
 * Neighbor is sitting — who is covering this booth.
 * Lunch is a taco-truck note. Watch is a buyer follow.
 * This tape names the stall next door.
 *
 * Never write `iss:packed-stall-ids`, `iss:weekend-hours`,
 * `iss:back-soon`, `iss:moved-spot`, or `iss:watched-stall-ids`.
 * Never write tote / sold / garage / here / scrap / tape / rain keys.
 * Not lunch. Not a watch. Not packed. Not rain.
 *
 * Shape: JSON object `{ [stallId]: { sitterId, at } }`.
 * localStorage key `iss:booth-cover` is the client cork.
 * Cookie `iss-booth-cover` is the same JSON so stall, `/lot`, and `/cover` SSR it.
 *
 * Sitter must be a real catalog `Stall.id`. A booth cannot sit itself.
 * Re-tape replaces that booth only. Clear deletes that key.
 */
import {
  allStalls,
  stallById,
  stallBySlug,
  type Stall,
} from "@/lib/commerce";

export const BOOTH_COVER_STORAGE_KEY = "iss:booth-cover";
export const BOOTH_COVER_COOKIE_NAME = "iss-booth-cover";
export const BOOTH_COVER_CHANGED_EVENT = "iss:booth-cover-changed";

export const BOOTH_COVER_PAPER_LINE =
  "Neighbor is sitting. Not lunch. Not a watch.";
export const BOOTH_COVER_EMPTY_COPY = "Nobody is covering this table.";
export const BOOTH_COVER_EMPTY_TAPE =
  "Name a real booth. This table cannot sit itself.";
export const BOOTH_COVER_SELF_TAPE = "A booth cannot sit itself.";
export const BOOTH_COVER_PACKED_LEFTOVER =
  "The table went in the car. This cover note is leftover.";
export const BOOTH_COVER_MISSING_COPY = "That stall packed up.";

export type BoothCover = {
  sitterId: string;
  at: string;
};

export type BoothCoverMap = Record<string, BoothCover>;

export type BoothCoverWriteResult =
  | { ok: true; map: BoothCoverMap }
  | {
      ok: false;
      reason: "missing" | "empty" | "self";
      map: BoothCoverMap;
    };

const emptyMap: BoothCoverMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isCover(value: unknown): value is BoothCover {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as Record<string, unknown>;
  return (
    typeof row.sitterId === "string" &&
    row.sitterId.trim().length > 0 &&
    typeof row.at === "string"
  );
}

export function resolveCoverStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function resolveCoverSitter(sitterId: string): Stall | undefined {
  const trimmed = sitterId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed);
}

export function neighborStalls(stallId: string): Stall[] {
  return allStalls().filter((stall) => stall.id !== stallId);
}

export function parseBoothCover(
  raw: string | null | undefined,
): BoothCoverMap {
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
    const next: BoothCoverMap = {};
    for (const [stallId, cover] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (typeof stallId !== "string" || stallId.length === 0) {
        continue;
      }
      if (!isCover(cover)) {
        continue;
      }
      const sitter = resolveCoverSitter(cover.sitterId);
      if (!sitter || sitter.id === stallId) {
        continue;
      }
      next[stallId] = {
        sitterId: sitter.id,
        at: cover.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeBoothCover(map: BoothCoverMap) {
  return JSON.stringify(map);
}

export function boothCoverCookieValue(map: BoothCoverMap): string {
  return serializeBoothCover(map);
}

export const BOOTH_COVER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOTH_COVER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(BOOTH_COVER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOTH_COVER_CHANGED_EVENT)}));}}}catch(e){}`;

export function boothCoverFor(
  stallId: string,
  map: BoothCoverMap = emptyMap,
): BoothCover | undefined {
  return map[stallId];
}

export function coverSitterFor(
  stallId: string,
  map: BoothCoverMap = emptyMap,
): Stall | undefined {
  const cover = boothCoverFor(stallId, map);
  if (!cover) {
    return undefined;
  }
  return resolveCoverSitter(cover.sitterId);
}

export function tapeBoothCover(
  stall: Stall | undefined,
  map: BoothCoverMap,
  rawSitterId: string,
  at = new Date(),
): BoothCoverWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", map };
  }
  const trimmed = rawSitterId.trim();
  if (!trimmed) {
    return { ok: false, reason: "empty", map };
  }
  const sitter = resolveCoverSitter(trimmed);
  if (!sitter) {
    return { ok: false, reason: "empty", map };
  }
  if (sitter.id === stall.id) {
    return { ok: false, reason: "self", map };
  }
  return {
    ok: true,
    map: {
      ...map,
      [stall.id]: { sitterId: sitter.id, at: at.toISOString() },
    },
  };
}

export function clearBoothCover(
  stall: Stall | undefined,
  map: BoothCoverMap,
): BoothCoverWriteResult {
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

export function mergeBoothCoverMaps(...maps: BoothCoverMap[]): BoothCoverMap {
  const next: BoothCoverMap = {};
  for (const map of maps) {
    for (const [stallId, cover] of Object.entries(map)) {
      const sitter = resolveCoverSitter(cover.sitterId);
      if (!sitter || sitter.id === stallId) {
        continue;
      }
      next[stallId] = { sitterId: sitter.id, at: cover.at };
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

export function readBoothCover(): BoothCoverMap {
  if (!canUseStorage()) {
    return emptyMap;
  }
  try {
    const fromStorage = parseBoothCover(
      window.localStorage.getItem(BOOTH_COVER_STORAGE_KEY),
    );
    if (Object.keys(fromStorage).length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return emptyMap;
}

export function writeBoothCover(map: BoothCoverMap) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothCover(map);
  try {
    window.localStorage.setItem(BOOTH_COVER_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_COVER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_COVER_CHANGED_EVENT));
}

export function subscribeBoothCover(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_COVER_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_COVER_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_COVER_CHANGED_EVENT, listener);
  };
}
