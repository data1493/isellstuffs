/**
 * I will not bevel it — the CD-R stays scratched. Still tote.
 *
 * Lathe is resurface. Polish is Brasso. Finalize is disc-close.
 * Face is hub-print. Ink is Sharpie. Plays is I-played-it-once.
 * Walkers still want Beats to bevel the CD-R, or dress the outer
 * so it doesn’t catch the tray. I will not bevel it. Still
 * scratched. Still Sharpie. Still for sale. Not lathe. Not polish.
 * Not a shop. Not finalize.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:bevel-listing-ids` is the client bevel set.
 * Cookie `iss-bevel-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write lathe, polish, finalize, face, foam, ink, plays,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `ysk-burned-cdr` only. Pack, font, gift, zine, and listings
 * already owned by another overlay stay off. Fixture `sold` /
 * `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const BEVEL_STORAGE_KEY = "iss:bevel-listing-ids";
export const BEVEL_COOKIE_NAME = "iss-bevel-listing-ids";
export const BEVEL_CHANGED_EVENT = "iss:bevel-changed";

export const BEVEL_HOST_ID = "ysk-burned-cdr";
export const BEVEL_PACK_ID = "dl-sample-pack";
export const BEVEL_FONT_ID = "dl-booth-font";
export const BEVEL_ZINE_ID = "dl-stain-zine";
export const BEVEL_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const BEVEL_OWNED_IDS = [
  "gtk-game-boy",
  "clo-windbreaker",
  "clo-split-soles",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "gtk-cable-drawer",
  "dl-booth-font",
  "dl-sample-pack",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "dl-junk-pricing-pdf",
] as const;

const ownedSet = new Set<string>(BEVEL_OWNED_IDS);

export const BEVEL_REFUSE_COPY = "That one does not take a bevel note.";
export const BEVEL_TABLE_LINE = "I will not bevel it.";
export const BEVEL_SCRATCHED_LINE = "Still scratched.";
export const BEVEL_SHARPIE_LINE = "Still Sharpie.";
export const BEVEL_NOTICE_TITLE =
  "I will not bevel it. Still scratched. Still Sharpie.";
export const BEVEL_WALK_LINE =
  "Walkers still want Beats to bevel the disc, or dress the outer so it doesn’t catch the tray.";
export const BEVEL_STAYS_LINE =
  "This is the bevel note. I will not bevel it. Still scratched. Still Sharpie.";
export const BEVEL_STILL_LINE =
  "Still tote. Not lathe. Not polish. Not a shop. Not finalize.";
export const BEVEL_TOTE_LINE = "Add to tote still works.";
export const BEVEL_EMPTY_LINE = "Nobody taped a bevel note yet.";
export const BEVEL_LEAVE_LINE = "Leave the catch";

const SERVER_STORE = Symbol.for("iss.bevel-listing-ids");

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

export function parseBevelListingIds(
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

export function bevelCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BEVEL_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BEVEL_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BEVEL_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BEVEL_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BEVEL_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBevelListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBevelListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BEVEL_STORAGE_KEY);
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
          window.localStorage.setItem(BEVEL_STORAGE_KEY, JSON.stringify(ids));
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

export function writeBevelListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = bevelCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BEVEL_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BEVEL_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BEVEL_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBevelOverlay(
  listingId: string,
  listingIds: readonly string[] = readBevelListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === BEVEL_PACK_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === BEVEL_FONT_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === BEVEL_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host disc only. Pack, font, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeBevel(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== BEVEL_HOST_ID) {
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

export type BevelWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "font"
  | "chair"
  | "owned";

function refuseBevel(listing: Listing | undefined): BevelWriteReason | null {
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
  if (isFontListing(listing)) {
    return "font";
  }
  if (isOwnedListing(listing) || listing.id !== BEVEL_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingBevel(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBevel(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingBevel(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBevel(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeBevel(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BEVEL_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BEVEL_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BEVEL_CHANGED_EVENT, listener);
  };
}
