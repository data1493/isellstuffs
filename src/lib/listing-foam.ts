/**
 * I will not foam them — the jewels stay a pile. Still tote.
 *
 * Cases is empty jewels. Hinge is the snapped one. Inside is no
 * titles. Fill is put-a-movie-in. Nest is seat the stack. Walkers
 * still want Sunday Crate to foam the stack, or “pad them so they
 * ride in the Civic.” I will not foam them. Still a pile. Still
 * empty. Still for sale. Not nest. Not fill. Not a shop. Not cases.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:foam-listing-ids` is the client foam set.
 * Cookie `iss-foam-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write cases, hinge, inside, nest, fill, sort, gum, wrap,
 * slipmat, lathe, handle, gift, buy, digital eligibility, or tote keys.
 * Host is `mdb-jewel-stack` only. LP, mixtape, CD-R, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const FOAM_STORAGE_KEY = "iss:foam-listing-ids";
export const FOAM_COOKIE_NAME = "iss-foam-listing-ids";
export const FOAM_CHANGED_EVENT = "iss:foam-changed";

export const FOAM_HOST_ID = "mdb-jewel-stack";
export const FOAM_LP_ID = "mdb-scratched-lp";
export const FOAM_MIXTAPE_ID = "mdb-mixtape-93";
export const FOAM_CDR_ID = "ysk-burned-cdr";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const FOAM_OWNED_IDS = [
  FOAM_LP_ID,
  FOAM_MIXTAPE_ID,
  FOAM_CDR_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "dl-booth-font",
  "dl-sample-pack",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "dl-junk-pricing-pdf",
] as const;

const ownedSet = new Set<string>(FOAM_OWNED_IDS);

export const FOAM_REFUSE_COPY = "That one does not take a foam note.";
export const FOAM_TABLE_LINE = "I will not foam them.";
export const FOAM_PILE_LINE = "Still a pile.";
export const FOAM_EMPTY_CASES_LINE = "Still empty.";
export const FOAM_NOTICE_TITLE =
  "I will not foam them. Still a pile. Still empty.";
export const FOAM_WALK_LINE =
  "Walkers still want Sunday Crate to foam the stack, or pad them so they ride in the Civic.";
export const FOAM_STAYS_LINE =
  "This is the foam note. I will not foam them. Still a pile. Still empty.";
export const FOAM_STILL_LINE =
  "Still tote. Not nest. Not fill. Not a shop. Not cases.";
export const FOAM_TOTE_LINE = "Add to tote still works.";
export const FOAM_EMPTY_LINE = "Nobody taped a foam note yet.";
export const FOAM_LEAVE_LINE = "Leave the pile";

const SERVER_STORE = Symbol.for("iss.foam-listing-ids");

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

export function parseFoamListingIds(
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

export function foamCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const FOAM_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${FOAM_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(FOAM_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(FOAM_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${FOAM_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseFoamListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readFoamListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(FOAM_STORAGE_KEY);
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
          window.localStorage.setItem(FOAM_STORAGE_KEY, JSON.stringify(ids));
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

export function writeFoamListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = foamCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(FOAM_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${FOAM_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(FOAM_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingFoamOverlay(
  listingId: string,
  listingIds: readonly string[] = readFoamListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLpListing(listing: Listing) {
  return listing.id === FOAM_LP_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host jewel stack only. LP, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeFoam(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== FOAM_HOST_ID) {
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

export type FoamWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lp"
  | "owned";

function refuseFoam(listing: Listing | undefined): FoamWriteReason | null {
  if (!listing) {
    return "missing";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isPhysicalListing(listing)) {
    return "digital";
  }
  if (isLpListing(listing)) {
    return "lp";
  }
  if (isOwnedListing(listing) || listing.id !== FOAM_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingFoam(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFoam(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingFoam(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFoam(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeFoam(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === FOAM_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(FOAM_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FOAM_CHANGED_EVENT, listener);
  };
}
