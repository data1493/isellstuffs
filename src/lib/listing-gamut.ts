/**
 * I will not gamut it — the LUT pack stays a parking lot, still fluorescent.
 * Still tote.
 *
 * Posterize is flatten-the-looks. Gamma is curve-the-look. Lattice is
 * interpolate-the-cube. Scope is read-the-scopes. Cube is fourth-.cube.
 * Walkers still want Half-Working to gamut it, or “map the parking-lot
 * primaries so fluorescent reads shop-legal without a shop posterize.”
 * I will not gamut it. Still a parking lot. Still fluorescent.
 * Still for sale. Not posterize. Not gamma. Not a shop. Not lattice.
 * Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:gamut-listing-ids` is the client gamut set.
 * Cookie `iss-gamut-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write posterize, gamma, lattice, scope, cube, shaper, gift,
 * buy, digital eligibility, or tote keys.
 * Host is `dl-camera-luts` only. Pack, font, Game Boy, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Gamut is map the primaries, not a login. No auth.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const GAMUT_STORAGE_KEY = "iss:gamut-listing-ids";
export const GAMUT_COOKIE_NAME = "iss-gamut-listing-ids";
export const GAMUT_CHANGED_EVENT = "iss:gamut-changed";

export const GAMUT_HOST_ID = "dl-camera-luts";
export const GAMUT_PACK_ID = "dl-sample-pack";
export const GAMUT_FONT_ID = "dl-booth-font";
export const GAMUT_BOY_ID = "gtk-game-boy";
export const GAMUT_PDF_ID = "dl-junk-pricing-pdf";
export const GAMUT_GIFT_ID = "dl-mall-gift-card";
export const GAMUT_ZINE_ID = "dl-stain-zine";
export const GAMUT_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const GAMUT_OWNED_IDS = [
  GAMUT_PACK_ID,
  GAMUT_FONT_ID,
  GAMUT_BOY_ID,
  GAMUT_PDF_ID,
  "dl-drawer-recipes",
  "dl-crate-side-a",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "mdb-scratched-lp",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "kdr-chipped-mug",
  "kdr-bent-whisk",
  "kdr-lid-no-pot",
] as const;

const ownedSet = new Set<string>(GAMUT_OWNED_IDS);

export const GAMUT_REFUSE_COPY = "That one does not take a gamut note.";
export const GAMUT_TABLE_LINE = "I will not gamut it.";
export const GAMUT_LOT_LINE = "Still a parking lot.";
export const GAMUT_FLUOR_LINE = "Still fluorescent.";
export const GAMUT_NOTICE_TITLE =
  "I will not gamut it. Still a parking lot. Still fluorescent.";
export const GAMUT_WALK_LINE =
  "Walkers still want Half-Working to gamut it, or map the parking-lot primaries so fluorescent reads shop-legal without a shop posterize.";
export const GAMUT_STAYS_LINE =
  "This is the gamut note. I will not gamut it. Still a parking lot. Still fluorescent.";
export const GAMUT_STILL_LINE =
  "Still tote. Not posterize. Not gamma. Not a shop. Not lattice. Not an account.";
export const GAMUT_TOTE_LINE = "Add to tote still works.";
export const GAMUT_EMPTY_LINE = "Nobody taped a gamut note yet.";
export const GAMUT_LEAVE_LINE = "Leave the looks";

const SERVER_STORE = Symbol.for("iss.gamut-listing-ids");

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

export function parseGamutListingIds(
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

export function gamutCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GAMUT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GAMUT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GAMUT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GAMUT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GAMUT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGamutListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGamutListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GAMUT_STORAGE_KEY);
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
          window.localStorage.setItem(GAMUT_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGamutListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = gamutCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GAMUT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GAMUT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GAMUT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGamutOverlay(
  listingId: string,
  listingIds: readonly string[] = readGamutListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === GAMUT_PACK_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === GAMUT_FONT_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === GAMUT_PDF_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LUT pack only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeGamut(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== GAMUT_HOST_ID) {
    return false;
  }
  if (!isDigitalListing(listing)) {
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

export type GamutWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "font"
  | "pdf"
  | "owned";

function refuseGamut(
  listing: Listing | undefined,
): GamutWriteReason | null {
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
  if (!isDigitalListing(listing)) {
    return "physical";
  }
  if (isPackListing(listing)) {
    return "pack";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (isPdfListing(listing)) {
    return "pdf";
  }
  if (isOwnedListing(listing) || listing.id !== GAMUT_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingGamut(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGamut(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingGamut(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGamut(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeGamut(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GAMUT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GAMUT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GAMUT_CHANGED_EVENT, listener);
  };
}
