/**
 * I will not rake it — the unnamed LP still skips. Still unnamed.
 *
 * Resonance is tune-the-arm (on main). Pivot is seat-the-pivot
 * (on main). Dashpot is fill-the-damper (on main). Gimbal is
 * set-the-bearings (on main). Antiskate is set-the-pull (on
 * main). Rumble is filter-the-rumble (on main). Vta is
 * set-the-arm-height (on main). Riaa is drop-the-curve (on
 * main). Vacuum is clean-the-groove (on main). Zenith is
 * twist-the-cartridge (on main). Overhang is set-Baerwald
 * (on main). Walkers still want Crate to rake it, or
 * “set shop stylus rake so the unnamed LP tracks without a
 * shop resonance.” I will not rake it. Still a skip. Still
 * unnamed. Still for sale. Not resonance. Not pivot. Not a
 * shop. Not vacuum. Not dashpot. Not gimbal. Not antiskate.
 * Not rumble. Not vta. Not riaa. Not zenith. Not overhang.
 * Not retip. Not azimuth. Not nabs. Not stylus. Not
 * cartridge. Not sra. Not loading. Not stepup. Not skating.
 * Not innergroove. Not antiweight. Not counterweight. Not
 * tonearm. Not fluid. Not silicone. Not damper. Not
 * compliance. Not offset. Not hum. Not isolation. Not
 * subsonic. Not wow. Not vtf. Not sral. Not unipivot. Not
 * yoke. Not knifeedge. Not cantilever. Not loefgren. Not
 * microline. Not elliptic. Not acetate. Not armmass. Not
 * iec. Not null. Not two-point.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:rake-listing-ids` is the client set.
 * Cookie `iss-rake-listing-ids` is the same JSON so PDPs SSR
 * the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write resonance, pivot, dashpot, gimbal, antiskate, rumble,
 * vta, riaa, vacuum, zenith, overhang, retip, azimuth, nabs,
 * flutter, torque, relap, bias, stylus, cartridge, sra, loading,
 * stepup, skating, innergroove, antiweight, counterweight, tonearm,
 * fluid, silicone, damper, compliance, offset, hum, isolation,
 * subsonic, wow, vtf, sral, unipivot, yoke, knifeedge, cantilever,
 * frost, billboard, hmtx, bsln, thrust, reflex, pillow, fringe,
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

export const RAKE_STORAGE_KEY = "iss:rake-listing-ids";
export const RAKE_COOKIE_NAME = "iss-rake-listing-ids";
export const RAKE_CHANGED_EVENT = "iss:rake-changed";

export const RAKE_HOST_ID = "mdb-scratched-lp";
export const RAKE_MIXTAPE_ID = "mdb-mixtape-93";
export const RAKE_JEWELS_ID = "mdb-jewel-stack";
export const RAKE_LINER_ID = "dl-crate-side-a";
export const RAKE_CHAIR_ID = "ysk-folding-chair";
export const RAKE_GIFT_ID = "dl-mall-gift-card";
export const RAKE_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const RAKE_OWNED_IDS = [
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

const ownedSet = new Set<string>(RAKE_OWNED_IDS);

export const RAKE_REFUSE_COPY = "That one does not take a rake note.";
export const RAKE_TABLE_LINE = "I will not rake it.";
export const RAKE_SKIP_LINE = "Still a skip.";
export const RAKE_UNNAMED_LINE = "Still unnamed.";
export const RAKE_NOTICE_TITLE =
  "I will not rake it. Still a skip. Still unnamed.";
export const RAKE_WALK_LINE =
  "Walkers still want Crate to rake it, or set shop stylus rake so the unnamed LP tracks without a shop resonance.";
export const RAKE_STAYS_LINE =
  "This is the rake note. I will not rake it. Still a skip. Still unnamed.";
export const RAKE_STILL_LINE =
  "Still tote. Not resonance. Not pivot. Not a shop. Not vacuum.";
export const RAKE_TOTE_LINE = "Add to tote still works.";
export const RAKE_EMPTY_LINE = "Nobody taped a rake note yet.";
export const RAKE_LEAVE_LINE = "Leave the rake";

const SERVER_STORE = Symbol.for("iss.rake-listing-ids");

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

export function parseRakeListingIds(
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

export function rakeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const RAKE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${RAKE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(RAKE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(RAKE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${RAKE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseRakeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readRakeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(RAKE_STORAGE_KEY);
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
          window.localStorage.setItem(RAKE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeRakeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = rakeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(RAKE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${RAKE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(RAKE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingRakeOverlay(
  listingId: string,
  listingIds: readonly string[] = readRakeListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === RAKE_MIXTAPE_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === RAKE_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === RAKE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LP only. Mixtape, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeRake(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== RAKE_HOST_ID) {
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

export type RakeWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

function refuseRake(
  listing: Listing | undefined,
): RakeWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== RAKE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingRake(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseRake(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingRake(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseRake(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeRake(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === RAKE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(RAKE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RAKE_CHANGED_EVENT, listener);
  };
}
