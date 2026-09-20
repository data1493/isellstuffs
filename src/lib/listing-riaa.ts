/**
 * I will not riaa it — the unnamed LP still skips. Still unnamed.
 *
 * Vacuum is clean-the-groove. Zenith is twist-the-cartridge. Overhang
 * is set-Baerwald. Retip is fit-a-nude. Walkers still want Crate to
 * riaa it, or “drop a shop RIAA so the unnamed LP eqs without a shop
 * vacuum.” I will not riaa it. Still a skip. Still unnamed. Still
 * for sale. Not vacuum. Not zenith. Not a shop. Not overhang.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:riaa-listing-ids` is the client riaa set.
 * Cookie `iss-riaa-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write vacuum, zenith, overhang, retip, azimuth, nabs, lathe,
 * hone, antistat, flutter, torque, bias, iec98, nartb, emphasis,
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

export const RIAA_STORAGE_KEY = "iss:riaa-listing-ids";
export const RIAA_COOKIE_NAME = "iss-riaa-listing-ids";
export const RIAA_CHANGED_EVENT = "iss:riaa-changed";

export const RIAA_HOST_ID = "mdb-scratched-lp";
export const RIAA_MIXTAPE_ID = "mdb-mixtape-93";
export const RIAA_JEWELS_ID = "mdb-jewel-stack";
export const RIAA_LINER_ID = "dl-crate-side-a";
export const RIAA_CHAIR_ID = "ysk-folding-chair";
export const RIAA_GIFT_ID = "dl-mall-gift-card";
export const RIAA_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const RIAA_OWNED_IDS = [
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

const ownedSet = new Set<string>(RIAA_OWNED_IDS);

export const RIAA_REFUSE_COPY = "That one does not take a riaa note.";
export const RIAA_TABLE_LINE = "I will not riaa it.";
export const RIAA_SKIP_LINE = "Still a skip.";
export const RIAA_UNNAMED_LINE = "Still unnamed.";
export const RIAA_NOTICE_TITLE =
  "I will not riaa it. Still a skip. Still unnamed.";
export const RIAA_WALK_LINE =
  "Walkers still want Crate to riaa it, or drop a shop RIAA so the unnamed LP eqs without a shop vacuum.";
export const RIAA_STAYS_LINE =
  "This is the riaa note. I will not riaa it. Still a skip. Still unnamed.";
export const RIAA_STILL_LINE =
  "Still tote. Not vacuum. Not zenith. Not a shop. Not overhang.";
export const RIAA_TOTE_LINE = "Add to tote still works.";
export const RIAA_EMPTY_LINE = "Nobody taped a riaa note yet.";
export const RIAA_LEAVE_LINE = "Leave the skip";

const SERVER_STORE = Symbol.for("iss.riaa-listing-ids");

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

export function parseRiaaListingIds(
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

export function riaaCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const RIAA_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${RIAA_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(RIAA_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(RIAA_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${RIAA_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseRiaaListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readRiaaListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(RIAA_STORAGE_KEY);
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
          window.localStorage.setItem(RIAA_STORAGE_KEY, JSON.stringify(ids));
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

export function writeRiaaListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = riaaCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(RIAA_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${RIAA_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(RIAA_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingRiaaOverlay(
  listingId: string,
  listingIds: readonly string[] = readRiaaListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === RIAA_MIXTAPE_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === RIAA_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === RIAA_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LP only. Mixtape, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeRiaa(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== RIAA_HOST_ID) {
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

export type RiaaWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

function refuseRiaa(
  listing: Listing | undefined,
): RiaaWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== RIAA_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingRiaa(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseRiaa(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingRiaa(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseRiaa(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeRiaa(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === RIAA_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(RIAA_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RIAA_CHANGED_EVENT, listener);
  };
}
