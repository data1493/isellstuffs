/**
 * I don't know the phone — charger honesty. Still tote.
 *
 * Parts is sold as a tangle. Pile is won't split. Van is more in the van.
 * Walkers still ask if the brick fits their iPhone. This is the phone note.
 * Some ends look honest. Still for sale. Not parts. Not a phone counter. Not pile.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:phone-listing-ids` is the client phone set.
 * Cookie `iss-phone-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write parts, pile, van, cells, brick, ends, charge, tip, look,
 * ask, hands, firm, packed, sold, file-gone, gift, buy, digital
 * eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not charge a phone.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const PHONE_STORAGE_KEY = "iss:phone-listing-ids";
export const PHONE_COOKIE_NAME = "iss-phone-listing-ids";
export const PHONE_CHANGED_EVENT = "iss:phone-changed";

export const PHONE_REFUSE_COPY = "That one does not take a phone note.";
export const PHONE_TABLE_LINE = "I don't know the phone.";
export const PHONE_HONEST_LINE = "Some ends look honest.";
export const PHONE_NOTICE_TITLE = "I don't know the phone. Some ends look honest.";
export const PHONE_PARTS_LINE = "Parts is sold as a tangle. Pile is won't split.";
export const PHONE_BRICK_LINE =
  "Walkers still ask if the brick fits their iPhone.";
export const PHONE_STILL_LINE =
  "Still tote. Not parts. Not a phone counter. Not pile.";
export const PHONE_TOTE_LINE = "Add to tote still works.";
export const PHONE_EMPTY_LINE = "Nobody taped a phone note yet.";

const SERVER_STORE = Symbol.for("iss.phone-listing-ids");

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

export function parsePhoneListingIds(raw: string | null | undefined): string[] {
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

export function phoneCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const PHONE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PHONE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(PHONE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PHONE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${PHONE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePhoneListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readPhoneListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(PHONE_STORAGE_KEY);
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
          window.localStorage.setItem(PHONE_STORAGE_KEY, JSON.stringify(ids));
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

export function writePhoneListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = phoneCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PHONE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PHONE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(PHONE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingPhoneOverlay(
  listingId: string,
  listingIds = readPhoneListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapePhone(listing: Listing | undefined): listing is Listing {
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

export type PhoneWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type PhoneWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: PhoneWriteReason; listingIds: string[] };

function refusePhone(
  listing: Listing | undefined,
  listingIds: string[],
): PhoneWriteResult | null {
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

export function markListingPhone(
  listing: Listing | undefined,
  listingIds: string[],
): PhoneWriteResult {
  const refused = refusePhone(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingPhone(
  listing: Listing | undefined,
  listingIds: string[],
): PhoneWriteResult {
  const refused = refusePhone(listing, listingIds);
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

export function subscribePhone(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PHONE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PHONE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PHONE_CHANGED_EVENT, listener);
  };
}
