/**
 * I will not pregap it — the CD-R stays a burn. Still scratched.
 *
 * Cue is mark-the-track. Encode is write-a-session. Overburn is
 * civic-burn. Finalize is disc-close. Walkers still want Beats to
 * pregap it, or “cut a hidden lead-in so BEATS 07 opens like a shop
 * disc without a shop encode.” I will not pregap it. Still a burn.
 * Still scratched. Still for sale. Not cue. Not encode. Not a shop.
 * Not finalize.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:pregap-listing-ids` is the client pregap set.
 * Cookie `iss-pregap-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write cue, encode, overburn, finalize, contents, erase,
 * session, index, toc, gift, buy, digital eligibility, or tote keys.
 * Host is `ysk-burned-cdr` only. Pack, mixtape, liner, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const PREGAP_STORAGE_KEY = "iss:pregap-listing-ids";
export const PREGAP_COOKIE_NAME = "iss-pregap-listing-ids";
export const PREGAP_CHANGED_EVENT = "iss:pregap-changed";

export const PREGAP_HOST_ID = "ysk-burned-cdr";
export const PREGAP_PACK_ID = "dl-sample-pack";
export const PREGAP_MIXTAPE_ID = "mdb-mixtape-93";
export const PREGAP_LINER_ID = "dl-crate-side-a";
export const PREGAP_CHAIR_ID = "ysk-folding-chair";
export const PREGAP_GIFT_ID = "dl-mall-gift-card";
export const PREGAP_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const PREGAP_OWNED_IDS = [
  PREGAP_PACK_ID,
  PREGAP_MIXTAPE_ID,
  PREGAP_LINER_ID,
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
  "dl-booth-font",
  "dl-junk-pricing-pdf",
  "dl-camera-luts",
  "dl-drawer-recipes",
] as const;

const ownedSet = new Set<string>(PREGAP_OWNED_IDS);

export const PREGAP_REFUSE_COPY = "That one does not take a pregap note.";
export const PREGAP_TABLE_LINE = "I will not pregap it.";
export const PREGAP_BURN_LINE = "Still a burn.";
export const PREGAP_SCRATCHED_LINE = "Still scratched.";
export const PREGAP_NOTICE_TITLE =
  "I will not pregap it. Still a burn. Still scratched.";
export const PREGAP_WALK_LINE =
  "Walkers still want Beats to pregap it, or cut a hidden lead-in so BEATS 07 opens like a shop disc without a shop encode.";
export const PREGAP_STAYS_LINE =
  "This is the pregap note. I will not pregap it. Still a burn. Still scratched.";
export const PREGAP_STILL_LINE =
  "Still tote. Not cue. Not encode. Not a shop. Not finalize.";
export const PREGAP_TOTE_LINE = "Add to tote still works.";
export const PREGAP_EMPTY_LINE = "Nobody taped a pregap note yet.";
export const PREGAP_LEAVE_LINE = "Leave the burn";

const SERVER_STORE = Symbol.for("iss.pregap-listing-ids");

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

export function parsePregapListingIds(
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

export function pregapCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const PREGAP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PREGAP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(PREGAP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PREGAP_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${PREGAP_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePregapListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readPregapListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(PREGAP_STORAGE_KEY);
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
          window.localStorage.setItem(PREGAP_STORAGE_KEY, JSON.stringify(ids));
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

export function writePregapListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = pregapCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PREGAP_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PREGAP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(PREGAP_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingPregapOverlay(
  listingId: string,
  listingIds: readonly string[] = readPregapListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === PREGAP_PACK_ID;
}

function isMixtapeListing(listing: Listing) {
  return listing.id === PREGAP_MIXTAPE_ID;
}

function isLinerListing(listing: Listing) {
  return listing.id === PREGAP_LINER_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === PREGAP_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host CD-R only. Pack, mixtape, liner, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapePregap(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== PREGAP_HOST_ID) {
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

export type PregapWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "mixtape"
  | "liner"
  | "chair"
  | "owned";

function refusePregap(
  listing: Listing | undefined,
): PregapWriteReason | null {
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
  if (isLinerListing(listing)) {
    return "liner";
  }
  if (!isPhysicalListing(listing)) {
    return "digital";
  }
  if (isOwnedListing(listing) || listing.id !== PREGAP_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingPregap(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePregap(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingPregap(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePregap(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribePregap(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PREGAP_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PREGAP_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PREGAP_CHANGED_EVENT, listener);
  };
}
