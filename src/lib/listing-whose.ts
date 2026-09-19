/**
 * I will not say whose — mug provenance honesty. Still tote.
 *
 * Chip is the diner rim. Heat is not for the microwave. Match is
 * nothing matches. Lost is sunglasses. Walkers still want a grandma
 * story, which apartment, “is this yours.” I will not say whose.
 * From three apartments. Still a mug. Still for sale.
 * Not chip. Not a family desk. Not match.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:whose-listing-ids` is the client whose set.
 * Cookie `iss-whose-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write chip, heat, match, lost, cards, apt, from, name, film,
 * look, ask, hands, van, firm, packed, sold, file-gone, gift, buy,
 * digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not have
 * a grandma. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const WHOSE_STORAGE_KEY = "iss:whose-listing-ids";
export const WHOSE_COOKIE_NAME = "iss-whose-listing-ids";
export const WHOSE_CHANGED_EVENT = "iss:whose-changed";

export const WHOSE_REFUSE_COPY = "That one does not take a whose note.";
export const WHOSE_TABLE_LINE = "I will not say whose.";
export const WHOSE_APT_LINE = "From three apartments.";
export const WHOSE_NOTICE_TITLE = "I will not say whose. From three apartments.";
export const WHOSE_CHIP_LINE = "Chip is the diner rim. Heat is not for the microwave.";
export const WHOSE_MATCH_LINE = "Match is nothing matches. Lost is sunglasses.";
export const WHOSE_STILL_LINE = "Still tote. Not chip. Not a family desk. Not match.";
export const WHOSE_TOTE_LINE = "Add to tote still works.";
export const WHOSE_EMPTY_LINE = "Nobody taped whose yet.";

const SERVER_STORE = Symbol.for("iss.whose-listing-ids");

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

export function parseWhoseListingIds(raw: string | null | undefined): string[] {
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

export function whoseCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const WHOSE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${WHOSE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(WHOSE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(WHOSE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${WHOSE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseWhoseListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readWhoseListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(WHOSE_STORAGE_KEY);
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
          window.localStorage.setItem(WHOSE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeWhoseListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = whoseCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(WHOSE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${WHOSE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(WHOSE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingWhoseOverlay(
  listingId: string,
  listingIds = readWhoseListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeWhose(listing: Listing | undefined): listing is Listing {
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

export type WhoseWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type WhoseWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: WhoseWriteReason; listingIds: string[] };

function refuseWhose(
  listing: Listing | undefined,
  listingIds: string[],
): WhoseWriteResult | null {
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

export function markListingWhose(
  listing: Listing | undefined,
  listingIds: string[],
): WhoseWriteResult {
  const refused = refuseWhose(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingWhose(
  listing: Listing | undefined,
  listingIds: string[],
): WhoseWriteResult {
  const refused = refuseWhose(listing, listingIds);
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

export function subscribeWhose(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === WHOSE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(WHOSE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(WHOSE_CHANGED_EVENT, listener);
  };
}
