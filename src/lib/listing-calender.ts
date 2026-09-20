/**
 * I will not calender it — the windbreaker stays mint-green.
 * Still smells like a car. Still tote.
 *
 * Singe is burn-the-pills. Nap is raise-the-pile. Notch is
 * cut-the-pit. Darn is close-the-hole. Walkers still want Closet
 * to calender it, or “hot-roll the nylon so the mint-green reads
 * shop-flat without a shop singe.” I will not calender it. Still
 * mint-green. Still smells like a car. Still for sale. Not singe.
 * Not nap. Not a shop. Not notch.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:calender-listing-ids` is the client calender set.
 * Cookie `iss-calender-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write singe, nap, notch, darn, cream, steam, teasel,
 * hotroll, gift, buy, digital eligibility, or tote keys.
 * Host is `clo-windbreaker` only. Sneakers, chair, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const CALENDER_STORAGE_KEY = "iss:calender-listing-ids";
export const CALENDER_COOKIE_NAME = "iss-calender-listing-ids";
export const CALENDER_CHANGED_EVENT = "iss:calender-changed";

export const CALENDER_HOST_ID = "clo-windbreaker";
export const CALENDER_SNEAKER_ID = "clo-split-soles";
export const CALENDER_CHAIR_ID = "ysk-folding-chair";
export const CALENDER_ZINE_ID = "dl-stain-zine";
export const CALENDER_GIFT_ID = "dl-mall-gift-card";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const CALENDER_OWNED_IDS = [
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
  "dl-camera-luts",
  "mdb-scratched-lp",
] as const;

const ownedSet = new Set<string>(CALENDER_OWNED_IDS);

export const CALENDER_REFUSE_COPY = "That one does not take a calender note.";
export const CALENDER_TABLE_LINE = "I will not calender it.";
export const CALENDER_MINT_LINE = "Still mint-green.";
export const CALENDER_CAR_LINE = "Still smells like a car.";
export const CALENDER_NOTICE_TITLE =
  "I will not calender it. Still mint-green. Still smells like a car.";
export const CALENDER_WALK_LINE =
  "Walkers still want Closet to calender it, or hot-roll the nylon so the mint-green reads shop-flat without a shop singe.";
export const CALENDER_STAYS_LINE =
  "This is the calender note. I will not calender it. Still mint-green. Still smells like a car.";
export const CALENDER_STILL_LINE =
  "Still tote. Not singe. Not nap. Not a shop. Not notch.";
export const CALENDER_TOTE_LINE = "Add to tote still works.";
export const CALENDER_EMPTY_LINE = "Nobody taped a calender note yet.";
export const CALENDER_LEAVE_LINE = "Leave the nylon";

const SERVER_STORE = Symbol.for("iss.calender-listing-ids");

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

export function parseCalenderListingIds(
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

export function calenderCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const CALENDER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CALENDER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(CALENDER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(CALENDER_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CALENDER_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseCalenderListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readCalenderListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(CALENDER_STORAGE_KEY);
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
          window.localStorage.setItem(CALENDER_STORAGE_KEY, JSON.stringify(ids));
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

export function writeCalenderListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = calenderCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CALENDER_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${CALENDER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(CALENDER_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingCalenderOverlay(
  listingId: string,
  listingIds: readonly string[] = readCalenderListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isSneakerListing(listing: Listing) {
  return listing.id === CALENDER_SNEAKER_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === CALENDER_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host jacket only. Sneakers, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeCalender(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== CALENDER_HOST_ID) {
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

export type CalenderWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "sneakers"
  | "chair"
  | "owned";

function refuseCalender(
  listing: Listing | undefined,
): CalenderWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== CALENDER_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingCalender(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCalender(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingCalender(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCalender(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeCalender(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CALENDER_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CALENDER_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CALENDER_CHANGED_EVENT, listener);
  };
}
