/**
 * I will not singe it — the windbreaker stays a jacket with a hole.
 * Still tote.
 *
 * Notch is clip-the-pits. Nap is raise-the-pile. Cream is cobbler-cream.
 * Bartack is bar-the-stress. Pink is zig-the-pits. Pleat is the front fold.
 * Walkers still want Closet to singe it, or “burn the pills so mint-green
 * reads shop-new without a shop nap.” I will not singe it. Still a jacket.
 * Still a hole. Still for sale. Not notch. Not nap. Not a shop. Not cream.
 * Not bartack. Not pink. Not pleat. Not steam. Not teasel. Not dye.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:singe-listing-ids` is the client singe set.
 * Cookie `iss-singe-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write notch, nap, cream, bartack, pink, pleat, steam, teasel,
 * dye, gift, buy, digital eligibility, or tote keys.
 * Host is `clo-windbreaker` only. Sneakers, mug, chair, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SINGE_STORAGE_KEY = "iss:singe-listing-ids";
export const SINGE_COOKIE_NAME = "iss-singe-listing-ids";
export const SINGE_CHANGED_EVENT = "iss:singe-changed";

export const SINGE_HOST_ID = "clo-windbreaker";
export const SINGE_SNEAKER_ID = "clo-split-soles";
export const SINGE_MUG_ID = "kdr-chipped-mug";
export const SINGE_CHAIR_ID = "ysk-folding-chair";
export const SINGE_ZINE_ID = "dl-stain-zine";
export const SINGE_GIFT_ID = "dl-mall-gift-card";
export const SINGE_RECIPES_ID = "dl-drawer-recipes";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const SINGE_OWNED_IDS = [
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
  "dl-crate-side-a",
] as const;

export const SINGE_REFUSE_COPY = "That one does not take a singe note.";
export const SINGE_TABLE_LINE = "I will not singe it.";
export const SINGE_JACKET_LINE = "Still a jacket.";
export const SINGE_HOLE_LINE = "Still a hole.";
export const SINGE_NOTICE_TITLE =
  "I will not singe it. Still a jacket. Still a hole.";
export const SINGE_WALK_LINE =
  "Walkers still want Closet to singe it, or burn the pills so mint-green reads shop-new without a shop nap.";
export const SINGE_STAYS_LINE =
  "This is the singe note. I will not singe it. Still a jacket. Still a hole.";
export const SINGE_STILL_LINE =
  "Still tote. Not notch. Not nap. Not a shop. Not cream.";
export const SINGE_TOTE_LINE = "Add to tote still works.";
export const SINGE_EMPTY_LINE = "Nobody taped a singe note yet.";
export const SINGE_LEAVE_LINE = "Leave the pills";

const SERVER_STORE = Symbol.for("iss.singe-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(SINGE_OWNED_IDS);

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

export function parseSingeListingIds(
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

export function singeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SINGE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SINGE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SINGE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SINGE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SINGE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSingeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSingeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SINGE_STORAGE_KEY);
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
          window.localStorage.setItem(SINGE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSingeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = singeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SINGE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SINGE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SINGE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSingeOverlay(
  listingId: string,
  listingIds: readonly string[] = readSingeListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isSneakerListing(listing: Listing) {
  return listing.id === SINGE_SNEAKER_ID;
}

function isMugListing(listing: Listing) {
  return listing.id === SINGE_MUG_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === SINGE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host jacket only. Sneakers, mug, chair, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeSinge(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== SINGE_HOST_ID) {
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

export type SingeWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "sneakers"
  | "mug"
  | "chair"
  | "owned";

function refuseSinge(
  listing: Listing | undefined,
): SingeWriteReason | null {
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
  if (isMugListing(listing)) {
    return "mug";
  }
  if (isOwnedListing(listing) || listing.id !== SINGE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingSinge(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSinge(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingSinge(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSinge(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeSinge(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SINGE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SINGE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SINGE_CHANGED_EVENT, listener);
  };
}
