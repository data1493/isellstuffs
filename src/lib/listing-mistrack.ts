/**
 * I will not mistrack it — the unnamed LP still skips. Still unnamed.
 *
 * Rake is set-shop-stylus-rake (queued / leftover — do not own).
 * Resonance is tune-the-arm (leftover — do not own). Pivot is
 * seat-the-pivot (leftover). Dashpot is fill-the-damper (leftover).
 * Gimbal is set-the-bearings (leftover). Antiskate is set-the-pull
 * (leftover). Rumble is filter-the-rumble (leftover). Vta is
 * set-the-arm-height (leftover). Riaa is drop-the-curve (leftover).
 * Vacuum is clean-the-groove (on main). Zenith is twist-the-cartridge
 * (on main). Overhang is set-Baerwald (on main). Walkers still want
 * Crate to mistrack it, or “shop-mistrack so the unnamed LP tracks
 * without a shop rake.” I will not mistrack it. Still a skip. Still
 * unnamed. Still for sale. Not rake. Not resonance. Not a shop. Not
 * vacuum. Not pivot. Not dashpot. Not gimbal. Not antiskate. Not
 * rumble. Not vta. Not riaa. Not zenith. Not overhang. Not retip.
 * Not azimuth. Not nabs. Not flutter. Not torque. Not relap. Not
 * stylus. Not cartridge. Not sra. Not sibilance. Not shibata.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:mistrack-listing-ids` is the client set.
 * Cookie `iss-mistrack-listing-ids` is the same JSON so PDPs SSR
 * the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write rake, resonance, pivot, dashpot, gimbal, antiskate,
 * rumble, vta, riaa, vacuum, zenith, overhang, retip, azimuth, nabs,
 * flutter, torque, relap, bias, frost, billboard, pillow, fringe,
 * opbd, race, gift, buy, digital eligibility, or tote keys.
 * Host is `mdb-scratched-lp` only. Mixtape, jewels, liner, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const MISTRACK_STORAGE_KEY = "iss:mistrack-listing-ids";
export const MISTRACK_COOKIE_NAME = "iss-mistrack-listing-ids";
export const MISTRACK_CHANGED_EVENT = "iss:mistrack-changed";

export const MISTRACK_HOST_ID = "mdb-scratched-lp";
export const MISTRACK_MIXTAPE_ID = "mdb-mixtape-93";
export const MISTRACK_JEWELS_ID = "mdb-jewel-stack";
export const MISTRACK_LINER_ID = "dl-crate-side-a";
export const MISTRACK_CHAIR_ID = "ysk-folding-chair";
export const MISTRACK_GIFT_ID = "dl-mall-gift-card";
export const MISTRACK_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const MISTRACK_OWNED_IDS = [
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

const ownedSet = new Set<string>(MISTRACK_OWNED_IDS);

export const MISTRACK_REFUSE_COPY = "That one does not take a mistrack note.";
export const MISTRACK_TABLE_LINE = "I will not mistrack it.";
export const MISTRACK_SKIP_LINE = "Still a skip.";
export const MISTRACK_UNNAMED_LINE = "Still unnamed.";
export const MISTRACK_NOTICE_TITLE =
  "I will not mistrack it. Still a skip. Still unnamed.";
export const MISTRACK_WALK_LINE =
  "Walkers still want Crate to mistrack it, or shop-mistrack so the unnamed LP tracks without a shop rake.";
export const MISTRACK_STAYS_LINE =
  "This is the mistrack note. I will not mistrack it. Still a skip. Still unnamed.";
export const MISTRACK_STILL_LINE =
  "Still tote. Not rake. Not resonance. Not a shop. Not vacuum.";
export const MISTRACK_TOTE_LINE = "Add to tote still works.";
export const MISTRACK_EMPTY_LINE = "Nobody taped a mistrack note yet.";
export const MISTRACK_LEAVE_LINE = "Leave the mistrack";

const SERVER_STORE = Symbol.for("iss.mistrack-listing-ids");

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

export function parseMistrackListingIds(
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

export function mistrackCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const MISTRACK_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${MISTRACK_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(MISTRACK_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(MISTRACK_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${MISTRACK_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseMistrackListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readMistrackListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(MISTRACK_STORAGE_KEY);
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
          window.localStorage.setItem(MISTRACK_STORAGE_KEY, JSON.stringify(ids));
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

export function writeMistrackListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = mistrackCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(MISTRACK_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${MISTRACK_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(MISTRACK_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingMistrackOverlay(
  listingId: string,
  listingIds: readonly string[] = readMistrackListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === MISTRACK_MIXTAPE_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === MISTRACK_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === MISTRACK_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LP only. Mixtape, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeMistrack(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== MISTRACK_HOST_ID) {
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

export type MistrackWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

function refuseMistrack(
  listing: Listing | undefined,
): MistrackWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== MISTRACK_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingMistrack(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseMistrack(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingMistrack(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseMistrack(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeMistrack(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === MISTRACK_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(MISTRACK_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(MISTRACK_CHANGED_EVENT, listener);
  };
}
