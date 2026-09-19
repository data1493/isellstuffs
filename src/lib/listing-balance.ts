/**
 * I will not balance it — the LUT pack stays three looks, tungsten.
 * Still tote.
 *
 * Warm stays warm. Convert is Rec.709. Grade is no custom LUT.
 * Shot is I don't shoot. Walkers still want Half-Working to
 * balance the parking-lot pack, or “make a daylight.” I will
 * not balance it. Three looks. Tungsten. Still for sale.
 * Not warm. Not convert. Not grade.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:balance-listing-ids` is the client balance set.
 * Cookie `iss-balance-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write warm, shot, grade, convert, link, dongle, meter, or
 * tune keys. Physical listings and gift cards are refused — a lamp
 * does not white-balance. Fixture `sold` / `file-gone` rows stay
 * as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const BALANCE_STORAGE_KEY = "iss:balance-listing-ids";
export const BALANCE_COOKIE_NAME = "iss-balance-listing-ids";
export const BALANCE_CHANGED_EVENT = "iss:balance-changed";

export const BALANCE_REFUSE_COPY = "That one does not take a balance note.";
export const BALANCE_TABLE_LINE = "I will not balance it.";
export const BALANCE_LOOKS_LINE = "Three looks.";
export const BALANCE_TUNGSTEN_LINE = "Tungsten.";
export const BALANCE_NOTICE_TITLE = "I will not balance it. Three looks. Tungsten.";
export const BALANCE_WARM_LINE =
  "Warm stays warm. Convert is Rec.709. Grade is no custom LUT.";
export const BALANCE_WALK_LINE =
  "Walkers still want Half-Working to balance the parking-lot pack, or make a daylight.";
export const BALANCE_STILL_LINE =
  "Still tote. Still for sale. Not warm. Not convert. Not grade.";
export const BALANCE_TOTE_LINE = "Add to tote still works.";
export const BALANCE_EMPTY_LINE = "Nobody taped the balance note yet.";

const SERVER_STORE = Symbol.for("iss.balance-listing-ids");

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

export function parseBalanceListingIds(raw: string | null | undefined): string[] {
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

export function balanceCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BALANCE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BALANCE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BALANCE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BALANCE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BALANCE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBalanceListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBalanceListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BALANCE_STORAGE_KEY);
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
          window.localStorage.setItem(BALANCE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeBalanceListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = balanceCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BALANCE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BALANCE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BALANCE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBalanceOverlay(
  listingId: string,
  listingIds = readBalanceListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeBalance(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (!isDigitalListing(listing)) {
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

export type BalanceWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type BalanceWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: BalanceWriteReason; listingIds: string[] };

function refuseBalance(
  listing: Listing | undefined,
  listingIds: string[],
): BalanceWriteResult | null {
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
  if (!isDigitalListing(listing)) {
    return { ok: false, reason: "physical", listingIds };
  }
  return null;
}

export function markListingBalance(
  listing: Listing | undefined,
  listingIds: string[],
): BalanceWriteResult {
  const refused = refuseBalance(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingBalance(
  listing: Listing | undefined,
  listingIds: string[],
): BalanceWriteResult {
  const refused = refuseBalance(listing, listingIds);
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

export function subscribeBalance(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BALANCE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BALANCE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BALANCE_CHANGED_EVENT, listener);
  };
}
