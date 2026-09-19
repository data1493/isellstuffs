/**
 * I don’t have a hood — the windbreaker stays a shell. Still tote.
 *
 * Spray is no Scotchgard. Wash is I washed it. Smoke is the car.
 * Size is the lying tag. Sew is not a tailor. Lining is no flannel,
 * not a hood. Walkers still want Closet to snap a hood on, or
 * “make it a rain jacket.” I don’t have a hood. Shell only.
 * Still a jacket. Still for sale. Not spray. Not sew. Not lining.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:hood-listing-ids` is the client hood set.
 * Cookie `iss-hood-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and digital files are refused — a recipe scan does
 * not take a hood. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const HOOD_STORAGE_KEY = "iss:hood-listing-ids";
export const HOOD_COOKIE_NAME = "iss-hood-listing-ids";
export const HOOD_CHANGED_EVENT = "iss:hood-changed";

export const HOOD_REFUSE_COPY = "That one does not take a hood.";
export const HOOD_TABLE_LINE = "I don’t have a hood.";
export const HOOD_SHELL_LINE = "Shell only.";
export const HOOD_JACKET_LINE = "Still a jacket.";
export const HOOD_NOTICE_TITLE =
  "I don’t have a hood. Shell only. Still a jacket.";
export const HOOD_WALK_LINE =
  "Walkers still want Closet to snap a hood on, or make it a rain jacket.";
export const HOOD_STAYS_LINE =
  "This is the hood note. Shell only. Still a jacket.";
export const HOOD_STILL_LINE = "Still tote. Not spray. Not sew. Not lining.";
export const HOOD_TOTE_LINE = "Add to tote still works.";
export const HOOD_EMPTY_LINE = "Nobody taped a hood note yet.";

const SERVER_STORE = Symbol.for("iss.hood-listing-ids");

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

export function parseHoodListingIds(raw: string | null | undefined): string[] {
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
    // Reject write-result literals `{ ok, listingIds }` — they 500 the PDP.
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

export function hoodCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const HOOD_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${HOOD_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(HOOD_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(HOOD_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${HOOD_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseHoodListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readHoodListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(HOOD_STORAGE_KEY);
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
          window.localStorage.setItem(HOOD_STORAGE_KEY, JSON.stringify(ids));
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

export function writeHoodListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = hoodCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(HOOD_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${HOOD_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(HOOD_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingHoodOverlay(
  listingId: string,
  listingIds: readonly string[] = readHoodListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeHood(listing: Listing | undefined): listing is Listing {
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

export type HoodWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type HoodWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: HoodWriteReason; listingIds: string[] };

function refuseHood(
  listing: Listing | undefined,
  listingIds: string[],
): HoodWriteResult | null {
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

export function markListingHood(
  listing: Listing | undefined,
  listingIds: string[],
): HoodWriteResult {
  const refused = refuseHood(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingHood(
  listing: Listing | undefined,
  listingIds: string[],
): HoodWriteResult {
  const refused = refuseHood(listing, listingIds);
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

export function subscribeHood(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === HOOD_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(HOOD_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(HOOD_CHANGED_EVENT, listener);
  };
}
