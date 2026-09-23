/**
 * I’m walking up. A here flag between paid and taken.
 *
 * Shape: JSON array of `{ slipId, listingId }`.
 * localStorage key `iss:here-handoffs` is the client scribble.
 * Cookie `iss-here-handoffs` is the same JSON so the queue can stamp In the drive.
 *
 * Never write taken, sold, file-gone, packed, orders, cash, or the tote.
 * Here is not taken and not a civic color. Digital and gift stay off this set.
 * Queue grouping stays in `seller-queue.ts`. Pickup hours stay in `pickup-display.ts`.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";
import { liveListingById } from "@/lib/live-catalog";
import { isHandoffTaken, type TakenHandoff } from "@/lib/taken-handoff";

export const HERE_STORAGE_KEY = "iss:here-handoffs";
export const HERE_COOKIE_NAME = "iss-here-handoffs";
export const HERE_CHANGED_EVENT = "iss:here-changed";

export const HERE_COPY = "In the drive. Not taken. Not a civic color.";

export type HereHandoff = {
  slipId: string;
  listingId: string;
};

export type HereWriteResult =
  | { ok: true; handoffs: HereHandoff[] }
  | {
      ok: false;
      reason: "missing" | "digital" | "gift" | "taken";
      handoffs: HereHandoff[];
    };

const SERVER_STORE = Symbol.for("iss.here-handoffs");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: HereHandoff[];
};

const emptyHandoffs: HereHandoff[] = [];

let cachedRaw: string | null | undefined;
let cachedHandoffs: HereHandoff[] = emptyHandoffs;

function canUseStorage() {
  return typeof window !== "undefined";
}

export function hereKey(slipId: string, listingId: string) {
  return `${slipId}:${listingId}`;
}

function isHereHandoff(value: unknown): value is HereHandoff {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as HereHandoff;
  return (
    typeof row.slipId === "string" &&
    row.slipId.length > 0 &&
    typeof row.listingId === "string" &&
    row.listingId.length > 0
  );
}

export function uniqueHereHandoffs(
  rows: readonly HereHandoff[],
): HereHandoff[] {
  const seen = new Set<string>();
  const next: HereHandoff[] = [];
  for (const row of rows) {
    if (!isHereHandoff(row)) {
      continue;
    }
    const key = hereKey(row.slipId, row.listingId);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    next.push({ slipId: row.slipId, listingId: row.listingId });
  }
  return next.length === 0 ? emptyHandoffs : next;
}

export function parseHereHandoffs(
  raw: string | null | undefined,
): HereHandoff[] {
  if (!raw) {
    return emptyHandoffs;
  }

  try {
    let value = raw;
    try {
      value = decodeURIComponent(raw);
    } catch {
      value = raw;
    }
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return emptyHandoffs;
    }
    return uniqueHereHandoffs(parsed.filter(isHereHandoff));
  } catch {
    return emptyHandoffs;
  }
}

export function hereCookieValue(handoffs: readonly HereHandoff[]): string {
  return JSON.stringify(uniqueHereHandoffs(handoffs));
}

export const HERE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${HERE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(HERE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(HERE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${HERE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedHandoffs;
  }
  cachedRaw = raw;
  cachedHandoffs = parseHereHandoffs(raw);
  return cachedHandoffs;
}

function serverStore(): HereHandoff[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyHandoffs;
}

export function readHereHandoffs(): HereHandoff[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(HERE_STORAGE_KEY);
    if (fromStorage) {
      const stored = snapshotFromRaw(fromStorage);
      if (stored.length > 0) {
        return stored;
      }
    }
    const fromCookie = readCookieRaw();
    if (fromCookie) {
      const rows = snapshotFromRaw(fromCookie);
      if (rows.length > 0) {
        try {
          window.localStorage.setItem(HERE_STORAGE_KEY, JSON.stringify(rows));
        } catch {
          // blocked storage
        }
        return rows;
      }
    }
    return snapshotFromRaw(fromStorage ?? null);
  }

  return serverStore();
}

export function writeHereHandoffs(handoffs: HereHandoff[]) {
  const next = uniqueHereHandoffs(handoffs);
  const raw = hereCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(HERE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${HERE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedHandoffs = next;
    window.dispatchEvent(new Event(HERE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedHandoffs = next;
}

export function isHandoffHere(
  slipId: string,
  listingId: string,
  handoffs = readHereHandoffs(),
) {
  if (!slipId || !listingId) {
    return false;
  }
  return handoffs.some(
    (row) => row.slipId === slipId && row.listingId === listingId,
  );
}

export function canHereListing(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (isGiftListing(listing)) {
    return false;
  }
  return isPhysicalListing(listing);
}

function refuseHereWrite(
  listing: Listing | undefined,
  slipId: string,
  listingId: string,
  handoffs: HereHandoff[],
  taken: readonly TakenHandoff[] = [],
): HereWriteResult | null {
  if (!slipId || !listingId) {
    return { ok: false, reason: "missing", handoffs };
  }
  if (!listing) {
    return { ok: false, reason: "missing", handoffs };
  }
  if (isGiftListing(listing)) {
    return { ok: false, reason: "gift", handoffs };
  }
  if (!isPhysicalListing(listing)) {
    return { ok: false, reason: "digital", handoffs };
  }
  if (isHandoffTaken(slipId, listingId, taken as TakenHandoff[])) {
    return { ok: false, reason: "taken", handoffs };
  }
  return null;
}

export function markHandoffHere(
  listing: Listing | undefined,
  slipId: string,
  listingId: string,
  handoffs: HereHandoff[],
  taken: readonly TakenHandoff[] = [],
): HereWriteResult {
  const refused = refuseHereWrite(listing, slipId, listingId, handoffs, taken);
  if (refused) {
    return refused;
  }
  if (isHandoffHere(slipId, listingId, handoffs)) {
    return { ok: true, handoffs };
  }
  return {
    ok: true,
    handoffs: [...handoffs, { slipId, listingId }],
  };
}

export function putHandoffWait(
  listing: Listing | undefined,
  slipId: string,
  listingId: string,
  handoffs: HereHandoff[],
  taken: readonly TakenHandoff[] = [],
): HereWriteResult {
  const refused = refuseHereWrite(listing, slipId, listingId, handoffs, taken);
  if (refused) {
    return refused;
  }
  if (!isHandoffHere(slipId, listingId, handoffs)) {
    return { ok: true, handoffs };
  }
  return {
    ok: true,
    handoffs: handoffs.filter(
      (row) => !(row.slipId === slipId && row.listingId === listingId),
    ),
  };
}

export function liveHereListing(listingId: string) {
  return liveListingById(listingId);
}

export function subscribeHere(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === HERE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(HERE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(HERE_CHANGED_EVENT, listener);
  };
}
