/**
 * I will not cue it — the CD-R stays a Sharpie. Still a skip.
 * Still tote.
 *
 * Finalize is disc-close. Overburn is civic-burn. Encode is
 * write-the-session. Author is write-the-jewels. Contents is
 * no tracklist. Walkers still want Beats to cue it, or “write
 * a sheet so BEATS 07 indexes without a shop encode.” I will
 * not cue it. Still a Sharpie. Still a skip. Still for sale.
 * Not finalize. Not overburn. Not a shop. Not encode.
 *
 * Cue here is write a sheet for the burned disc, not a desk
 * queue and not a login. Do not steal `/sell/desk/queue`.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:cue-listing-ids` is the client cue set.
 * Cookie `iss-cue-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write finalize, overburn, encode, author, contents, burn,
 * session, dao, tao, gift, buy, digital eligibility, or tote keys.
 * Host is `ysk-burned-cdr` only. Pack, Game Boy, jewels, gift,
 * and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const CUE_STORAGE_KEY = "iss:cue-listing-ids";
export const CUE_COOKIE_NAME = "iss-cue-listing-ids";
export const CUE_CHANGED_EVENT = "iss:cue-changed";

export const CUE_HOST_ID = "ysk-burned-cdr";
export const CUE_PACK_ID = "dl-sample-pack";
export const CUE_BOY_ID = "gtk-game-boy";
export const CUE_JEWELS_ID = "mdb-jewel-stack";
export const CUE_CHAIR_ID = "ysk-folding-chair";
export const CUE_GIFT_ID = "dl-mall-gift-card";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const CUE_OWNED_IDS = [
  CUE_BOY_ID,
  CUE_JEWELS_ID,
  CUE_PACK_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "mdb-scratched-lp",
  "mdb-mixtape-93",
  "gtk-cable-drawer",
  "dl-booth-font",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "dl-junk-pricing-pdf",
  "dl-drawer-recipes",
  "dl-camera-luts",
  "dl-crate-side-a",
] as const;

const ownedSet = new Set<string>(CUE_OWNED_IDS);

export const CUE_REFUSE_COPY = "That one does not take a cue note.";
export const CUE_TABLE_LINE = "I will not cue it.";
export const CUE_SHARPIE_LINE = "Still a Sharpie.";
export const CUE_SKIP_LINE = "Still a skip.";
export const CUE_NOTICE_TITLE =
  "I will not cue it. Still a Sharpie. Still a skip.";
export const CUE_WALK_LINE =
  "Walkers still want Beats to cue it, or write a sheet so BEATS 07 indexes without a shop encode.";
export const CUE_STAYS_LINE =
  "This is the cue note. I will not cue it. Still a Sharpie. Still a skip.";
export const CUE_STILL_LINE =
  "Still tote. Not finalize. Not overburn. Not a shop. Not encode.";
export const CUE_TOTE_LINE = "Add to tote still works.";
export const CUE_EMPTY_LINE = "Nobody taped a cue note yet.";
export const CUE_LEAVE_LINE = "Leave the Sharpie";

const SERVER_STORE = Symbol.for("iss.cue-listing-ids");

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

export function parseCueListingIds(
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

export function cueCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const CUE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CUE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(CUE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(CUE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CUE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseCueListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readCueListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(CUE_STORAGE_KEY);
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
          window.localStorage.setItem(CUE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeCueListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = cueCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CUE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${CUE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(CUE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingCueOverlay(
  listingId: string,
  listingIds: readonly string[] = readCueListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === CUE_PACK_ID;
}

function isBoyListing(listing: Listing) {
  return listing.id === CUE_BOY_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === CUE_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === CUE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host disc only. Pack, Game Boy, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeCue(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== CUE_HOST_ID) {
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

export type CueWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "boy"
  | "jewels"
  | "chair"
  | "owned";

function refuseCue(
  listing: Listing | undefined,
): CueWriteReason | null {
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
  if (isPackListing(listing)) {
    return "pack";
  }
  if (isBoyListing(listing)) {
    return "boy";
  }
  if (isJewelsListing(listing)) {
    return "jewels";
  }
  if (isOwnedListing(listing) || listing.id !== CUE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingCue(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCue(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingCue(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCue(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeCue(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CUE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CUE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CUE_CHANGED_EVENT, listener);
  };
}
