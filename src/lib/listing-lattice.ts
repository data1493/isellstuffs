/**
 * I will not lattice them — the LUT pack stays a parking lot, still fluorescent.
 * Still tote.
 *
 * Posterize is flatten-the-looks. Gamma is curve-the-look. Scope is
 * read-the-scopes. Cube is fourth-.cube. Shaper is 1D-LUT. Walkers
 * still want Half-Working to lattice them, or “build a shop 3D lattice
 * so the parking-lot looks interpolate clean without a shop posterize.”
 * I will not lattice them. Still a parking lot. Still fluorescent.
 * Still for sale. Not posterize. Not gamma. Not a shop. Not cube.
 * Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:lattice-listing-ids` is the client lattice set.
 * Cookie `iss-lattice-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write posterize, gamma, scope, cube, shaper, tetra, gift, buy,
 * digital eligibility, or tote keys.
 * Host is `dl-camera-luts` only. Pack, font, Game Boy, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Lattice is interpolate the cube, not a login. No auth.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const LATTICE_STORAGE_KEY = "iss:lattice-listing-ids";
export const LATTICE_COOKIE_NAME = "iss-lattice-listing-ids";
export const LATTICE_CHANGED_EVENT = "iss:lattice-changed";

export const LATTICE_HOST_ID = "dl-camera-luts";
export const LATTICE_PACK_ID = "dl-sample-pack";
export const LATTICE_FONT_ID = "dl-booth-font";
export const LATTICE_BOY_ID = "gtk-game-boy";
export const LATTICE_PDF_ID = "dl-junk-pricing-pdf";
export const LATTICE_GIFT_ID = "dl-mall-gift-card";
export const LATTICE_ZINE_ID = "dl-stain-zine";
export const LATTICE_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const LATTICE_OWNED_IDS = [
  LATTICE_PACK_ID,
  LATTICE_FONT_ID,
  LATTICE_BOY_ID,
  LATTICE_PDF_ID,
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

const ownedSet = new Set<string>(LATTICE_OWNED_IDS);

export const LATTICE_REFUSE_COPY = "That one does not take a lattice note.";
export const LATTICE_TABLE_LINE = "I will not lattice them.";
export const LATTICE_LOT_LINE = "Still a parking lot.";
export const LATTICE_FLUOR_LINE = "Still fluorescent.";
export const LATTICE_NOTICE_TITLE =
  "I will not lattice them. Still a parking lot. Still fluorescent.";
export const LATTICE_WALK_LINE =
  "Walkers still want Half-Working to lattice them, or build a shop 3D lattice so the parking-lot looks interpolate clean without a shop posterize.";
export const LATTICE_STAYS_LINE =
  "This is the lattice note. I will not lattice them. Still a parking lot. Still fluorescent.";
export const LATTICE_STILL_LINE =
  "Still tote. Not posterize. Not gamma. Not a shop. Not cube. Not an account.";
export const LATTICE_TOTE_LINE = "Add to tote still works.";
export const LATTICE_EMPTY_LINE = "Nobody taped a lattice note yet.";
export const LATTICE_LEAVE_LINE = "Leave the looks";

const SERVER_STORE = Symbol.for("iss.lattice-listing-ids");

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

export function parseLatticeListingIds(
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

export function latticeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const LATTICE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${LATTICE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(LATTICE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(LATTICE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${LATTICE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseLatticeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readLatticeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(LATTICE_STORAGE_KEY);
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
          window.localStorage.setItem(LATTICE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeLatticeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = latticeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(LATTICE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${LATTICE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(LATTICE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingLatticeOverlay(
  listingId: string,
  listingIds: readonly string[] = readLatticeListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === LATTICE_PACK_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === LATTICE_FONT_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === LATTICE_PDF_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LUT pack only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeLattice(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== LATTICE_HOST_ID) {
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

export type LatticeWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "font"
  | "pdf"
  | "owned";

function refuseLattice(
  listing: Listing | undefined,
): LatticeWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== LATTICE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingLattice(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseLattice(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingLattice(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseLattice(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeLattice(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === LATTICE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LATTICE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LATTICE_CHANGED_EVENT, listener);
  };
}
