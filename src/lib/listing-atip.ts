/**
 * I will not atip it — the CD-R stays Sharpie. Still a jewel case.
 * Still tote.
 *
 * Pregap is hide-the-lead-in. Encode is write-the-session. Stamper is
 * press-the-father. Cue is index-the-burn. Walkers still want Beats
 * to atip it, or “write shop ATIP so BEATS 07 IDs as pressed without
 * a shop pregap.” I will not atip it. Still Sharpie. Still a jewel
 * case. Still for sale. Not pregap. Not encode. Not a shop. Not
 * stamper.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:atip-listing-ids` is the client atip set.
 * Cookie `iss-atip-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write pregap, encode, stamper, cue, overburn, finalize,
 * leadin, pma, msf, gift, buy, digital eligibility, or tote keys.
 * Host is `ysk-burned-cdr` only. Pack, mixtape, font, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const ATIP_STORAGE_KEY = "iss:atip-listing-ids";
export const ATIP_COOKIE_NAME = "iss-atip-listing-ids";
export const ATIP_CHANGED_EVENT = "iss:atip-changed";

export const ATIP_HOST_ID = "ysk-burned-cdr";
export const ATIP_PACK_ID = "dl-sample-pack";
export const ATIP_MIXTAPE_ID = "mdb-mixtape-93";
export const ATIP_FONT_ID = "dl-booth-font";
export const ATIP_CHAIR_ID = "ysk-folding-chair";
export const ATIP_GIFT_ID = "dl-mall-gift-card";
export const ATIP_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const ATIP_OWNED_IDS = [
  ATIP_PACK_ID,
  ATIP_MIXTAPE_ID,
  ATIP_FONT_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "mdb-jewel-stack",
  "mdb-scratched-lp",
  "dl-junk-pricing-pdf",
  "dl-camera-luts",
  "dl-drawer-recipes",
  "dl-crate-side-a",
] as const;

const ownedSet = new Set<string>(ATIP_OWNED_IDS);

export const ATIP_REFUSE_COPY = "That one does not take an atip note.";
export const ATIP_TABLE_LINE = "I will not atip it.";
export const ATIP_SHARPIE_LINE = "Still Sharpie.";
export const ATIP_JEWEL_LINE = "Still a jewel case.";
export const ATIP_NOTICE_TITLE =
  "I will not atip it. Still Sharpie. Still a jewel case.";
export const ATIP_WALK_LINE =
  "Walkers still want Beats to atip it, or write shop ATIP so BEATS 07 IDs as pressed without a shop pregap.";
export const ATIP_STAYS_LINE =
  "This is the atip note. I will not atip it. Still Sharpie. Still a jewel case.";
export const ATIP_STILL_LINE =
  "Still tote. Not pregap. Not encode. Not a shop. Not stamper.";
export const ATIP_TOTE_LINE = "Add to tote still works.";
export const ATIP_EMPTY_LINE = "Nobody taped an atip note yet.";
export const ATIP_LEAVE_LINE = "Leave the burn";

const SERVER_STORE = Symbol.for("iss.atip-listing-ids");

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

export function parseAtipListingIds(
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

export function atipCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const ATIP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${ATIP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(ATIP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(ATIP_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${ATIP_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseAtipListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readAtipListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(ATIP_STORAGE_KEY);
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
          window.localStorage.setItem(ATIP_STORAGE_KEY, JSON.stringify(ids));
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

export function writeAtipListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = atipCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(ATIP_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${ATIP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(ATIP_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingAtipOverlay(
  listingId: string,
  listingIds: readonly string[] = readAtipListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === ATIP_PACK_ID;
}

function isMixtapeListing(listing: Listing) {
  return listing.id === ATIP_MIXTAPE_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === ATIP_FONT_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === ATIP_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host CD-R only. Pack, mixtape, font, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeAtip(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== ATIP_HOST_ID) {
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

export type AtipWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "mixtape"
  | "font"
  | "chair"
  | "owned";

function refuseAtip(
  listing: Listing | undefined,
): AtipWriteReason | null {
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
  if (isPackListing(listing)) {
    return "pack";
  }
  if (isMixtapeListing(listing)) {
    return "mixtape";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (!isPhysicalListing(listing)) {
    return "digital";
  }
  if (isOwnedListing(listing) || listing.id !== ATIP_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingAtip(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseAtip(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingAtip(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseAtip(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeAtip(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === ATIP_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(ATIP_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ATIP_CHANGED_EVENT, listener);
  };
}
