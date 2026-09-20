/**
 * I will not zenith it — the unnamed LP still skips. Still unnamed.
 *
 * Vacuum is clean-the-groove. Azimuth is twist-the-headshell.
 * Overhang is set-Baerwald (queued / on main). Bias is set-the-record
 * (queued). Walkers still want Crate to zenith it, or “twist the
 * cartridge so the unnamed LP tracks square without a shop vacuum.”
 * I will not zenith it. Still a skip. Still unnamed. Still for sale.
 * Not vacuum. Not azimuth. Not a shop. Not overhang. Not bias. Not
 * flutter. Not torque. Not lathe. Not hone. Not vta. Not offset.
 * Not srael.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:zenith-listing-ids` is the client zenith set.
 * Cookie `iss-zenith-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write vacuum, azimuth, overhang, bias, flutter, torque,
 * lathe, hone, gift, buy, digital eligibility, or tote keys.
 * Host is `mdb-scratched-lp` only. Mixtape, jewels, liner, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const ZENITH_STORAGE_KEY = "iss:zenith-listing-ids";
export const ZENITH_COOKIE_NAME = "iss-zenith-listing-ids";
export const ZENITH_CHANGED_EVENT = "iss:zenith-changed";

export const ZENITH_HOST_ID = "mdb-scratched-lp";
export const ZENITH_MIXTAPE_ID = "mdb-mixtape-93";
export const ZENITH_JEWELS_ID = "mdb-jewel-stack";
export const ZENITH_LINER_ID = "dl-crate-side-a";
export const ZENITH_CHAIR_ID = "ysk-folding-chair";
export const ZENITH_GIFT_ID = "dl-mall-gift-card";
export const ZENITH_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const ZENITH_OWNED_IDS = [
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

const ownedSet = new Set<string>(ZENITH_OWNED_IDS);

export const ZENITH_REFUSE_COPY = "That one does not take a zenith note.";
export const ZENITH_TABLE_LINE = "I will not zenith it.";
export const ZENITH_SKIP_LINE = "Still a skip.";
export const ZENITH_UNNAMED_LINE = "Still unnamed.";
export const ZENITH_NOTICE_TITLE =
  "I will not zenith it. Still a skip. Still unnamed.";
export const ZENITH_WALK_LINE =
  "Walkers still want Crate to zenith it, or twist the cartridge so the unnamed LP tracks square without a shop vacuum.";
export const ZENITH_STAYS_LINE =
  "This is the zenith note. I will not zenith it. Still a skip. Still unnamed.";
export const ZENITH_STILL_LINE =
  "Still tote. Not vacuum. Not azimuth. Not a shop. Not overhang.";
export const ZENITH_TOTE_LINE = "Add to tote still works.";
export const ZENITH_EMPTY_LINE = "Nobody taped a zenith note yet.";
export const ZENITH_LEAVE_LINE = "Leave the skip";

const SERVER_STORE = Symbol.for("iss.zenith-listing-ids");

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

export function parseZenithListingIds(
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

export function zenithCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const ZENITH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${ZENITH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(ZENITH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(ZENITH_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${ZENITH_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseZenithListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readZenithListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(ZENITH_STORAGE_KEY);
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
          window.localStorage.setItem(ZENITH_STORAGE_KEY, JSON.stringify(ids));
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

export function writeZenithListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = zenithCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(ZENITH_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${ZENITH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(ZENITH_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingZenithOverlay(
  listingId: string,
  listingIds: readonly string[] = readZenithListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === ZENITH_MIXTAPE_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === ZENITH_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === ZENITH_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LP only. Mixtape, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeZenith(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== ZENITH_HOST_ID) {
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

export type ZenithWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

function refuseZenith(
  listing: Listing | undefined,
): ZenithWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== ZENITH_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingZenith(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseZenith(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingZenith(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseZenith(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeZenith(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === ZENITH_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(ZENITH_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ZENITH_CHANGED_EVENT, listener);
  };
}
