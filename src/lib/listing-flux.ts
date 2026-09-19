/**
 * I will not flux them — the drawer stays a tangle. Still tote.
 *
 * Tin is solder-the-copper. Braid is plait-the-tangle. Ferrite is
 * the bead. Coil is the pile. Walkers still want Half-Working to
 * flux the pile, or “rosin the copper so a jumper would take.” I
 * will not flux them. Still a tangle. Still untested. Still for
 * sale. Not tin. Not jumper. Not braid. Not a shop.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:flux-listing-ids` is the client flux set.
 * Cookie `iss-flux-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write tin, braid, ferrite, coil, pile, jumper, crimp, label,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `gtk-cable-drawer` only. Game Boy, lid, pack, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const FLUX_STORAGE_KEY = "iss:flux-listing-ids";
export const FLUX_COOKIE_NAME = "iss-flux-listing-ids";
export const FLUX_CHANGED_EVENT = "iss:flux-changed";

export const FLUX_HOST_ID = "gtk-cable-drawer";
export const FLUX_BOY_ID = "gtk-game-boy";
export const FLUX_LID_ID = "kdr-lid-no-pot";
export const FLUX_PACK_ID = "dl-sample-pack";
export const FLUX_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const FLUX_OWNED_IDS = [
  FLUX_BOY_ID,
  FLUX_LID_ID,
  FLUX_PACK_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "mdb-scratched-lp",
  "ysk-burned-cdr",
  "dl-booth-font",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "dl-junk-pricing-pdf",
  "dl-camera-luts",
  "dl-drawer-recipes",
  "dl-crate-side-a",
] as const;

const ownedSet = new Set<string>(FLUX_OWNED_IDS);

export const FLUX_REFUSE_COPY = "That one does not take a flux note.";
export const FLUX_TABLE_LINE = "I will not flux them.";
export const FLUX_TANGLE_LINE = "Still a tangle.";
export const FLUX_UNTESTED_LINE = "Still untested.";
export const FLUX_NOTICE_TITLE =
  "I will not flux them. Still a tangle. Still untested.";
export const FLUX_WALK_LINE =
  "Walkers still want Half-Working to flux the pile, or rosin the copper so a jumper would take.";
export const FLUX_STAYS_LINE =
  "This is the flux note. I will not flux them. Still a tangle. Still untested.";
export const FLUX_STILL_LINE =
  "Still tote. Not tin. Not jumper. Not a shop. Not braid.";
export const FLUX_TOTE_LINE = "Add to tote still works.";
export const FLUX_EMPTY_LINE = "Nobody taped a flux note yet.";
export const FLUX_LEAVE_LINE = "Leave the copper";

const SERVER_STORE = Symbol.for("iss.flux-listing-ids");

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

export function parseFluxListingIds(
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

export function fluxCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const FLUX_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${FLUX_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(FLUX_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(FLUX_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${FLUX_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseFluxListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readFluxListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(FLUX_STORAGE_KEY);
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
          window.localStorage.setItem(FLUX_STORAGE_KEY, JSON.stringify(ids));
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

export function writeFluxListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = fluxCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(FLUX_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${FLUX_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(FLUX_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingFluxOverlay(
  listingId: string,
  listingIds: readonly string[] = readFluxListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isBoyListing(listing: Listing) {
  return listing.id === FLUX_BOY_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === FLUX_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === FLUX_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host drawer only. Game Boy, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeFlux(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== FLUX_HOST_ID) {
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

export type FluxWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "boy"
  | "lid"
  | "chair"
  | "owned";

function refuseFlux(
  listing: Listing | undefined,
): FluxWriteReason | null {
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
  if (isBoyListing(listing)) {
    return "boy";
  }
  if (isLidListing(listing)) {
    return "lid";
  }
  if (isOwnedListing(listing) || listing.id !== FLUX_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingFlux(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFlux(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingFlux(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFlux(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeFlux(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === FLUX_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(FLUX_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FLUX_CHANGED_EVENT, listener);
  };
}
