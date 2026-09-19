/**
 * I don't have a dongle — the drawer stays a drawer. Still tote.
 *
 * Walkers still want Half-Working to throw a dongle in the drawer, or
 * “give me USB-C for the laptop.” I don't have a dongle. Sold as a pile.
 * Still for sale. Not a cable counter.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:dongle-listing-ids` is the client dongle set.
 * Cookie `iss-dongle-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and digital files are refused — a LUT is not a dongle.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const DONGLE_STORAGE_KEY = "iss:dongle-listing-ids";
export const DONGLE_COOKIE_NAME = "iss-dongle-listing-ids";
export const DONGLE_CHANGED_EVENT = "iss:dongle-changed";

export const DONGLE_REFUSE_COPY = "That one does not take a dongle note.";
export const DONGLE_TABLE_LINE = "I don't have a dongle.";
export const DONGLE_SOLD_LINE = "Sold as a pile.";
export const DONGLE_NOTICE_TITLE = "I don't have a dongle. Sold as a pile.";
export const DONGLE_WALK_LINE =
  "Walkers still want Half-Working to throw a dongle in the drawer.";
export const DONGLE_STAYS_LINE = "This is the dongle note. Sold as a pile.";
export const DONGLE_STILL_LINE = "Still tote. Not a cable counter. Still for sale.";
export const DONGLE_TOTE_LINE = "Add to tote still works.";
export const DONGLE_EMPTY_LINE = "Nobody taped a dongle note yet.";

const SERVER_STORE = Symbol.for("iss.dongle-listing-ids");

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

export function parseDongleListingIds(raw: string | null | undefined): string[] {
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

export function dongleCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const DONGLE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${DONGLE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(DONGLE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(DONGLE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${DONGLE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseDongleListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readDongleListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(DONGLE_STORAGE_KEY);
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
          window.localStorage.setItem(DONGLE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeDongleListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = dongleCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(DONGLE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${DONGLE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(DONGLE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingDongleOverlay(
  listingId: string,
  listingIds = readDongleListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeDongle(listing: Listing | undefined): listing is Listing {
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

export type DongleWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type DongleWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: DongleWriteReason; listingIds: string[] };

function refuseDongle(
  listing: Listing | undefined,
  listingIds: string[],
): DongleWriteResult | null {
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

export function markListingDongle(
  listing: Listing | undefined,
  listingIds: string[],
): DongleWriteResult {
  const refused = refuseDongle(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingDongle(
  listing: Listing | undefined,
  listingIds: string[],
): DongleWriteResult {
  const refused = refuseDongle(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return {
    ok: true, listingIds: listingIds.filter((id) => id !== taped.id),
  };
}

export function subscribeDongle(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === DONGLE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(DONGLE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(DONGLE_CHANGED_EVENT, listener);
  };
}
