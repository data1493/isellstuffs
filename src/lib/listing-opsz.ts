/**
 * I will not opsz it — still two weights. Still almost-bold.
 * Still tote.
 *
 * Raster is outline-to-bitmap. Gasp is set-the-greys. Gridfit is
 * drop-instructions. Bluezone is snap-the-zones. Walkers still want
 * Beats to opsz it, or “drop a shop optical-size axis so the
 * directory grades without a shop raster.” I will not opsz it.
 * Still two weights. Still almost-bold. Still for sale. Not raster.
 * Not gasp. Not a shop. Not gridfit. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:opsz-listing-ids` is the client opsz set.
 * Cookie `iss-opsz-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write raster, gasp, gridfit, bluezone, hint, kern, ligature,
 * subset, wdth, wght, ital, optical, gift, buy, digital eligibility,
 * or tote keys.
 * Host is `dl-booth-font` only. Pack, junk PDF, LUT, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Opsz is drop the optical-size axis, not a login. Register stays
 * print bars.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const OPSZ_STORAGE_KEY = "iss:opsz-listing-ids";
export const OPSZ_COOKIE_NAME = "iss-opsz-listing-ids";
export const OPSZ_CHANGED_EVENT = "iss:opsz-changed";

export const OPSZ_HOST_ID = "dl-booth-font";
export const OPSZ_PACK_ID = "dl-sample-pack";
export const OPSZ_PDF_ID = "dl-junk-pricing-pdf";
export const OPSZ_LUT_ID = "dl-camera-luts";
export const OPSZ_ZINE_ID = "dl-stain-zine";
export const OPSZ_LINER_ID = "dl-crate-side-a";
export const OPSZ_CHAIR_ID = "ysk-folding-chair";
export const OPSZ_GIFT_ID = "dl-mall-gift-card";
export const OPSZ_BOY_ID = "gtk-game-boy";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const OPSZ_OWNED_IDS = [
  OPSZ_PACK_ID,
  OPSZ_PDF_ID,
  OPSZ_LUT_ID,
  OPSZ_ZINE_ID,
  OPSZ_LINER_ID,
  "dl-drawer-recipes",
  OPSZ_BOY_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "mdb-scratched-lp",
  "gtk-cable-drawer",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "ysk-burned-cdr",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
] as const;

const ownedSet = new Set<string>(OPSZ_OWNED_IDS);

export const OPSZ_REFUSE_COPY = "That one does not take an opsz note.";
export const OPSZ_TABLE_LINE = "I will not opsz it.";
export const OPSZ_WEIGHTS_LINE = "Still two weights.";
export const OPSZ_BOLD_LINE = "Still almost-bold.";
export const OPSZ_NOTICE_TITLE =
  "I will not opsz it. Still two weights. Still almost-bold.";
export const OPSZ_WALK_LINE =
  "Walkers still want Beats to opsz it, or drop a shop optical-size axis so the directory grades without a shop raster.";
export const OPSZ_STAYS_LINE =
  "This is the opsz note. I will not opsz it. Still two weights. Still almost-bold.";
export const OPSZ_STILL_LINE =
  "Still tote. Not raster. Not gasp. Not a shop. Not gridfit. Not an account.";
export const OPSZ_TOTE_LINE = "Add to tote still works.";
export const OPSZ_EMPTY_LINE = "Nobody taped an opsz note yet.";
export const OPSZ_LEAVE_LINE = "Leave the map";

const SERVER_STORE = Symbol.for("iss.opsz-listing-ids");

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

export function parseOpszListingIds(
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

export function opszCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const OPSZ_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${OPSZ_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(OPSZ_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(OPSZ_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${OPSZ_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseOpszListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readOpszListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(OPSZ_STORAGE_KEY);
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
          window.localStorage.setItem(OPSZ_STORAGE_KEY, JSON.stringify(ids));
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

export function writeOpszListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = opszCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(OPSZ_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${OPSZ_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(OPSZ_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingOpszOverlay(
  listingId: string,
  listingIds: readonly string[] = readOpszListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === OPSZ_PACK_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === OPSZ_PDF_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === OPSZ_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host booth font only. Pack, junk PDF, overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeOpsz(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== OPSZ_HOST_ID) {
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

export type OpszWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "pdf"
  | "chair"
  | "owned";

function refuseOpsz(
  listing: Listing | undefined,
): OpszWriteReason | null {
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
    return "physical";
  }
  if (isPackListing(listing)) {
    return "pack";
  }
  if (isPdfListing(listing)) {
    return "pdf";
  }
  if (isOwnedListing(listing) || listing.id !== OPSZ_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingOpsz(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseOpsz(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingOpsz(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseOpsz(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeOpsz(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === OPSZ_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(OPSZ_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(OPSZ_CHANGED_EVENT, listener);
  };
}
