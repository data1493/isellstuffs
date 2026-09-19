/**
 * I will not serge it — the windbreaker stays worn twice and a car.
 * Still tote.
 *
 * Sew is no hem. Dart is take-in. Cinch is the waist. Hood is the
 * cowl. Elastic is the cuff. Stitch is the split-sole pair, not
 * this jacket. Walkers still want Closet to serge the windbreaker,
 * or “overlock the raw edge so it doesn’t fray.” I will not serge
 * it. Still worn twice. Still a car. Still for sale. Not dart.
 * Not sew. Not cinch.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:serge-listing-ids` is the client serge set.
 * Cookie `iss-serge-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write dart, cinch, sew, hood, elastic, stitch, wash, cream,
 * thimble, pins, gift, buy, digital eligibility, or tote keys.
 * Host is `clo-windbreaker` only. Sneakers, lamp, chair, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SERGE_STORAGE_KEY = "iss:serge-listing-ids";
export const SERGE_COOKIE_NAME = "iss-serge-listing-ids";
export const SERGE_CHANGED_EVENT = "iss:serge-changed";

export const SERGE_HOST_ID = "clo-windbreaker";
export const SERGE_SNEAKER_ID = "clo-split-soles";
export const SERGE_LAMP_ID = "ysk-wobbly-lamp";
export const SERGE_CHAIR_ID = "ysk-folding-chair";
export const SERGE_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const SERGE_OWNED_IDS = [
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "dl-drawer-recipes",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "ysk-wobbly-lamp",
] as const;

export const SERGE_REFUSE_COPY = "That one does not take a serge note.";
export const SERGE_TABLE_LINE = "I will not serge it.";
export const SERGE_WORN_LINE = "Still worn twice.";
export const SERGE_CAR_LINE = "Still a car.";
export const SERGE_NOTICE_TITLE =
  "I will not serge it. Still worn twice. Still a car.";
export const SERGE_WALK_LINE =
  "Walkers still want Closet to serge the windbreaker, or overlock the raw edge so it doesn’t fray.";
export const SERGE_STAYS_LINE =
  "This is the serge note. I will not serge it. Still worn twice. Still a car.";
export const SERGE_STILL_LINE =
  "Still tote. Not dart. Not sew. Not a shop. Not cinch.";
export const SERGE_TOTE_LINE = "Add to tote still works.";
export const SERGE_EMPTY_LINE = "Nobody taped a serge note yet.";
export const SERGE_LEAVE_LINE = "Leave the raw edge";

const SERVER_STORE = Symbol.for("iss.serge-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(SERGE_OWNED_IDS);

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

export function parseSergeListingIds(
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

export function sergeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SERGE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SERGE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SERGE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SERGE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SERGE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSergeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSergeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SERGE_STORAGE_KEY);
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
          window.localStorage.setItem(SERGE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSergeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = sergeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SERGE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SERGE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SERGE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSergeOverlay(
  listingId: string,
  listingIds: readonly string[] = readSergeListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isSneakerListing(listing: Listing) {
  return listing.id === SERGE_SNEAKER_ID;
}

function isLampListing(listing: Listing) {
  return listing.id === SERGE_LAMP_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === SERGE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host jacket only. Sneakers, lamp, chair, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeSerge(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== SERGE_HOST_ID) {
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

export type SergeWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "sneakers"
  | "lamp"
  | "chair"
  | "owned";

function refuseSerge(
  listing: Listing | undefined,
): SergeWriteReason | null {
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
  if (isChairListing(listing)) {
    return "chair";
  }
  if (isSneakerListing(listing)) {
    return "sneakers";
  }
  if (isLampListing(listing)) {
    return "lamp";
  }
  if (isOwnedListing(listing) || listing.id !== SERGE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingSerge(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSerge(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingSerge(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSerge(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeSerge(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SERGE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SERGE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SERGE_CHANGED_EVENT, listener);
  };
}
