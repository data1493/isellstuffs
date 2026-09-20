/**
 * I will not knockout them — the recipe scans stay three cards. Still
 * grease. Still tote.
 *
 * Gang is step-the-cards. Despeckle is heal-the-flecks. Descreen is
 * pull-the-dots. Crop is trim-the-scans. Walkers still want Sink
 * Drawer to knockout them, or knock out the grease so the cards
 * read shop-clean without a shop gang. I will not knockout them.
 * Still three cards. Still grease. Still for sale. Not gang. Not
 * despeckle. Not a shop. Not descreen. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:knockout-listing-ids` is the client knockout set.
 * Cookie `iss-knockout-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write gang, despeckle, descreen, crop, emboss, varnish,
 * overprint, sepr, knock, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-drawer-recipes` only. Liner, junk PDF, whisk, font,
 * gift, zine, physical, and listings already owned by another
 * overlay stay off. Fixture `sold` / `file-gone` rows stay as they are.
 * Knockout is knock out the grease, not a login. Register stays
 * print bars.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const KNOCKOUT_STORAGE_KEY = "iss:knockout-listing-ids";
export const KNOCKOUT_COOKIE_NAME = "iss-knockout-listing-ids";
export const KNOCKOUT_CHANGED_EVENT = "iss:knockout-changed";

export const KNOCKOUT_HOST_ID = "dl-drawer-recipes";
export const KNOCKOUT_LINER_ID = "dl-crate-side-a";
export const KNOCKOUT_PDF_ID = "dl-junk-pricing-pdf";
export const KNOCKOUT_WHISK_ID = "kdr-bent-whisk";
export const KNOCKOUT_FONT_ID = "dl-booth-font";
export const KNOCKOUT_GIFT_ID = "dl-mall-gift-card";
export const KNOCKOUT_ZINE_ID = "dl-stain-zine";
export const KNOCKOUT_CHAIR_ID = "ysk-folding-chair";
export const KNOCKOUT_BOY_ID = "gtk-game-boy";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const KNOCKOUT_OWNED_IDS = [
  KNOCKOUT_LINER_ID,
  KNOCKOUT_PDF_ID,
  KNOCKOUT_WHISK_ID,
  KNOCKOUT_FONT_ID,
  KNOCKOUT_BOY_ID,
  "dl-sample-pack",
  "dl-camera-luts",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "mdb-scratched-lp",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
] as const;

const ownedSet = new Set<string>(KNOCKOUT_OWNED_IDS);

export const KNOCKOUT_REFUSE_COPY = "That one does not take a knockout note.";
export const KNOCKOUT_TABLE_LINE = "I will not knockout them.";
export const KNOCKOUT_CARDS_LINE = "Still three cards.";
export const KNOCKOUT_GREASE_LINE = "Still grease.";
export const KNOCKOUT_NOTICE_TITLE =
  "I will not knockout them. Still three cards. Still grease.";
export const KNOCKOUT_WALK_LINE =
  "Walkers still want Sink Drawer to knockout them, or knock out the grease so the cards read shop-clean without a shop gang.";
export const KNOCKOUT_STAYS_LINE =
  "This is the knockout note. I will not knockout them. Still three cards. Still grease.";
export const KNOCKOUT_STILL_LINE =
  "Still tote. Not gang. Not despeckle. Not a shop. Not descreen. Not an account.";
export const KNOCKOUT_TOTE_LINE = "Add to tote still works.";
export const KNOCKOUT_EMPTY_LINE = "Nobody taped a knockout note yet.";
export const KNOCKOUT_LEAVE_LINE = "Leave the cards";

const SERVER_STORE = Symbol.for("iss.knockout-listing-ids");

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

export function parseKnockoutListingIds(
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

export function knockoutCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const KNOCKOUT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${KNOCKOUT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(KNOCKOUT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(KNOCKOUT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${KNOCKOUT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseKnockoutListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readKnockoutListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(KNOCKOUT_STORAGE_KEY);
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
          window.localStorage.setItem(KNOCKOUT_STORAGE_KEY, JSON.stringify(ids));
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

export function writeKnockoutListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = knockoutCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(KNOCKOUT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${KNOCKOUT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(KNOCKOUT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingKnockoutOverlay(
  listingId: string,
  listingIds: readonly string[] = readKnockoutListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLinerListing(listing: Listing) {
  return listing.id === KNOCKOUT_LINER_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === KNOCKOUT_PDF_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === KNOCKOUT_WHISK_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === KNOCKOUT_FONT_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === KNOCKOUT_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host recipe scans only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeKnockout(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== KNOCKOUT_HOST_ID) {
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

export type KnockoutWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "liner"
  | "pdf"
  | "whisk"
  | "font"
  | "chair"
  | "owned";

function refuseKnockout(
  listing: Listing | undefined,
): KnockoutWriteReason | null {
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
  if (isChairListing(listing)) {
    return "chair";
  }
  if (isWhiskListing(listing)) {
    return "whisk";
  }
  if (!isDigitalListing(listing)) {
    return "physical";
  }
  if (isLinerListing(listing)) {
    return "liner";
  }
  if (isPdfListing(listing)) {
    return "pdf";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (isOwnedListing(listing) || listing.id !== KNOCKOUT_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingKnockout(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseKnockout(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingKnockout(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseKnockout(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeKnockout(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === KNOCKOUT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(KNOCKOUT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(KNOCKOUT_CHANGED_EVENT, listener);
  };
}
