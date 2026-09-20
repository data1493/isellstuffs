/**
 * I will not varnish it — the junk PDF stays one page. Still a rule
 * of thumb. Still tote.
 *
 * Bleed is copy-shop-trim. Trap is print-trap. Preflight is
 * print-ready. Score is crease-the-one-pager (queued). Walkers
 * still want Tuesday to varnish it, or “coat the one-pager so the
 * junk rule looks shop-printed without a shop bleed.” I will not
 * varnish it. Still one page. Still a rule of thumb. Still for
 * sale. Not bleed. Not trap. Not a shop. Not preflight. Not an
 * account. Varnish is coat the one-pager, not a login.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:varnish-listing-ids` is the client varnish set.
 * Cookie `iss-varnish-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write bleed, trap, preflight, score, crop, lacquer, typeset,
 * emboss, uv, coat, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-junk-pricing-pdf` only. Recipes, font, lamp, gift,
 * zine, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const VARNISH_STORAGE_KEY = "iss:varnish-listing-ids";
export const VARNISH_COOKIE_NAME = "iss-varnish-listing-ids";
export const VARNISH_CHANGED_EVENT = "iss:varnish-changed";

export const VARNISH_HOST_ID = "dl-junk-pricing-pdf";
export const VARNISH_RECIPES_ID = "dl-drawer-recipes";
export const VARNISH_FONT_ID = "dl-booth-font";
export const VARNISH_LAMP_ID = "ysk-wobbly-lamp";
export const VARNISH_GIFT_ID = "dl-mall-gift-card";
export const VARNISH_ZINE_ID = "dl-stain-zine";
export const VARNISH_CHAIR_ID = "ysk-folding-chair";
export const VARNISH_LINER_ID = "dl-crate-side-a";
export const VARNISH_PACK_ID = "dl-sample-pack";
export const VARNISH_LUT_ID = "dl-camera-luts";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const VARNISH_OWNED_IDS = [
  VARNISH_RECIPES_ID,
  VARNISH_FONT_ID,
  VARNISH_LINER_ID,
  VARNISH_PACK_ID,
  VARNISH_LUT_ID,
  VARNISH_LAMP_ID,
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "ysk-burned-cdr",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "mdb-scratched-lp",
] as const;

const ownedSet = new Set<string>(VARNISH_OWNED_IDS);

export const VARNISH_REFUSE_COPY = "That one does not take a varnish note.";
export const VARNISH_TABLE_LINE = "I will not varnish it.";
export const VARNISH_PAGE_LINE = "Still one page.";
export const VARNISH_RULE_LINE = "Still a rule of thumb.";
export const VARNISH_NOTICE_TITLE =
  "I will not varnish it. Still one page. Still a rule of thumb.";
export const VARNISH_WALK_LINE =
  "Walkers still want Tuesday to varnish it, or coat the one-pager so the junk rule looks shop-printed without a shop bleed.";
export const VARNISH_STAYS_LINE =
  "This is the varnish note. I will not varnish it. Still one page. Still a rule of thumb.";
export const VARNISH_STILL_LINE =
  "Still tote. Not bleed. Not trap. Not a shop. Not preflight.";
export const VARNISH_TOTE_LINE = "Add to tote still works.";
export const VARNISH_EMPTY_LINE = "Nobody taped a varnish note yet.";
export const VARNISH_LEAVE_LINE = "Leave the one-pager";

const SERVER_STORE = Symbol.for("iss.varnish-listing-ids");

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

export function parseVarnishListingIds(
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

export function varnishCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const VARNISH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${VARNISH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(VARNISH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(VARNISH_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${VARNISH_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseVarnishListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readVarnishListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(VARNISH_STORAGE_KEY);
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
          window.localStorage.setItem(VARNISH_STORAGE_KEY, JSON.stringify(ids));
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

export function writeVarnishListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = varnishCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(VARNISH_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${VARNISH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(VARNISH_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingVarnishOverlay(
  listingId: string,
  listingIds: readonly string[] = readVarnishListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isRecipesListing(listing: Listing) {
  return listing.id === VARNISH_RECIPES_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === VARNISH_FONT_ID;
}

function isLampListing(listing: Listing) {
  return listing.id === VARNISH_LAMP_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === VARNISH_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host junk PDF only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeVarnish(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== VARNISH_HOST_ID) {
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

export type VarnishWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "recipes"
  | "font"
  | "lamp"
  | "chair"
  | "owned";

function refuseVarnish(
  listing: Listing | undefined,
): VarnishWriteReason | null {
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
  if (!isDigitalListing(listing)) {
    return isLampListing(listing) ? "lamp" : "physical";
  }
  if (isRecipesListing(listing)) {
    return "recipes";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (isOwnedListing(listing) || listing.id !== VARNISH_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingVarnish(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseVarnish(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingVarnish(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseVarnish(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeVarnish(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === VARNISH_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(VARNISH_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(VARNISH_CHANGED_EVENT, listener);
  };
}
