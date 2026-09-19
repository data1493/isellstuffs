/**
 * Twist the neck — lamp switch honesty. Still tote.
 *
 * Crack is the ceramic base. Cord is the rewire. Box is the shade
 * in the carton. Fix is I don't solder. Walkers still want Tuesday
 * to put a new switch on the wobbly lamp, or "make it stay on
 * without twisting." Twist the neck. I will not replace the switch.
 * Still lights. Still for sale.
 * Not crack. Not a hardware shop. Not cord.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:twist-listing-ids` is the client twist set.
 * Cookie `iss-twist-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write crack, cord, box, fix, claim, dump, switch, neck,
 * socket, look, ask, hands, scan, heavy, with, van, firm, packed,
 * sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not twist.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const TWIST_STORAGE_KEY = "iss:twist-listing-ids";
export const TWIST_COOKIE_NAME = "iss-twist-listing-ids";
export const TWIST_CHANGED_EVENT = "iss:twist-changed";

export const TWIST_REFUSE_COPY = "That one does not twist.";
export const TWIST_TABLE_LINE = "Twist the neck.";
export const TWIST_SWITCH_LINE = "I will not replace the switch.";
export const TWIST_NOTICE_TITLE = "Twist the neck. I will not replace the switch.";
export const TWIST_CORD_LINE =
  "Crack is the ceramic base. Cord is the rewire. Box is the shade.";
export const TWIST_STILL_LINE =
  "Still lights. Still for sale. Not crack. Not a hardware shop. Not cord.";
export const TWIST_TOTE_LINE = "Add to tote still works.";
export const TWIST_EMPTY_LINE = "Nobody taped the twist yet.";

const SERVER_STORE = Symbol.for("iss.twist-listing-ids");

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

export function parseTwistListingIds(raw: string | null | undefined): string[] {
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

export function twistCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const TWIST_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${TWIST_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(TWIST_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(TWIST_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${TWIST_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseTwistListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readTwistListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(TWIST_STORAGE_KEY);
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
          window.localStorage.setItem(TWIST_STORAGE_KEY, JSON.stringify(ids));
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

export function writeTwistListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = twistCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(TWIST_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${TWIST_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(TWIST_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingTwistOverlay(
  listingId: string,
  listingIds = readTwistListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeTwist(listing: Listing | undefined): listing is Listing {
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

export type TwistWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type TwistWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: TwistWriteReason; listingIds: string[] };

function refuseTwist(
  listing: Listing | undefined,
  listingIds: string[],
): TwistWriteResult | null {
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

export function markListingTwist(
  listing: Listing | undefined,
  listingIds: string[],
): TwistWriteResult {
  const refused = refuseTwist(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingTwist(
  listing: Listing | undefined,
  listingIds: string[],
): TwistWriteResult {
  const refused = refuseTwist(listing, listingIds);
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

export function subscribeTwist(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === TWIST_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(TWIST_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TWIST_CHANGED_EVENT, listener);
  };
}
