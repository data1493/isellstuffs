/**
 * I will not write Side B — the liner PDF stays one page. Still tote.
 *
 * Memory is the page we already have. Reprint is someone else's
 * paper. Titles are someone else's paper. Sequel is someone else's
 * paper. Walkers still want Sunday Crate to write Side B, or
 * “make the liner two pages.” I will not write Side B. One page.
 * Still for sale. Not a sequel desk.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:verso-listing-ids` is the client verso set.
 * Cookie `iss-verso-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and physical rows are refused — a cassette is not a
 * liner page. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const VERSO_STORAGE_KEY = "iss:verso-listing-ids";
export const VERSO_COOKIE_NAME = "iss-verso-listing-ids";
export const VERSO_CHANGED_EVENT = "iss:verso-changed";

export const VERSO_REFUSE_COPY = "That one does not take a verso note.";
export const VERSO_TABLE_LINE = "I will not write Side B.";
export const VERSO_STAYS_LINE = "One page. Wrong.";
export const VERSO_NOTICE_TITLE = "I will not write Side B. One page. Wrong.";
export const VERSO_WALK_LINE = "Walkers still want a second page.";
export const VERSO_STILL_LINE = "Still tote. Not a sequel desk.";
export const VERSO_TOTE_LINE = "Add to tote still works.";
export const VERSO_EMPTY_LINE = "Nobody taped the verso note yet.";

const SERVER_STORE = Symbol.for("iss.verso-listing-ids");

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

export function parseVersoListingIds(raw: string | null | undefined): string[] {
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

export function versoCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const VERSO_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${VERSO_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(VERSO_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(VERSO_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${VERSO_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseVersoListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readVersoListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(VERSO_STORAGE_KEY);
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
          window.localStorage.setItem(VERSO_STORAGE_KEY, JSON.stringify(ids));
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

export function writeVersoListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = versoCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(VERSO_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${VERSO_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(VERSO_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingVersoOverlay(
  listingId: string,
  listingIds = readVersoListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeVerso(listing: Listing | undefined): listing is Listing {
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

export type VersoWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type VersoWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: VersoWriteReason; listingIds: string[] };

function refuseVerso(
  listing: Listing | undefined,
  listingIds: string[],
): VersoWriteResult | null {
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

export function markListingVerso(
  listing: Listing | undefined,
  listingIds: string[],
): VersoWriteResult {
  const refused = refuseVerso(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingVerso(
  listing: Listing | undefined,
  listingIds: string[],
): VersoWriteResult {
  const refused = refuseVerso(listing, listingIds);
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

export function subscribeVerso(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === VERSO_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(VERSO_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(VERSO_CHANGED_EVENT, listener);
  };
}
