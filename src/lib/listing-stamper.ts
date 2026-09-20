/**
 * I will not stamper it — the CD-R stays Sharpie. Still a jewel case.
 *
 * Pregap is hide-the-lead-in. Encode is write-the-session. Cue is
 * index-the-burn. Overburn is push-the-outer. Walkers still want
 * Beats to stamper it, or “press a shop father so BEATS 07 reads
 * pressed-solid without a shop pregap.” I will not stamper it.
 * Still Sharpie. Still a jewel case. Still for sale. Not pregap.
 * Not encode. Not a shop. Not cue.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:stamper-listing-ids` is the client stamper set.
 * Cookie `iss-stamper-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write pregap, encode, cue, overburn, finalize, flutter,
 * press, glassmaster, father, gift, buy, digital eligibility, or
 * tote keys.
 * Host is `ysk-burned-cdr` only. Pack, mixtape, font, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const STAMPER_STORAGE_KEY = "iss:stamper-listing-ids";
export const STAMPER_COOKIE_NAME = "iss-stamper-listing-ids";
export const STAMPER_CHANGED_EVENT = "iss:stamper-changed";

export const STAMPER_HOST_ID = "ysk-burned-cdr";
export const STAMPER_PACK_ID = "dl-sample-pack";
export const STAMPER_MIXTAPE_ID = "mdb-mixtape-93";
export const STAMPER_FONT_ID = "dl-booth-font";
export const STAMPER_CHAIR_ID = "ysk-folding-chair";
export const STAMPER_GIFT_ID = "dl-mall-gift-card";
export const STAMPER_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const STAMPER_OWNED_IDS = [
  STAMPER_PACK_ID,
  STAMPER_MIXTAPE_ID,
  STAMPER_FONT_ID,
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

const ownedSet = new Set<string>(STAMPER_OWNED_IDS);

export const STAMPER_REFUSE_COPY = "That one does not take a stamper note.";
export const STAMPER_TABLE_LINE = "I will not stamper it.";
export const STAMPER_SHARPIE_LINE = "Still Sharpie.";
export const STAMPER_JEWEL_LINE = "Still a jewel case.";
export const STAMPER_NOTICE_TITLE =
  "I will not stamper it. Still Sharpie. Still a jewel case.";
export const STAMPER_WALK_LINE =
  "Walkers still want Beats to stamper it, or press a shop father so BEATS 07 reads pressed-solid without a shop pregap.";
export const STAMPER_STAYS_LINE =
  "This is the stamper note. I will not stamper it. Still Sharpie. Still a jewel case.";
export const STAMPER_STILL_LINE =
  "Still tote. Not pregap. Not encode. Not a shop. Not cue.";
export const STAMPER_TOTE_LINE = "Add to tote still works.";
export const STAMPER_EMPTY_LINE = "Nobody taped a stamper note yet.";
export const STAMPER_LEAVE_LINE = "Leave the burn";

const SERVER_STORE = Symbol.for("iss.stamper-listing-ids");

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

export function parseStamperListingIds(
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

export function stamperCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const STAMPER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${STAMPER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(STAMPER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(STAMPER_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${STAMPER_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseStamperListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readStamperListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(STAMPER_STORAGE_KEY);
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
          window.localStorage.setItem(STAMPER_STORAGE_KEY, JSON.stringify(ids));
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

export function writeStamperListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = stamperCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STAMPER_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${STAMPER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(STAMPER_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingStamperOverlay(
  listingId: string,
  listingIds: readonly string[] = readStamperListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === STAMPER_PACK_ID;
}

function isMixtapeListing(listing: Listing) {
  return listing.id === STAMPER_MIXTAPE_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === STAMPER_FONT_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === STAMPER_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host CD-R only. Pack, mixtape, font, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeStamper(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== STAMPER_HOST_ID) {
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

export type StamperWriteReason =
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

function refuseStamper(
  listing: Listing | undefined,
): StamperWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== STAMPER_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingStamper(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseStamper(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingStamper(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseStamper(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeStamper(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === STAMPER_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(STAMPER_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STAMPER_CHANGED_EVENT, listener);
  };
}
