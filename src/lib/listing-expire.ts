/**
 * I will not expire it — the mall gift card stays credit. Still tote.
 *
 * Gift desk is paper. Redeem already reads the stand-in code. Reload
 * is stall paper only — no +$5 on the leftover. Wallet / coupon /
 * second gift SKU were killed. Walkers still want a Saturday void
 * on the card, or “make it die at noon.” I will not expire it. No
 * void date. Still credit. Not a wallet. Not reload. Not hours.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:expire-listing-ids` is the client expire set.
 * Cookie `iss-expire-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write gift-desk, redeem, reload, flash, hours, packed, sold,
 * file-gone, buy, digital eligibility, or tote keys.
 * Physical listings and digital files are refused — a CD-R does not
 * expire. A junk PDF does not expire.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const EXPIRE_STORAGE_KEY = "iss:expire-listing-ids";
export const EXPIRE_COOKIE_NAME = "iss-expire-listing-ids";
export const EXPIRE_CHANGED_EVENT = "iss:expire-changed";

export const EXPIRE_REFUSE_COPY = "That one does not take an expire note.";
export const EXPIRE_TABLE_LINE = "I will not expire it.";
export const EXPIRE_VOID_LINE = "No void date.";
export const EXPIRE_CREDIT_LINE = "Still credit.";
export const EXPIRE_NOTICE_TITLE =
  "I will not expire it. No void date. Still credit.";
export const EXPIRE_WALK_LINE =
  "Walkers still want a Saturday void on the card, or make it die at noon.";
export const EXPIRE_RELOAD_LINE =
  "Reload is stall paper only. Gift desk is paper.";
export const EXPIRE_STILL_LINE = "Still tote. Not a wallet. Not reload. Not hours.";
export const EXPIRE_TOTE_LINE = "Add to tote still works.";
export const EXPIRE_EMPTY_LINE = "Nobody taped the expire note yet.";

const SERVER_STORE = Symbol.for("iss.expire-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

let cachedRaw: string | null | undefined;
let cachedIds: string[] = emptyIds;

function canUseStorage() {
  return typeof window !== "undefined";
}

function uniqueListingIds(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const next: string[] = [];
  for (const id of ids) {
    if (typeof id !== "string" || id.length === 0 || seen.has(id)) {
      continue;
    }
    seen.add(id);
    next.push(id);
  }
  return next.length === 0 ? emptyIds : next;
}

export function parseExpireListingIds(raw: string | null | undefined): string[] {
  if (!raw) {
    return emptyIds;
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
      return emptyIds;
    }
    return uniqueListingIds(
      parsed.filter((id): id is string => typeof id === "string"),
    );
  } catch {
    return emptyIds;
  }
}

export function expireCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const EXPIRE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${EXPIRE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(EXPIRE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(EXPIRE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${EXPIRE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseExpireListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readExpireListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(EXPIRE_STORAGE_KEY);
    if (fromStorage) {
      const stored = snapshotFromRaw(fromStorage);
      if (stored.length > 0) {
        return stored;
      }
    }
    const fromCookie = readCookieRaw();
    if (fromCookie) {
      const ids = snapshotFromRaw(fromCookie);
      if (ids.length > 0) {
        try {
          window.localStorage.setItem(EXPIRE_STORAGE_KEY, JSON.stringify(ids));
        } catch {
          // blocked storage
        }
        return ids;
      }
    }
    return snapshotFromRaw(fromStorage ?? null);
  }

  return serverStore();
}

export function writeExpireListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = expireCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(EXPIRE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${EXPIRE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(EXPIRE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingExpireOverlay(
  listingId: string,
  listingIds = readExpireListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Gift rows only. Physical, digital file, sold, and file-gone stay off. */
export function canTapeExpire(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (!isGiftListing(listing)) {
    return false;
  }
  if (listing.status === "sold" || listing.status === "file-gone") {
    return false;
  }
  return true;
}

export type ExpireWriteReason =
  | "missing"
  | "physical"
  | "digital"
  | "sold"
  | "file-gone";

export type ExpireWriteResult =
  | { ok: true, listingIds: string[] }
  | { ok: false, reason: ExpireWriteReason, listingIds: string[] };

function refuseExpire(
  listing: Listing | undefined,
  listingIds: string[],
): ExpireWriteResult | null {
  if (!listing) {
    return { ok: false, reason: "missing", listingIds };
  }
  if (listing.status === "file-gone") {
    return { ok: false, reason: "file-gone", listingIds };
  }
  if (listing.status === "sold") {
    return { ok: false, reason: "sold", listingIds };
  }
  if (isGiftListing(listing)) {
    return null;
  }
  if (isDigitalListing(listing)) {
    return { ok: false, reason: "digital", listingIds };
  }
  return { ok: false, reason: "physical", listingIds };
}

export function markListingExpire(
  listing: Listing | undefined,
  listingIds: string[],
): ExpireWriteResult {
  const refused = refuseExpire(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingExpire(
  listing: Listing | undefined,
  listingIds: string[],
): ExpireWriteResult {
  const refused = refuseExpire(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return {
    ok: true,
    listingIds: listingIds.filter((id) => id !== taped.id),
  };
}

export function subscribeExpire(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === EXPIRE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(EXPIRE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EXPIRE_CHANGED_EVENT, listener);
  };
}
