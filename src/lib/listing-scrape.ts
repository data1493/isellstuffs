/**
 * I will not scrape it — the unnamed LP still scratches. Still a skip.
 *
 * Rinse is wet-clean. Hone is the nick. Puck is weight-on-Side-A.
 * Dust is the wipe. Antistat is destatic-the-groove. Walkers still
 * want Sunday Crate to scrape the LP, or “lift the skip so Side A
 * plays through the chorus.” I will not scrape it. Still a scratch.
 * Still a skip. Still for sale. Not rinse. Not hone. Not a shop.
 * Not antistat.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:scrape-listing-ids` is the client scrape set.
 * Cookie `iss-scrape-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write rinse, hone, puck, dust, skip, antistat, blade, dry,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `mdb-scratched-lp` only. Mixtape, jewels, liner, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SCRAPE_STORAGE_KEY = "iss:scrape-listing-ids";
export const SCRAPE_COOKIE_NAME = "iss-scrape-listing-ids";
export const SCRAPE_CHANGED_EVENT = "iss:scrape-changed";

export const SCRAPE_HOST_ID = "mdb-scratched-lp";
export const SCRAPE_MIXTAPE_ID = "mdb-mixtape-93";
export const SCRAPE_JEWELS_ID = "mdb-jewel-stack";
export const SCRAPE_LINER_ID = "dl-crate-side-a";
export const SCRAPE_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const SCRAPE_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "dl-booth-font",
  "kdr-chipped-mug",
  "kdr-bent-whisk",
  "kdr-lid-no-pot",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-drawer-recipes",
  "dl-camera-luts",
] as const;

export const SCRAPE_REFUSE_COPY = "That one does not take a scrape note.";
export const SCRAPE_TABLE_LINE = "I will not scrape it.";
export const SCRAPE_SCRATCH_LINE = "Still a scratch.";
export const SCRAPE_SKIP_LINE = "Still a skip.";
export const SCRAPE_NOTICE_TITLE =
  "I will not scrape it. Still a scratch. Still a skip.";
export const SCRAPE_WALK_LINE =
  "Walkers still want Sunday Crate to scrape it, or lift the skip so Side A plays through the chorus.";
export const SCRAPE_STAYS_LINE =
  "This is the scrape note. I will not scrape it. Still a scratch. Still a skip.";
export const SCRAPE_STILL_LINE =
  "Still tote. Not rinse. Not hone. Not a shop. Not antistat.";
export const SCRAPE_TOTE_LINE = "Add to tote still works.";
export const SCRAPE_EMPTY_LINE = "Nobody taped a scrape note yet.";
export const SCRAPE_LEAVE_LINE = "Leave the scratch";

const SERVER_STORE = Symbol.for("iss.scrape-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(SCRAPE_OWNED_IDS);

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

export function parseScrapeListingIds(
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

export function scrapeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SCRAPE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SCRAPE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SCRAPE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SCRAPE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SCRAPE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseScrapeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readScrapeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SCRAPE_STORAGE_KEY);
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
          window.localStorage.setItem(SCRAPE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeScrapeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = scrapeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SCRAPE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SCRAPE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SCRAPE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingScrapeOverlay(
  listingId: string,
  listingIds: readonly string[] = readScrapeListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === SCRAPE_MIXTAPE_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === SCRAPE_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === SCRAPE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LP only. Mixtape, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeScrape(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== SCRAPE_HOST_ID) {
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

export type ScrapeWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

function refuseScrape(
  listing: Listing | undefined,
): ScrapeWriteReason | null {
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
  if (isMixtapeListing(listing)) {
    return "mixtape";
  }
  if (isJewelsListing(listing)) {
    return "jewels";
  }
  if (isOwnedListing(listing) || listing.id !== SCRAPE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingScrape(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseScrape(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingScrape(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseScrape(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeScrape(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SCRAPE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SCRAPE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SCRAPE_CHANGED_EVENT, listener);
  };
}
