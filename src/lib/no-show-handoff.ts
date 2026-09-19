/**
 * They never showed. After the pickup window, put the lamp back on the floor.
 *
 * Shape: JSON array of `{ slipId, listingId }`.
 * localStorage key `iss:no-show-handoffs` is the client scribble.
 * Cookie `iss-no-show-handoffs` is the same JSON so the queue can drop a ghost.
 *
 * Never write taken, file-gone, packed, watched, wanted, orders, or the tote.
 * No-show restocks the sold overlay. Taken already closed the handoff — leave it.
 * Digital and gift stay off this set. Pickup hours stay in `pickup-display.ts`.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";
import { liveListingById } from "@/lib/live-catalog";
import {
  markListingSold,
  restockListing,
  type SoldWriteResult,
} from "@/lib/sold-overlay";
import {
  isHandoffTaken,
  type TakenHandoff,
} from "@/lib/taken-handoff";

export const NO_SHOW_STORAGE_KEY = "iss:no-show-handoffs";
export const NO_SHOW_COOKIE_NAME = "iss-no-show-handoffs";
export const NO_SHOW_CHANGED_EVENT = "iss:no-show-changed";

export type NoShowHandoff = {
  slipId: string;
  listingId: string;
};

export type NoShowWriteResult =
  | { ok: true; handoffs: NoShowHandoff[] }
  | {
      ok: false;
      reason: "missing" | "digital" | "gift" | "taken";
      handoffs: NoShowHandoff[];
    };

const SERVER_STORE = Symbol.for("iss.no-show-handoffs");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: NoShowHandoff[];
};

const emptyHandoffs: NoShowHandoff[] = [];

let cachedRaw: string | null | undefined;
let cachedHandoffs: NoShowHandoff[] = emptyHandoffs;

function canUseStorage() {
  return typeof window !== "undefined";
}

export function noShowKey(slipId: string, listingId: string) {
  return `${slipId}:${listingId}`;
}

function isNoShowHandoff(value: unknown): value is NoShowHandoff {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as NoShowHandoff;
  return (
    typeof row.slipId === "string" &&
    row.slipId.length > 0 &&
    typeof row.listingId === "string" &&
    row.listingId.length > 0
  );
}

export function uniqueNoShowHandoffs(
  rows: readonly NoShowHandoff[],
): NoShowHandoff[] {
  const seen = new Set<string>();
  const next: NoShowHandoff[] = [];
  for (const row of rows) {
    if (!isNoShowHandoff(row)) {
      continue;
    }
    const key = noShowKey(row.slipId, row.listingId);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    next.push({ slipId: row.slipId, listingId: row.listingId });
  }
  return next.length === 0 ? emptyHandoffs : next;
}

export function parseNoShowHandoffs(
  raw: string | null | undefined,
): NoShowHandoff[] {
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
    return uniqueNoShowHandoffs(parsed.filter(isNoShowHandoff));
  } catch {
    return emptyHandoffs;
  }
}

export function noShowCookieValue(handoffs: readonly NoShowHandoff[]): string {
  return JSON.stringify(uniqueNoShowHandoffs(handoffs));
}

export const NO_SHOW_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${NO_SHOW_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(NO_SHOW_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(NO_SHOW_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${NO_SHOW_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedHandoffs;
  }
  cachedRaw = raw;
  cachedHandoffs = parseNoShowHandoffs(raw);
  return cachedHandoffs;
}

function serverStore(): NoShowHandoff[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyHandoffs;
}

export function readNoShowHandoffs(): NoShowHandoff[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(NO_SHOW_STORAGE_KEY);
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
          window.localStorage.setItem(NO_SHOW_STORAGE_KEY, JSON.stringify(rows));
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

export function writeNoShowHandoffs(handoffs: NoShowHandoff[]) {
  const next = uniqueNoShowHandoffs(handoffs);
  const raw = noShowCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(NO_SHOW_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${NO_SHOW_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedHandoffs = next;
    window.dispatchEvent(new Event(NO_SHOW_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedHandoffs = next;
}

export function isHandoffNoShow(
  slipId: string,
  listingId: string,
  handoffs = readNoShowHandoffs(),
) {
  if (!slipId || !listingId) {
    return false;
  }
  return handoffs.some(
    (row) => row.slipId === slipId && row.listingId === listingId,
  );
}

export function canNoShowListing(
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

export function markHandoffNoShow(
  listing: Listing | undefined,
  slipId: string,
  listingId: string,
  handoffs: NoShowHandoff[],
  taken: readonly TakenHandoff[] = [],
): NoShowWriteResult {
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
  if (isHandoffNoShow(slipId, listingId, handoffs)) {
    return { ok: true, handoffs };
  }
  return {
    ok: true,
    handoffs: [...handoffs, { slipId, listingId }],
  };
}

export function putNoShowWaiting(
  listing: Listing | undefined,
  slipId: string,
  listingId: string,
  handoffs: NoShowHandoff[],
): NoShowWriteResult {
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
  if (!isHandoffNoShow(slipId, listingId, handoffs)) {
    return { ok: true, handoffs };
  }
  return {
    ok: true,
    handoffs: handoffs.filter(
      (row) => !(row.slipId === slipId && row.listingId === listingId),
    ),
  };
}

/** Restock on no-show. Re-sticker if they might still walk up. */
export function soldIdsAfterNoShowIntent(
  listing: Listing | undefined,
  intent: "noshow" | "waiting",
  soldIds: string[],
  taken: readonly TakenHandoff[] = [],
  slipId = "",
  listingId = "",
): SoldWriteResult {
  if (intent === "waiting") {
    if (slipId && listingId && isHandoffTaken(slipId, listingId, taken as TakenHandoff[])) {
      return { ok: true, listingIds: soldIds };
    }
    return markListingSold(listing, soldIds);
  }
  return restockListing(listing, soldIds);
}

export function liveNoShowListing(listingId: string) {
  return liveListingById(listingId);
}

type ComingBooth = {
  arrivals: Array<{ slipId: string; listing: { id: string; title: string } }>;
  titles: string[];
};

/** Hide no-show arrivals. Does not rewrite queue grouping or taken. */
export function queueBoothsNotNoShow<T extends ComingBooth>(
  booths: T[],
  handoffs = readNoShowHandoffs(),
): T[] {
  if (handoffs.length === 0) {
    return booths;
  }

  return booths
    .map((booth) => {
      const arrivals = booth.arrivals.filter(
        (arrival) =>
          !isHandoffNoShow(arrival.slipId, arrival.listing.id, handoffs),
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

export function subscribeNoShow(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === NO_SHOW_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(NO_SHOW_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(NO_SHOW_CHANGED_EVENT, listener);
  };
}
