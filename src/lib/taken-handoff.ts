/**
 * They took it. Close a driveway handoff after the buyer walked.
 *
 * Shape: JSON array of `{ slipId, listingId }`.
 * localStorage key `iss:taken-handoffs` is the client scribble.
 * Cookie `iss-taken-handoffs` is the same JSON so the queue can drop a line.
 *
 * Never write sold, file-gone, packed, watched, wanted, orders, or the tote.
 * Taken is not a refund and not a sold sticker. Digital and gift stay off this set.
 * Queue grouping stays in `seller-queue.ts`. Pickup hours stay in `pickup-display.ts`.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";
import { liveListingById } from "@/lib/live-catalog";

export const TAKEN_STORAGE_KEY = "iss:taken-handoffs";
export const TAKEN_COOKIE_NAME = "iss-taken-handoffs";
export const TAKEN_CHANGED_EVENT = "iss:taken-changed";

export type TakenHandoff = {
  slipId: string;
  listingId: string;
};

export type TakenWriteResult =
  | { ok: true; handoffs: TakenHandoff[] }
  | {
      ok: false;
      reason: "missing" | "digital" | "gift";
      handoffs: TakenHandoff[];
    };

const SERVER_STORE = Symbol.for("iss.taken-handoffs");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: TakenHandoff[];
};

const emptyHandoffs: TakenHandoff[] = [];

let cachedRaw: string | null | undefined;
let cachedHandoffs: TakenHandoff[] = emptyHandoffs;

function canUseStorage() {
  return typeof window !== "undefined";
}

export function handoffKey(slipId: string, listingId: string) {
  return `${slipId}:${listingId}`;
}

function isTakenHandoff(value: unknown): value is TakenHandoff {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as TakenHandoff;
  return (
    typeof row.slipId === "string" &&
    row.slipId.length > 0 &&
    typeof row.listingId === "string" &&
    row.listingId.length > 0
  );
}

export function uniqueTakenHandoffs(
  rows: readonly TakenHandoff[],
): TakenHandoff[] {
  const seen = new Set<string>();
  const next: TakenHandoff[] = [];
  for (const row of rows) {
    if (!isTakenHandoff(row)) {
      continue;
    }
    const key = handoffKey(row.slipId, row.listingId);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    next.push({ slipId: row.slipId, listingId: row.listingId });
  }
  return next.length === 0 ? emptyHandoffs : next;
}

export function parseTakenHandoffs(
  raw: string | null | undefined,
): TakenHandoff[] {
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
    return uniqueTakenHandoffs(parsed.filter(isTakenHandoff));
  } catch {
    return emptyHandoffs;
  }
}

export function takenCookieValue(handoffs: readonly TakenHandoff[]): string {
  return JSON.stringify(uniqueTakenHandoffs(handoffs));
}

export const TAKEN_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${TAKEN_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(TAKEN_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(TAKEN_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${TAKEN_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedHandoffs;
  }
  cachedRaw = raw;
  cachedHandoffs = parseTakenHandoffs(raw);
  return cachedHandoffs;
}

function serverStore(): TakenHandoff[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyHandoffs;
}

export function readTakenHandoffs(): TakenHandoff[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(TAKEN_STORAGE_KEY);
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
          window.localStorage.setItem(TAKEN_STORAGE_KEY, JSON.stringify(rows));
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

export function writeTakenHandoffs(handoffs: TakenHandoff[]) {
  const next = uniqueTakenHandoffs(handoffs);
  const raw = takenCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(TAKEN_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${TAKEN_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedHandoffs = next;
    window.dispatchEvent(new Event(TAKEN_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedHandoffs = next;
}

export function isHandoffTaken(
  slipId: string,
  listingId: string,
  handoffs = readTakenHandoffs(),
) {
  if (!slipId || !listingId) {
    return false;
  }
  return handoffs.some(
    (row) => row.slipId === slipId && row.listingId === listingId,
  );
}

export function canTakeListing(
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

export function markHandoffTaken(
  listing: Listing | undefined,
  slipId: string,
  listingId: string,
  handoffs: TakenHandoff[],
): TakenWriteResult {
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
  if (isHandoffTaken(slipId, listingId, handoffs)) {
    return { ok: true, handoffs };
  }
  return {
    ok: true,
    handoffs: [...handoffs, { slipId, listingId }],
  };
}

export function putHandoffWaiting(
  listing: Listing | undefined,
  slipId: string,
  listingId: string,
  handoffs: TakenHandoff[],
): TakenWriteResult {
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
  if (!isHandoffTaken(slipId, listingId, handoffs)) {
    return { ok: true, handoffs };
  }
  return {
    ok: true,
    handoffs: handoffs.filter(
      (row) => !(row.slipId === slipId && row.listingId === listingId),
    ),
  };
}

export function liveTakeListing(listingId: string) {
  return liveListingById(listingId);
}

type ComingBooth = {
  arrivals: Array<{ slipId: string; listing: { id: string; title: string } }>;
  titles: string[];
};

/** Hide taken arrivals. Does not rewrite queue grouping. */
export function queueBoothsStillComing<T extends ComingBooth>(
  booths: T[],
  handoffs = readTakenHandoffs(),
): T[] {
  if (handoffs.length === 0) {
    return booths;
  }

  return booths
    .map((booth) => {
      const arrivals = booth.arrivals.filter(
        (arrival) =>
          !isHandoffTaken(arrival.slipId, arrival.listing.id, handoffs),
      );
      const titles: string[] = [];
      for (const arrival of arrivals) {
        if (!titles.includes(arrival.listing.title)) {
          titles.push(arrival.listing.title);
        }
      }
      return { ...booth, arrivals, titles };
    })
    .filter((booth) => booth.arrivals.length > 0);
}

export function subscribeTaken(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === TAKEN_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(TAKEN_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TAKEN_CHANGED_EVENT, listener);
  };
}
