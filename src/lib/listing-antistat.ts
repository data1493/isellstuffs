/**
 * I will not antistat it — the unnamed LP still scratches. Still a skip.
 *
 * Rinse is wet-clean. Hone is the nick. Puck is weight-on-Side-A.
 * Dust is the wipe. Skip is the chorus. Walkers still want Sunday
 * Crate to antistat the LP, or “gun the groove so the skip sits
 * after the rinse.” I will not antistat it. Still a scratch. Still
 * a skip. Still for sale. Not rinse. Not hone. Not a shop. Not dust.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:antistat-listing-ids` is the client antistat set.
 * Cookie `iss-antistat-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write rinse, hone, puck, dust, skip, wash, ion, destatic,
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

export const ANTISTAT_STORAGE_KEY = "iss:antistat-listing-ids";
export const ANTISTAT_COOKIE_NAME = "iss-antistat-listing-ids";
export const ANTISTAT_CHANGED_EVENT = "iss:antistat-changed";

export const ANTISTAT_HOST_ID = "mdb-scratched-lp";
export const ANTISTAT_MIXTAPE_ID = "mdb-mixtape-93";
export const ANTISTAT_JEWELS_ID = "mdb-jewel-stack";
export const ANTISTAT_LINER_ID = "dl-crate-side-a";
export const ANTISTAT_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const ANTISTAT_OWNED_IDS = [
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

export const ANTISTAT_REFUSE_COPY = "That one does not take an antistat note.";
export const ANTISTAT_TABLE_LINE = "I will not antistat it.";
export const ANTISTAT_SCRATCH_LINE = "Still a scratch.";
export const ANTISTAT_SKIP_LINE = "Still a skip.";
export const ANTISTAT_NOTICE_TITLE =
  "I will not antistat it. Still a scratch. Still a skip.";
export const ANTISTAT_WALK_LINE =
  "Walkers still want Sunday Crate to antistat it, or gun the groove so the skip sits after the rinse.";
export const ANTISTAT_STAYS_LINE =
  "This is the antistat note. I will not antistat it. Still a scratch. Still a skip.";
export const ANTISTAT_STILL_LINE =
  "Still tote. Not rinse. Not hone. Not a shop. Not dust.";
export const ANTISTAT_TOTE_LINE = "Add to tote still works.";
export const ANTISTAT_EMPTY_LINE = "Nobody taped an antistat note yet.";
export const ANTISTAT_LEAVE_LINE = "Leave the scratch";

const SERVER_STORE = Symbol.for("iss.antistat-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(ANTISTAT_OWNED_IDS);

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

export function parseAntistatListingIds(
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

export function antistatCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const ANTISTAT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${ANTISTAT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(ANTISTAT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(ANTISTAT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${ANTISTAT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseAntistatListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readAntistatListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(ANTISTAT_STORAGE_KEY);
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
          window.localStorage.setItem(ANTISTAT_STORAGE_KEY, JSON.stringify(ids));
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

export function writeAntistatListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = antistatCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(ANTISTAT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${ANTISTAT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(ANTISTAT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingAntistatOverlay(
  listingId: string,
  listingIds: readonly string[] = readAntistatListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === ANTISTAT_MIXTAPE_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === ANTISTAT_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === ANTISTAT_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LP only. Mixtape, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeAntistat(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== ANTISTAT_HOST_ID) {
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

export type AntistatWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

function refuseAntistat(
  listing: Listing | undefined,
): AntistatWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== ANTISTAT_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingAntistat(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseAntistat(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingAntistat(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseAntistat(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeAntistat(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === ANTISTAT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(ANTISTAT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ANTISTAT_CHANGED_EVENT, listener);
  };
}
