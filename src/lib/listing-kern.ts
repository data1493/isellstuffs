/**
 * I will not kern it — still two weights. Still a map. Still tote.
 *
 * Ligature is join-the-fi. Subset is webfont-cut. Variable is
 * one-file. Hint is hinted-OTF. Outline is convert-to-paths.
 * Walkers still want Beats to kern the food-court map, or “pair
 * the letters so the directory sits tight.” I will not kern it.
 * Still two weights. Still a map. Still for sale. Not ligature.
 * Not subset. Not a shop. Not variable. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:kern-listing-ids` is the client kern set.
 * Cookie `iss-kern-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write ligature, subset, variable, hint, outline, foundry,
 * slant, bold, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-booth-font` only. Pack, LUT, gift, zine, physical,
 * recipes, junk PDF, and listings already owned by another overlay
 * stay off. Fixture `sold` / `file-gone` rows stay as they are.
 * Kern is pairing, not a login. No auth.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const KERN_STORAGE_KEY = "iss:kern-listing-ids";
export const KERN_COOKIE_NAME = "iss-kern-listing-ids";
export const KERN_CHANGED_EVENT = "iss:kern-changed";

export const KERN_HOST_ID = "dl-booth-font";
export const KERN_PACK_ID = "dl-sample-pack";
export const KERN_LUT_ID = "dl-camera-luts";
export const KERN_ZINE_ID = "dl-stain-zine";
export const KERN_PDF_ID = "dl-junk-pricing-pdf";
export const KERN_RECIPES_ID = "dl-drawer-recipes";
export const KERN_GIFT_ID = "dl-mall-gift-card";
export const KERN_CHAIR_ID = "ysk-folding-chair";
export const KERN_JACKET_ID = "clo-windbreaker";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const KERN_OWNED_IDS = [
  KERN_PACK_ID,
  KERN_LUT_ID,
  KERN_ZINE_ID,
  KERN_PDF_ID,
  KERN_RECIPES_ID,
  "dl-crate-side-a",
  "gtk-game-boy",
  KERN_JACKET_ID,
  "clo-split-soles",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "gtk-cable-drawer",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "ysk-burned-cdr",
  "kdr-chipped-mug",
] as const;

const ownedSet = new Set<string>(KERN_OWNED_IDS);

export const KERN_REFUSE_COPY = "That one does not take a kern note.";
export const KERN_TABLE_LINE = "I will not kern it.";
export const KERN_WEIGHTS_LINE = "Still two weights.";
export const KERN_MAP_LINE = "Still a map.";
export const KERN_NOTICE_TITLE =
  "I will not kern it. Still two weights. Still a map.";
export const KERN_WALK_LINE =
  "Walkers still want Beats to kern the food-court map, or pair the letters so the directory sits tight.";
export const KERN_STAYS_LINE =
  "This is the kern note. I will not kern it. Still two weights. Still a map.";
export const KERN_STILL_LINE =
  "Still tote. Not ligature. Not subset. Not a shop. Not variable. Not an account.";
export const KERN_TOTE_LINE = "Add to tote still works.";
export const KERN_EMPTY_LINE = "Nobody taped a kern note yet.";
export const KERN_LEAVE_LINE = "Leave the pairs";

const SERVER_STORE = Symbol.for("iss.kern-listing-ids");

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

export function parseKernListingIds(
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

export function kernCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const KERN_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${KERN_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(KERN_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(KERN_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${KERN_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseKernListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readKernListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(KERN_STORAGE_KEY);
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
          window.localStorage.setItem(KERN_STORAGE_KEY, JSON.stringify(ids));
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

export function writeKernListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = kernCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(KERN_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${KERN_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(KERN_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingKernOverlay(
  listingId: string,
  listingIds: readonly string[] = readKernListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === KERN_PACK_ID;
}

function isLutListing(listing: Listing) {
  return listing.id === KERN_LUT_ID;
}

function isZineListing(listing: Listing) {
  return listing.id === KERN_ZINE_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === KERN_PDF_ID;
}

function isRecipesListing(listing: Listing) {
  return listing.id === KERN_RECIPES_ID;
}

function isJacketListing(listing: Listing) {
  return listing.id === KERN_JACKET_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host booth font only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeKern(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== KERN_HOST_ID) {
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

export type KernWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "lut"
  | "zine"
  | "pdf"
  | "recipes"
  | "jacket"
  | "owned";

function refuseKern(
  listing: Listing | undefined,
): KernWriteReason | null {
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
  if (!isDigitalListing(listing)) {
    return isJacketListing(listing) ? "jacket" : "physical";
  }
  if (isPackListing(listing)) {
    return "pack";
  }
  if (isLutListing(listing)) {
    return "lut";
  }
  if (isZineListing(listing)) {
    return "zine";
  }
  if (isPdfListing(listing)) {
    return "pdf";
  }
  if (isRecipesListing(listing)) {
    return "recipes";
  }
  if (isOwnedListing(listing) || listing.id !== KERN_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingKern(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseKern(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingKern(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseKern(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeKern(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === KERN_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(KERN_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(KERN_CHANGED_EVENT, listener);
  };
}
