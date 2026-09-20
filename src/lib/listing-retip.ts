/**
 * I will not retip it — the unnamed LP still skips. Still unnamed.
 *
 * Vacuum is clean-the-groove. Zenith is twist-the-cartridge.
 * Overhang is set-Baerwald. Azimuth is twist-the-headshell.
 * Walkers still want Crate to retip it, or “fit a shop nude so
 * the unnamed LP tracks without a shop zenith.” I will not retip
 * it. Still a skip. Still unnamed. Still for sale. Not vacuum.
 * Not zenith. Not a shop. Not overhang.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:retip-listing-ids` is the client retip set.
 * Cookie `iss-retip-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write vacuum, zenith, overhang, azimuth, relap, flutter,
 * nude, shibata, cantilever, gift, buy, digital eligibility, or tote keys.
 * Host is `mdb-scratched-lp` only. Mixtape, jewels, liner, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const RETIP_STORAGE_KEY = "iss:retip-listing-ids";
export const RETIP_COOKIE_NAME = "iss-retip-listing-ids";
export const RETIP_CHANGED_EVENT = "iss:retip-changed";

export const RETIP_HOST_ID = "mdb-scratched-lp";
export const RETIP_MIXTAPE_ID = "mdb-mixtape-93";
export const RETIP_JEWELS_ID = "mdb-jewel-stack";
export const RETIP_LINER_ID = "dl-crate-side-a";
export const RETIP_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const RETIP_OWNED_IDS = [
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

export const RETIP_REFUSE_COPY = "That one does not take a retip note.";
export const RETIP_TABLE_LINE = "I will not retip it.";
export const RETIP_SKIP_LINE = "Still a skip.";
export const RETIP_UNNAMED_LINE = "Still unnamed.";
export const RETIP_NOTICE_TITLE =
  "I will not retip it. Still a skip. Still unnamed.";
export const RETIP_WALK_LINE =
  "Walkers still want Crate to retip it, or fit a shop nude so the unnamed LP tracks without a shop zenith.";
export const RETIP_STAYS_LINE =
  "This is the retip note. I will not retip it. Still a skip. Still unnamed.";
export const RETIP_STILL_LINE =
  "Still tote. Not vacuum. Not zenith. Not a shop. Not overhang.";
export const RETIP_TOTE_LINE = "Add to tote still works.";
export const RETIP_EMPTY_LINE = "Nobody taped a retip note yet.";
export const RETIP_LEAVE_LINE = "Leave the skip";

const SERVER_STORE = Symbol.for("iss.retip-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(RETIP_OWNED_IDS);

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

export function parseRetipListingIds(
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

export function retipCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const RETIP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${RETIP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(RETIP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(RETIP_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${RETIP_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseRetipListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readRetipListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(RETIP_STORAGE_KEY);
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
          window.localStorage.setItem(RETIP_STORAGE_KEY, JSON.stringify(ids));
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

export function writeRetipListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = retipCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(RETIP_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${RETIP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(RETIP_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingRetipOverlay(
  listingId: string,
  listingIds: readonly string[] = readRetipListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === RETIP_MIXTAPE_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === RETIP_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === RETIP_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LP only. Mixtape, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeRetip(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== RETIP_HOST_ID) {
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

export type RetipWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

function refuseRetip(
  listing: Listing | undefined,
): RetipWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== RETIP_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingRetip(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseRetip(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingRetip(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseRetip(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeRetip(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === RETIP_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(RETIP_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RETIP_CHANGED_EVENT, listener);
  };
}
