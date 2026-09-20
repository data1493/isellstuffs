/**
 * I will not eccentric it — the unnamed LP still skips. Still unnamed.
 *
 * Mistrack is shop-mistrack-the-groove (on main — do not own).
 * Rake is set-shop-stylus-rake (on main — do not own). Resonance is
 * tune-the-arm (on main — do not own). Pivot is seat-the-pivot
 * (on main). Dashpot is fill-the-damper (on main). Gimbal is
 * set-the-bearings (on main). Antiskate is set-the-pull (on main).
 * Rumble is filter-the-rumble (on main). Vta is set-the-arm-height
 * (on main). Riaa is drop-the-curve (on main). Vacuum is
 * clean-the-groove (on main). Zenith is twist-the-cartridge
 * (on main). Overhang is set-Baerwald (on main). Retip is
 * put-a-new-tip (on main). Walkers still want Crate to eccentric
 * it, or “shop-recenter the hole so the unnamed LP tracks without
 * a shop mistrack.” I will not eccentric it. Still a skip. Still
 * unnamed. Still for sale. Not mistrack. Not rake. Not a shop. Not
 * vacuum. Not resonance. Not pivot. Not dashpot. Not gimbal. Not
 * antiskate. Not rumble. Not vta. Not riaa. Not zenith. Not
 * overhang. Not retip. Not azimuth. Not nabs. Not flutter. Not
 * torque. Not relap. Not stylus. Not cartridge. Not sra. Not
 * sibilance. Not offcenter. Not shibata. Not baerwald. Not
 * stevenson.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:eccentric-listing-ids` is the client set.
 * Cookie `iss-eccentric-listing-ids` is the same JSON so PDPs SSR
 * the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write leftover mistrack, leftover rake, leftover resonance,
 * leftover pivot, leftover dashpot, leftover gimbal, leftover
 * antiskate, leftover rumble, leftover vta, leftover riaa, leftover
 * vacuum, leftover zenith, leftover overhang, leftover retip,
 * leftover azimuth, leftover nabs, leftover flutter, leftover
 * torque, leftover relap, leftover bias, leftover frost, leftover
 * billboard, leftover pillow, leftover fringe, leftover opbd,
 * leftover race, leftover reflex, leftover dewet, leftover fizeau,
 * leftover ltsh, leftover flywheel, leftover icicle, leftover
 * haidinger, gift, buy, digital eligibility, or tote keys.
 * Host is `mdb-scratched-lp` only. Mixtape, jewels, liner, gift,
 * zine, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const ECCENTRIC_STORAGE_KEY = "iss:eccentric-listing-ids";
export const ECCENTRIC_COOKIE_NAME = "iss-eccentric-listing-ids";
export const ECCENTRIC_CHANGED_EVENT = "iss:eccentric-changed";

export const ECCENTRIC_HOST_ID = "mdb-scratched-lp";
export const ECCENTRIC_MIXTAPE_ID = "mdb-mixtape-93";
export const ECCENTRIC_JEWELS_ID = "mdb-jewel-stack";
export const ECCENTRIC_LINER_ID = "dl-crate-side-a";
export const ECCENTRIC_CHAIR_ID = "ysk-folding-chair";
export const ECCENTRIC_GIFT_ID = "dl-mall-gift-card";
export const ECCENTRIC_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const ECCENTRIC_OWNED_IDS = [
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

const ownedSet = new Set<string>(ECCENTRIC_OWNED_IDS);

export const ECCENTRIC_REFUSE_COPY = "That one does not take an eccentric note.";
export const ECCENTRIC_TABLE_LINE = "I will not eccentric it.";
export const ECCENTRIC_SKIP_LINE = "Still a skip.";
export const ECCENTRIC_UNNAMED_LINE = "Still unnamed.";
export const ECCENTRIC_NOTICE_TITLE =
  "I will not eccentric it. Still a skip. Still unnamed.";
export const ECCENTRIC_WALK_LINE =
  "Walkers still want Crate to eccentric it, or shop-recenter the hole so the unnamed LP tracks without a shop mistrack.";
export const ECCENTRIC_STAYS_LINE =
  "This is the eccentric note. I will not eccentric it. Still a skip. Still unnamed.";
export const ECCENTRIC_STILL_LINE =
  "Still tote. Not mistrack. Not rake. Not a shop. Not vacuum.";
export const ECCENTRIC_TOTE_LINE = "Add to tote still works.";
export const ECCENTRIC_EMPTY_LINE = "Nobody taped an eccentric note yet.";
export const ECCENTRIC_LEAVE_LINE = "Leave the eccentric";

const SERVER_STORE = Symbol.for("iss.eccentric-listing-ids");

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

export function parseEccentricListingIds(
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

export function eccentricCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const ECCENTRIC_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${ECCENTRIC_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(ECCENTRIC_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(ECCENTRIC_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${ECCENTRIC_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseEccentricListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readEccentricListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(ECCENTRIC_STORAGE_KEY);
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
          window.localStorage.setItem(ECCENTRIC_STORAGE_KEY, JSON.stringify(ids));
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

export function writeEccentricListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = eccentricCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(ECCENTRIC_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${ECCENTRIC_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(ECCENTRIC_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingEccentricOverlay(
  listingId: string,
  listingIds: readonly string[] = readEccentricListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === ECCENTRIC_MIXTAPE_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === ECCENTRIC_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === ECCENTRIC_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LP only. Mixtape, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeEccentric(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== ECCENTRIC_HOST_ID) {
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

export type EccentricWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

function refuseEccentric(
  listing: Listing | undefined,
): EccentricWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== ECCENTRIC_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingEccentric(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseEccentric(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingEccentric(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseEccentric(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeEccentric(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === ECCENTRIC_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(ECCENTRIC_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ECCENTRIC_CHANGED_EVENT, listener);
  };
}
