/**
 * I will not fizeau it — the lid stays a lid. Still no pot.
 *
 * Fringe is read-shop-light-bands. Frost is flake-the-face.
 * Prussian is blue-the-face. Wedge is set-the-rise. Sine is
 * set-the-plate. Wring is wring-the-blocks. Blanchard is
 * rotary-grind-the-lid. Dress is dress-the-stone. Flycut is
 * skim-the-glass. Snug is finger-tight-the-knob. Countersink
 * is cut-the-cone. Spotface is machine-a-flat. Walkers still
 * want Sink Drawer to fizeau it, or “read shop Fizeau bands
 * so the lid proves flat without a shop fringe.” I will not
 * fizeau it. Still a lid. Still no pot. Still for sale. Not
 * fringe. Not frost. Not a shop. Not countersink.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:fizeau-listing-ids` is the client set.
 * Cookie `iss-fizeau-listing-ids` is the same JSON so PDPs SSR
 * the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write fringe, frost, prussian, wedge, sine, wring,
 * blanchard, dress, flycut, snug, countersink, spotface, trepan,
 * lap, tap, knurl, stake, indicator, vblock, wiggler, heightgage,
 * layout, dykem, surfaceplate, angleplate, edgefinder, dowel,
 * keyway, spline, clinometer, parallel, compound, incline, rotary,
 * cupwheel, surfacegrind, granite, joblock, interferometer,
 * sinebar, angleblock, jo, newton, airgage, softjaw, spotting,
 * flaking, bluing, lightband, monochrome, opticalflat, helium,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-lid-no-pot` only. Mug, whisk, recipes, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const FIZEAU_STORAGE_KEY = "iss:fizeau-listing-ids";
export const FIZEAU_COOKIE_NAME = "iss-fizeau-listing-ids";
export const FIZEAU_CHANGED_EVENT = "iss:fizeau-changed";

export const FIZEAU_HOST_ID = "kdr-lid-no-pot";
export const FIZEAU_MUG_ID = "kdr-chipped-mug";
export const FIZEAU_WHISK_ID = "kdr-bent-whisk";
export const FIZEAU_RECIPES_ID = "dl-drawer-recipes";
export const FIZEAU_CHAIR_ID = "ysk-folding-chair";
export const FIZEAU_GIFT_ID = "dl-mall-gift-card";
export const FIZEAU_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const FIZEAU_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "mdb-scratched-lp",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-camera-luts",
  "dl-drawer-recipes",
] as const;

const ownedSet = new Set<string>(FIZEAU_OWNED_IDS);

export const FIZEAU_REFUSE_COPY = "That one does not take a fizeau note.";
export const FIZEAU_TABLE_LINE = "I will not fizeau it.";
export const FIZEAU_LID_LINE = "Still a lid.";
export const FIZEAU_POT_LINE = "Still no pot.";
export const FIZEAU_NOTICE_TITLE =
  "I will not fizeau it. Still a lid. Still no pot.";
export const FIZEAU_WALK_LINE =
  "Walkers still want Sink Drawer to fizeau it, or read shop Fizeau bands so the lid proves flat without a shop fringe.";
export const FIZEAU_STAYS_LINE =
  "This is the fizeau note. I will not fizeau it. Still a lid. Still no pot.";
export const FIZEAU_STILL_LINE =
  "Still tote. Not fringe. Not frost. Not a shop. Not countersink.";
export const FIZEAU_TOTE_LINE = "Add to tote still works.";
export const FIZEAU_EMPTY_LINE = "Nobody taped a fizeau note yet.";
export const FIZEAU_LEAVE_LINE = "Leave the fizeau";

const SERVER_STORE = Symbol.for("iss.fizeau-listing-ids");

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

export function parseFizeauListingIds(
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

export function fizeauCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const FIZEAU_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${FIZEAU_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(FIZEAU_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(FIZEAU_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${FIZEAU_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseFizeauListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readFizeauListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(FIZEAU_STORAGE_KEY);
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
          window.localStorage.setItem(FIZEAU_STORAGE_KEY, JSON.stringify(ids));
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

export function writeFizeauListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = fizeauCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(FIZEAU_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${FIZEAU_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(FIZEAU_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingFizeauOverlay(
  listingId: string,
  listingIds: readonly string[] = readFizeauListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMugListing(listing: Listing) {
  return listing.id === FIZEAU_MUG_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === FIZEAU_WHISK_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === FIZEAU_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host lid only. Mug, whisk, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeFizeau(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== FIZEAU_HOST_ID) {
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

export type FizeauWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mug"
  | "whisk"
  | "chair"
  | "owned";

function refuseFizeau(
  listing: Listing | undefined,
): FizeauWriteReason | null {
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
  if (!isPhysicalListing(listing)) {
    return "digital";
  }
  if (isMugListing(listing)) {
    return "mug";
  }
  if (isWhiskListing(listing)) {
    return "whisk";
  }
  if (isOwnedListing(listing) || listing.id !== FIZEAU_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingFizeau(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFizeau(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingFizeau(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFizeau(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeFizeau(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === FIZEAU_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(FIZEAU_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FIZEAU_CHANGED_EVENT, listener);
  };
}
