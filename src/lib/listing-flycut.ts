/**
 * I will not flycut it — the lid stays a lid. Still no pot.
 *
 * Snug is finger-tight-the-knob. Countersink is cut-the-cone.
 * Spotface is machine-a-flat. Trepan is cut-the-annulus. Walkers
 * still want Sink Drawer to flycut it, or “skim the glass so the
 * lid seats shop-flat without a shop spotface.” I will not flycut
 * it. Still a lid. Still no pot. Still for sale. Not snug. Not
 * countersink. Not a shop. Not spotface.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:flycut-listing-ids` is the client flycut set.
 * Cookie `iss-flycut-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write snug, countersink, spotface, trepan, lap, tap, fly,
 * facemill, skimplan, gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-lid-no-pot` only. Mug, whisk, recipes, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const FLYCUT_STORAGE_KEY = "iss:flycut-listing-ids";
export const FLYCUT_COOKIE_NAME = "iss-flycut-listing-ids";
export const FLYCUT_CHANGED_EVENT = "iss:flycut-changed";

export const FLYCUT_HOST_ID = "kdr-lid-no-pot";
export const FLYCUT_MUG_ID = "kdr-chipped-mug";
export const FLYCUT_WHISK_ID = "kdr-bent-whisk";
export const FLYCUT_RECIPES_ID = "dl-drawer-recipes";
export const FLYCUT_CHAIR_ID = "ysk-folding-chair";
export const FLYCUT_GIFT_ID = "dl-mall-gift-card";
export const FLYCUT_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const FLYCUT_OWNED_IDS = [
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

const ownedSet = new Set<string>(FLYCUT_OWNED_IDS);

export const FLYCUT_REFUSE_COPY = "That one does not take a flycut note.";
export const FLYCUT_TABLE_LINE = "I will not flycut it.";
export const FLYCUT_LID_LINE = "Still a lid.";
export const FLYCUT_POT_LINE = "Still no pot.";
export const FLYCUT_NOTICE_TITLE =
  "I will not flycut it. Still a lid. Still no pot.";
export const FLYCUT_WALK_LINE =
  "Walkers still want Sink Drawer to flycut it, or skim the glass so the lid seats shop-flat without a shop spotface.";
export const FLYCUT_STAYS_LINE =
  "This is the flycut note. I will not flycut it. Still a lid. Still no pot.";
export const FLYCUT_STILL_LINE =
  "Still tote. Not snug. Not countersink. Not a shop. Not spotface.";
export const FLYCUT_TOTE_LINE = "Add to tote still works.";
export const FLYCUT_EMPTY_LINE = "Nobody taped a flycut note yet.";
export const FLYCUT_LEAVE_LINE = "Leave the glass";

const SERVER_STORE = Symbol.for("iss.flycut-listing-ids");

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

export function parseFlycutListingIds(
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

export function flycutCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const FLYCUT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${FLYCUT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(FLYCUT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(FLYCUT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${FLYCUT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseFlycutListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readFlycutListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(FLYCUT_STORAGE_KEY);
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
          window.localStorage.setItem(FLYCUT_STORAGE_KEY, JSON.stringify(ids));
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

export function writeFlycutListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = flycutCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(FLYCUT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${FLYCUT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(FLYCUT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingFlycutOverlay(
  listingId: string,
  listingIds: readonly string[] = readFlycutListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMugListing(listing: Listing) {
  return listing.id === FLYCUT_MUG_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === FLYCUT_WHISK_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === FLYCUT_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host lid only. Mug, whisk, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeFlycut(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== FLYCUT_HOST_ID) {
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

export type FlycutWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mug"
  | "whisk"
  | "chair"
  | "owned";

function refuseFlycut(
  listing: Listing | undefined,
): FlycutWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== FLYCUT_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingFlycut(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFlycut(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingFlycut(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFlycut(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeFlycut(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === FLYCUT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(FLYCUT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FLYCUT_CHANGED_EVENT, listener);
  };
}
