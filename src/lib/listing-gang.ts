/**
 * I will not gang them — the recipe scans stay three cards. Still
 * grease. Still tote.
 *
 * Crop is trim-the-scans. Emboss is raise-the-cover. Varnish is
 * coat-the-junk. Mat is board-the-page. Walkers still want Sink
 * Drawer to gang them, or step the three cards onto one shop sheet
 * so the grease proofs without a shop crop. I will not gang them.
 * Still three cards. Still grease. Still for sale. Not crop. Not
 * emboss. Not a shop. Not varnish. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:gang-listing-ids` is the client gang set.
 * Cookie `iss-gang-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write crop, emboss, varnish, mat, galley, impose, slug,
 * forme, register, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-drawer-recipes` only. Liner, junk PDF, Game Boy, font,
 * gift, zine, physical, and listings already owned by another
 * overlay stay off. Fixture `sold` / `file-gone` rows stay as they are.
 * Gang is print imposition of three cards, not a login. Register
 * stays print bars.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const GANG_STORAGE_KEY = "iss:gang-listing-ids";
export const GANG_COOKIE_NAME = "iss-gang-listing-ids";
export const GANG_CHANGED_EVENT = "iss:gang-changed";

export const GANG_HOST_ID = "dl-drawer-recipes";
export const GANG_LINER_ID = "dl-crate-side-a";
export const GANG_PDF_ID = "dl-junk-pricing-pdf";
export const GANG_BOY_ID = "gtk-game-boy";
export const GANG_FONT_ID = "dl-booth-font";
export const GANG_GIFT_ID = "dl-mall-gift-card";
export const GANG_ZINE_ID = "dl-stain-zine";
export const GANG_CHAIR_ID = "ysk-folding-chair";
export const GANG_WHISK_ID = "kdr-bent-whisk";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const GANG_OWNED_IDS = [
  GANG_LINER_ID,
  GANG_PDF_ID,
  GANG_BOY_ID,
  GANG_FONT_ID,
  GANG_WHISK_ID,
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

const ownedSet = new Set<string>(GANG_OWNED_IDS);

export const GANG_REFUSE_COPY = "That one does not take a gang note.";
export const GANG_TABLE_LINE = "I will not gang them.";
export const GANG_CARDS_LINE = "Still three cards.";
export const GANG_GREASE_LINE = "Still grease.";
export const GANG_NOTICE_TITLE =
  "I will not gang them. Still three cards. Still grease.";
export const GANG_WALK_LINE =
  "Walkers still want Sink Drawer to gang them, or step the three cards onto one shop sheet so the grease proofs without a shop crop.";
export const GANG_STAYS_LINE =
  "This is the gang note. I will not gang them. Still three cards. Still grease.";
export const GANG_STILL_LINE =
  "Still tote. Not crop. Not emboss. Not a shop. Not varnish. Not an account.";
export const GANG_TOTE_LINE = "Add to tote still works.";
export const GANG_EMPTY_LINE = "Nobody taped a gang note yet.";
export const GANG_LEAVE_LINE = "Leave the cards";

const SERVER_STORE = Symbol.for("iss.gang-listing-ids");

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

export function parseGangListingIds(
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

export function gangCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GANG_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GANG_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GANG_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GANG_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GANG_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGangListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGangListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GANG_STORAGE_KEY);
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
          window.localStorage.setItem(GANG_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGangListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = gangCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GANG_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GANG_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GANG_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGangOverlay(
  listingId: string,
  listingIds: readonly string[] = readGangListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLinerListing(listing: Listing) {
  return listing.id === GANG_LINER_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === GANG_PDF_ID;
}

function isBoyListing(listing: Listing) {
  return listing.id === GANG_BOY_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === GANG_FONT_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === GANG_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host recipe scans only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeGang(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== GANG_HOST_ID) {
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

export type GangWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "liner"
  | "pdf"
  | "boy"
  | "font"
  | "chair"
  | "owned";

function refuseGang(
  listing: Listing | undefined,
): GangWriteReason | null {
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
  if (isBoyListing(listing)) {
    return "boy";
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
  if (isOwnedListing(listing) || listing.id !== GANG_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingGang(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGang(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingGang(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGang(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeGang(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GANG_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GANG_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GANG_CHANGED_EVENT, listener);
  };
}
