/**
 * I will not normalize — as recorded. Still for sale. Still tote.
 *
 * Tune is no kicks in C. Stems is twelve shots. BPM is a guess.
 * Loop is I will not slice. Picky / swap-a-kick was killed.
 * Copy is the Beats stall USB. Walkers still want Beats to
 * normalize the $4 pack, or “make the kicks the same loud.”
 * I will not normalize. As recorded. Still for sale.
 * Not tune. Not a mix desk. Not stems.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:norm-listing-ids` is the client norm set.
 * Cookie `iss-norm-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and physical rows are refused — a lamp does not
 * normalize. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const NORM_STORAGE_KEY = "iss:norm-listing-ids";
export const NORM_COOKIE_NAME = "iss-norm-listing-ids";
export const NORM_CHANGED_EVENT = "iss:norm-changed";

export const NORM_REFUSE_COPY = "That one does not take a normalize note.";
export const NORM_TABLE_LINE = "I will not normalize.";
export const NORM_STAYS_LINE = "As recorded.";
export const NORM_NOTICE_TITLE =
  "I will not normalize. As recorded. Still for sale.";
export const NORM_WALK_LINE =
  "Walkers still want the kicks the same loud.";
export const NORM_STILL_LINE =
  "Still tote. Not tune. Not a mix desk. Not stems.";
export const NORM_TOTE_LINE = "Add to tote still works.";
export const NORM_EMPTY_LINE = "Nobody taped the normalize note yet.";

const SERVER_STORE = Symbol.for("iss.norm-listing-ids");

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

export function parseNormListingIds(raw: string | null | undefined): string[] {
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

export function normCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const NORM_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${NORM_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(NORM_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(NORM_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${NORM_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseNormListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readNormListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(NORM_STORAGE_KEY);
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
          window.localStorage.setItem(NORM_STORAGE_KEY, JSON.stringify(ids));
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

export function writeNormListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = normCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(NORM_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${NORM_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(NORM_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingNormOverlay(
  listingId: string,
  listingIds = readNormListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeNorm(listing: Listing | undefined): listing is Listing {
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

export type NormWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type NormWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: NormWriteReason; listingIds: string[] };

function refuseNorm(
  listing: Listing | undefined,
  listingIds: string[],
): NormWriteResult | null {
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

export function markListingNorm(
  listing: Listing | undefined,
  listingIds: string[],
): NormWriteResult {
  const refused = refuseNorm(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingNorm(
  listing: Listing | undefined,
  listingIds: string[],
): NormWriteResult {
  const refused = refuseNorm(listing, listingIds);
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

export function subscribeNorm(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === NORM_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(NORM_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(NORM_CHANGED_EVENT, listener);
  };
}
