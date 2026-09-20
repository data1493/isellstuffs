/**
 * I will not pivot it — the unnamed LP still skips. Still unnamed.
 *
 * Dashpot is fill-the-damper (on main). Gimbal is set-the-bearings
 * (on main). Antiskate is set-the-pull (on main). Rumble is
 * filter-the-rumble (on main). Vta is set-the-arm-height (on main).
 * Riaa is drop-the-curve (on main). Vacuum is clean-the-groove
 * (on main). Zenith is twist-the-cartridge (on main). Overhang is
 * set-Baerwald (on main). Walkers still want Crate to pivot it, or
 * “seat shop pivot so the unnamed LP tracks without a shop dashpot.”
 * I will not pivot it. Still a skip. Still unnamed. Still for sale.
 * Not dashpot. Not gimbal. Not a shop. Not vacuum. Not antiskate.
 * Not rumble. Not vta. Not riaa. Not zenith. Not overhang. Not
 * retip. Not azimuth. Not nabs. Not stylus. Not cartridge. Not
 * sra. Not loading. Not stepup. Not skating. Not innergroove.
 * Not antiweight. Not counterweight. Not tonearm. Not fluid.
 * Not silicone. Not damper. Not compliance. Not offset. Not
 * hum. Not isolation. Not subsonic. Not wow. Not vtf. Not sral.
 * Not unipivot. Not yoke. Not knifeedge. Not cantilever.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:pivot-listing-ids` is the client pivot set.
 * Cookie `iss-pivot-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write dashpot, gimbal, antiskate, rumble, vta, riaa, vacuum,
 * zenith, overhang, retip, azimuth, nabs, flutter, torque, relap,
 * bias, stylus, cartridge, sra, loading, stepup, skating,
 * innergroove, antiweight, counterweight, tonearm, fluid, silicone,
 * damper, compliance, offset, hum, isolation, subsonic, wow, vtf,
 * sral, unipivot, yoke, knifeedge, cantilever, gift, buy, digital
 * eligibility, or tote keys.
 * Host is `mdb-scratched-lp` only. Mixtape, jewels, liner, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const PIVOT_STORAGE_KEY = "iss:pivot-listing-ids";
export const PIVOT_COOKIE_NAME = "iss-pivot-listing-ids";
export const PIVOT_CHANGED_EVENT = "iss:pivot-changed";

export const PIVOT_HOST_ID = "mdb-scratched-lp";
export const PIVOT_MIXTAPE_ID = "mdb-mixtape-93";
export const PIVOT_JEWELS_ID = "mdb-jewel-stack";
export const PIVOT_LINER_ID = "dl-crate-side-a";
export const PIVOT_CHAIR_ID = "ysk-folding-chair";
export const PIVOT_GIFT_ID = "dl-mall-gift-card";
export const PIVOT_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const PIVOT_OWNED_IDS = [
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

const ownedSet = new Set<string>(PIVOT_OWNED_IDS);

export const PIVOT_REFUSE_COPY = "That one does not take a pivot note.";
export const PIVOT_TABLE_LINE = "I will not pivot it.";
export const PIVOT_SKIP_LINE = "Still a skip.";
export const PIVOT_UNNAMED_LINE = "Still unnamed.";
export const PIVOT_NOTICE_TITLE =
  "I will not pivot it. Still a skip. Still unnamed.";
export const PIVOT_WALK_LINE =
  "Walkers still want Crate to pivot it, or seat shop pivot so the unnamed LP tracks without a shop dashpot.";
export const PIVOT_STAYS_LINE =
  "This is the pivot note. I will not pivot it. Still a skip. Still unnamed.";
export const PIVOT_STILL_LINE =
  "Still tote. Not dashpot. Not gimbal. Not a shop. Not vacuum.";
export const PIVOT_TOTE_LINE = "Add to tote still works.";
export const PIVOT_EMPTY_LINE = "Nobody taped a pivot note yet.";
export const PIVOT_LEAVE_LINE = "Leave the pivot";

const SERVER_STORE = Symbol.for("iss.pivot-listing-ids");

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

export function parsePivotListingIds(
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

export function pivotCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const PIVOT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PIVOT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(PIVOT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PIVOT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${PIVOT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePivotListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readPivotListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(PIVOT_STORAGE_KEY);
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
          window.localStorage.setItem(PIVOT_STORAGE_KEY, JSON.stringify(ids));
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

export function writePivotListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = pivotCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PIVOT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PIVOT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(PIVOT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingPivotOverlay(
  listingId: string,
  listingIds: readonly string[] = readPivotListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === PIVOT_MIXTAPE_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === PIVOT_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === PIVOT_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LP only. Mixtape, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapePivot(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== PIVOT_HOST_ID) {
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

export type PivotWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

function refusePivot(listing: Listing | undefined): PivotWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== PIVOT_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingPivot(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePivot(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingPivot(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePivot(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribePivot(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PIVOT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PIVOT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PIVOT_CHANGED_EVENT, listener);
  };
}
