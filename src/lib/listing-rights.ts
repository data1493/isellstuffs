/**
 * I will not clear it — as recorded. Still for sale. Still tote.
 *
 * Tune is no kicks in C. Stems is twelve shots. BPM is a guess.
 * Loop is I will not slice. Norm is I will not normalize.
 * License / YouTube-clear were killed as claim twins.
 * Walkers still want Beats to clear the kicks, or “give me a license.”
 * I will not clear it. As recorded. Still for sale.
 * Not tune. Not a label. Not norm.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:rights-listing-ids` is the client rights set.
 * Cookie `iss-rights-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write tune, stems, bpm, loop, norm, master, copy, claim,
 * license, clear, youtube, folder, film, look, ask, hands, van, firm,
 * packed, sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp does not
 * clear. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const RIGHTS_STORAGE_KEY = "iss:rights-listing-ids";
export const RIGHTS_COOKIE_NAME = "iss-rights-listing-ids";
export const RIGHTS_CHANGED_EVENT = "iss:rights-changed";

export const RIGHTS_REFUSE_COPY = "That one does not take a rights note.";
export const RIGHTS_TABLE_LINE = "I will not clear it.";
export const RIGHTS_STAYS_LINE = "As recorded.";
export const RIGHTS_NOTICE_TITLE =
  "I will not clear it. As recorded. Still for sale.";
export const RIGHTS_WALK_LINE =
  "Walkers still want Beats to clear the kicks, or give me a license.";
export const RIGHTS_STILL_LINE =
  "Still tote. Not tune. Not a label. Not norm.";
export const RIGHTS_TOTE_LINE = "Add to tote still works.";
export const RIGHTS_EMPTY_LINE = "Nobody taped a rights note yet.";

const SERVER_STORE = Symbol.for("iss.rights-listing-ids");

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

export function parseRightsListingIds(
  raw: string | null | undefined,
): string[] {
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

export function rightsCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const RIGHTS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${RIGHTS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(RIGHTS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(RIGHTS_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${RIGHTS_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseRightsListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readRightsListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(RIGHTS_STORAGE_KEY);
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
          window.localStorage.setItem(RIGHTS_STORAGE_KEY, JSON.stringify(ids));
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

export function writeRightsListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = rightsCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(RIGHTS_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${RIGHTS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(RIGHTS_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingRightsOverlay(
  listingId: string,
  listingIds: readonly string[] = readRightsListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeRights(listing: Listing | undefined): listing is Listing {
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

export type RightsWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type RightsWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: RightsWriteReason; listingIds: string[] };

function refuseRights(
  listing: Listing | undefined,
  listingIds: string[],
): RightsWriteResult | null {
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

export function markListingRights(
  listing: Listing | undefined,
  listingIds: string[],
): RightsWriteResult {
  const refused = refuseRights(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingRights(
  listing: Listing | undefined,
  listingIds: string[],
): RightsWriteResult {
  const refused = refuseRights(listing, listingIds);
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

export function subscribeRights(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === RIGHTS_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(RIGHTS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RIGHTS_CHANGED_EVENT, listener);
  };
}
