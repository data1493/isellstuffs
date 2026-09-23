/**
 * That's the price — the seller will not move.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:firm-listing-ids` is the client firm set.
 * Cookie `iss-firm-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `status`, `cartEligible`, or `price`.
 * Never write offer, look, van, packed, sold, file-gone, gift, or tote keys.
 * Gift listings and digital files are refused — a PDF is not a lamp tag.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const FIRM_STORAGE_KEY = "iss:firm-listing-ids";
export const FIRM_COOKIE_NAME = "iss-firm-listing-ids";
export const FIRM_CHANGED_EVENT = "iss:firm-changed";

export const FIRM_MISSING_COPY = "No firm price for that listing.";
export const FIRM_FILE_COPY = "No firm price on a file.";
export const FIRM_GIFT_COPY = "No firm price on a gift card.";
export const FIRM_SOLD_COPY =
  "It already walked. The tag is not taking a firm paper.";
export const FIRM_GONE_COPY = "The folder is empty. Nothing to hold firm.";
export const FIRM_TABLE_LINE = "That's the price.";
export const FIRM_SELLER_LINE = "The seller will not move.";
export const FIRM_TOTE_LINE = "Add to tote still rings the tag.";
export const FIRM_OFFER_LINE = "An offer is a haggle scrap. This paper is not.";
export const FIRM_EMPTY_LINE = "Nobody taped a firm price yet.";

const SERVER_STORE = Symbol.for("iss.firm-listing-ids");

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

export function parseFirmListingIds(raw: string | null | undefined): string[] {
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

export function firmCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const FIRM_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${FIRM_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(FIRM_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(FIRM_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${FIRM_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseFirmListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readFirmListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(FIRM_STORAGE_KEY);
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
          window.localStorage.setItem(FIRM_STORAGE_KEY, JSON.stringify(ids));
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

export function writeFirmListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = firmCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(FIRM_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${FIRM_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(FIRM_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingFirmOverlay(
  listingId: string,
  listingIds = readFirmListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canStampFirm(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (!isPhysicalListing(listing)) {
    return false;
  }
  if (isGiftListing(listing)) {
    return false;
  }
  if (listing.status === "sold" || listing.status === "file-gone") {
    return false;
  }
  return true;
}

export type FirmWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type FirmWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: FirmWriteReason; listingIds: string[] };

function refuseFirm(
  listing: Listing | undefined,
  listingIds: string[],
): FirmWriteResult | null {
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
    return { ok: false, reason: "gift", listingIds };
  }
  if (!isPhysicalListing(listing)) {
    return { ok: false, reason: "digital", listingIds };
  }
  return null;
}

export function markListingFirm(
  listing: Listing | undefined,
  listingIds: string[],
): FirmWriteResult {
  const refused = refuseFirm(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingFirm(
  listing: Listing | undefined,
  listingIds: string[],
): FirmWriteResult {
  const refused = refuseFirm(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (!listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return {
    ok: true,
    listingIds: listingIds.filter((id) => id !== listing!.id),
  };
}

export function subscribeFirm(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === FIRM_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(FIRM_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FIRM_CHANGED_EVENT, listener);
  };
}
