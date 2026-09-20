/**
 * I will not gimbal it — the unnamed LP still skips. Still unnamed.
 *
 * Antiskate is set-the-pull (on main). Rumble is filter-the-rumble
 * (on main). Vta is set-the-arm-height (on main). Riaa is
 * drop-the-curve (on main). Vacuum is clean-the-groove (on main).
 * Zenith is twist-the-cartridge (on main). Overhang is set-Baerwald
 * (on main). Walkers still want Crate to gimbal it, or “set shop
 * gimbal bearings so the unnamed LP tracks without a shop
 * antiskate.” I will not gimbal it. Still a skip. Still unnamed.
 * Still for sale. Not antiskate. Not rumble. Not a shop. Not
 * vacuum. Not vta. Not riaa. Not zenith. Not overhang. Not retip.
 * Not azimuth. Not nabs. Not hum. Not isolation. Not subsonic. Not
 * wow. Not vtf. Not sral. Not unipivot. Not yoke. Not knifeedge.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:gimbal-listing-ids` is the client gimbal
 * set. Cookie `iss-gimbal-listing-ids` is the same JSON so PDPs
 * SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write antiskate, rumble, vta, riaa, vacuum, zenith, overhang,
 * retip, azimuth, nabs, flutter, torque, bias, hum, isolation,
 * subsonic, wow, vtf, sral, unipivot, yoke, knifeedge, gift, buy,
 * digital eligibility, or tote keys.
 * Host is `mdb-scratched-lp` only. Mixtape, jewels, liner, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const GIMBAL_STORAGE_KEY = "iss:gimbal-listing-ids";
export const GIMBAL_COOKIE_NAME = "iss-gimbal-listing-ids";
export const GIMBAL_CHANGED_EVENT = "iss:gimbal-changed";

export const GIMBAL_HOST_ID = "mdb-scratched-lp";
export const GIMBAL_MIXTAPE_ID = "mdb-mixtape-93";
export const GIMBAL_JEWELS_ID = "mdb-jewel-stack";
export const GIMBAL_LINER_ID = "dl-crate-side-a";
export const GIMBAL_CHAIR_ID = "ysk-folding-chair";
export const GIMBAL_GIFT_ID = "dl-mall-gift-card";
export const GIMBAL_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const GIMBAL_OWNED_IDS = [
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

const ownedSet = new Set<string>(GIMBAL_OWNED_IDS);

export const GIMBAL_REFUSE_COPY = "That one does not take a gimbal note.";
export const GIMBAL_TABLE_LINE = "I will not gimbal it.";
export const GIMBAL_SKIP_LINE = "Still a skip.";
export const GIMBAL_UNNAMED_LINE = "Still unnamed.";
export const GIMBAL_NOTICE_TITLE =
  "I will not gimbal it. Still a skip. Still unnamed.";
export const GIMBAL_WALK_LINE =
  "Walkers still want Crate to gimbal it, or set shop gimbal bearings so the unnamed LP tracks without a shop antiskate.";
export const GIMBAL_STAYS_LINE =
  "This is the gimbal note. I will not gimbal it. Still a skip. Still unnamed.";
export const GIMBAL_STILL_LINE =
  "Still tote. Not antiskate. Not rumble. Not a shop. Not vacuum.";
export const GIMBAL_TOTE_LINE = "Add to tote still works.";
export const GIMBAL_EMPTY_LINE = "Nobody taped a gimbal note yet.";
export const GIMBAL_LEAVE_LINE = "Leave the yoke";

const SERVER_STORE = Symbol.for("iss.gimbal-listing-ids");

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

export function parseGimbalListingIds(
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

export function gimbalCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GIMBAL_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GIMBAL_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GIMBAL_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GIMBAL_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GIMBAL_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGimbalListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGimbalListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GIMBAL_STORAGE_KEY);
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
          window.localStorage.setItem(GIMBAL_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGimbalListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = gimbalCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GIMBAL_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GIMBAL_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GIMBAL_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGimbalOverlay(
  listingId: string,
  listingIds: readonly string[] = readGimbalListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === GIMBAL_MIXTAPE_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === GIMBAL_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === GIMBAL_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LP only. Mixtape, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeGimbal(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== GIMBAL_HOST_ID) {
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

export type GimbalWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

function refuseGimbal(listing: Listing | undefined): GimbalWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== GIMBAL_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingGimbal(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGimbal(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingGimbal(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGimbal(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeGimbal(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GIMBAL_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GIMBAL_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GIMBAL_CHANGED_EVENT, listener);
  };
}
