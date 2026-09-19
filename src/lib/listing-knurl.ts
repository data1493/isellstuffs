/**
 * I will not knurl it — the lid stays loose. Still a lid. Still tote.
 *
 * Knob is the wiggle. Glass is the pane. Vent is no steam hole.
 * Walkers still want Sink Drawer to knurl the knob, or “make it
 * grip.” I will not knurl it. Still loose. Still a lid. Still for
 * sale. Not knob. Not glass. Not vent.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:knurl-listing-ids` is the client knurl set.
 * Cookie `iss-knurl-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write knob, glass, vent, fits, gasket, saucepan, anneal,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-lid-no-pot` only. Mug, recipes, whisk, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const KNURL_STORAGE_KEY = "iss:knurl-listing-ids";
export const KNURL_COOKIE_NAME = "iss-knurl-listing-ids";
export const KNURL_CHANGED_EVENT = "iss:knurl-changed";

export const KNURL_HOST_ID = "kdr-lid-no-pot";
export const KNURL_MUG_ID = "kdr-chipped-mug";
export const KNURL_WHISK_ID = "kdr-bent-whisk";
export const KNURL_RECIPES_ID = "dl-drawer-recipes";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const KNURL_OWNED_IDS = [
  KNURL_MUG_ID,
  KNURL_WHISK_ID,
  KNURL_RECIPES_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "dl-booth-font",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-camera-luts",
] as const;

const ownedSet = new Set<string>(KNURL_OWNED_IDS);

export const KNURL_REFUSE_COPY = "That one does not take a knurl note.";
export const KNURL_TABLE_LINE = "I will not knurl it.";
export const KNURL_LOOSE_LINE = "Still loose.";
export const KNURL_LID_LINE = "Still a lid.";
export const KNURL_NOTICE_TITLE =
  "I will not knurl it. Still loose. Still a lid.";
export const KNURL_WALK_LINE =
  "Walkers still want Sink Drawer to knurl the knob, or make it grip.";
export const KNURL_STAYS_LINE =
  "This is the knurl note. I will not knurl it. Still loose. Still a lid.";
export const KNURL_STILL_LINE = "Still tote. Not knob. Not glass. Not vent.";
export const KNURL_TOTE_LINE = "Add to tote still works.";
export const KNURL_EMPTY_LINE = "Nobody taped a knurl note yet.";
export const KNURL_LEAVE_LINE = "Leave the lid";

const SERVER_STORE = Symbol.for("iss.knurl-listing-ids");

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

export function parseKnurlListingIds(
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

export function knurlCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const KNURL_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${KNURL_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(KNURL_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(KNURL_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${KNURL_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseKnurlListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readKnurlListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(KNURL_STORAGE_KEY);
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
          window.localStorage.setItem(KNURL_STORAGE_KEY, JSON.stringify(ids));
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

export function writeKnurlListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = knurlCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(KNURL_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${KNURL_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(KNURL_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingKnurlOverlay(
  listingId: string,
  listingIds: readonly string[] = readKnurlListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMugListing(listing: Listing) {
  return listing.id === KNURL_MUG_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === KNURL_WHISK_ID;
}

function isRecipesListing(listing: Listing) {
  return listing.id === KNURL_RECIPES_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host lid only. Mug, whisk, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeKnurl(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== KNURL_HOST_ID) {
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

export type KnurlWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mug"
  | "recipes"
  | "whisk"
  | "owned";

function refuseKnurl(listing: Listing | undefined): KnurlWriteReason | null {
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
  if (isRecipesListing(listing)) {
    return "recipes";
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
  if (isOwnedListing(listing) || listing.id !== KNURL_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingKnurl(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseKnurl(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingKnurl(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseKnurl(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeKnurl(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === KNURL_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(KNURL_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(KNURL_CHANGED_EVENT, listener);
  };
}
