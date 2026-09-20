/**
 * I will not vacuum it — the unnamed LP still skips. Still a grocery bag.
 *
 * Hone is stone-the-nick. Antistat is destatic-the-groove. Rinse is
 * the wash. Warp is flatten-under-books. Walkers still want Sunday
 * Crate to vacuum the LP, or “wet-vac the groove so Side A plays
 * through without a shop hone.” I will not vacuum it. Still a skip.
 * Still a grocery bag. Still for sale. Not hone. Not antistat. Not
 * a shop. Not rinse. Not warp.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:vacuum-listing-ids` is the client vacuum set.
 * Cookie `iss-vacuum-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write hone, antistat, rinse, warp, scrape, dust, erase,
 * ion, dry, gift, buy, digital eligibility, or tote keys.
 * Host is `mdb-scratched-lp` only. Mixtape, jewels, liner, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const VACUUM_STORAGE_KEY = "iss:vacuum-listing-ids";
export const VACUUM_COOKIE_NAME = "iss-vacuum-listing-ids";
export const VACUUM_CHANGED_EVENT = "iss:vacuum-changed";

export const VACUUM_HOST_ID = "mdb-scratched-lp";
export const VACUUM_MIXTAPE_ID = "mdb-mixtape-93";
export const VACUUM_JEWELS_ID = "mdb-jewel-stack";
export const VACUUM_LINER_ID = "dl-crate-side-a";
export const VACUUM_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const VACUUM_OWNED_IDS = [
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

export const VACUUM_REFUSE_COPY = "That one does not take a vacuum note.";
export const VACUUM_TABLE_LINE = "I will not vacuum it.";
export const VACUUM_SKIP_LINE = "Still a skip.";
export const VACUUM_BAG_LINE = "Still a grocery bag.";
export const VACUUM_NOTICE_TITLE =
  "I will not vacuum it. Still a skip. Still a grocery bag.";
export const VACUUM_WALK_LINE =
  "Walkers still want Sunday Crate to vacuum it, or wet-vac the groove so Side A plays through without a shop hone.";
export const VACUUM_STAYS_LINE =
  "This is the vacuum note. I will not vacuum it. Still a skip. Still a grocery bag.";
export const VACUUM_STILL_LINE =
  "Still tote. Not hone. Not antistat. Not a shop. Not rinse. Not warp.";
export const VACUUM_TOTE_LINE = "Add to tote still works.";
export const VACUUM_EMPTY_LINE = "Nobody taped a vacuum note yet.";
export const VACUUM_LEAVE_LINE = "Leave the skip";

const SERVER_STORE = Symbol.for("iss.vacuum-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(VACUUM_OWNED_IDS);

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

export function parseVacuumListingIds(
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

export function vacuumCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const VACUUM_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${VACUUM_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(VACUUM_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(VACUUM_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${VACUUM_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseVacuumListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readVacuumListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(VACUUM_STORAGE_KEY);
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
          window.localStorage.setItem(VACUUM_STORAGE_KEY, JSON.stringify(ids));
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

export function writeVacuumListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = vacuumCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(VACUUM_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${VACUUM_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(VACUUM_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingVacuumOverlay(
  listingId: string,
  listingIds: readonly string[] = readVacuumListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === VACUUM_MIXTAPE_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === VACUUM_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === VACUUM_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LP only. Mixtape, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeVacuum(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== VACUUM_HOST_ID) {
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

export type VacuumWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

function refuseVacuum(
  listing: Listing | undefined,
): VacuumWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== VACUUM_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingVacuum(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseVacuum(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingVacuum(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseVacuum(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeVacuum(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === VACUUM_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(VACUUM_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(VACUUM_CHANGED_EVENT, listener);
  };
}
