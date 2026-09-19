/**
 * I will not rivet it — the lamp stays optional and in the box.
 * Still tote.
 *
 * Grommet is the shade-hole. Collar is the shade-ring. Harp is
 * the stall finial. Box is shade-in-the-box. Walkers still want
 * Tuesday to rivet the lamp, or “pin the shade so optional stays
 * on.” I will not rivet it. Still optional. Still in the box.
 * Still for sale. Not grommet. Not collar. Not harp.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:rivet-listing-ids` is the client rivet set.
 * Cookie `iss-rivet-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write grommet, collar, harp, box, twist, led, kit, gift,
 * buy, digital eligibility, or tote keys.
 * Host is `ysk-wobbly-lamp` only. Chair, junk PDF, burned CD-R,
 * gift, zine, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const RIVET_STORAGE_KEY = "iss:rivet-listing-ids";
export const RIVET_COOKIE_NAME = "iss-rivet-listing-ids";
export const RIVET_CHANGED_EVENT = "iss:rivet-changed";

export const RIVET_HOST_ID = "ysk-wobbly-lamp";
export const RIVET_CHAIR_ID = "ysk-folding-chair";
export const RIVET_DISC_ID = "ysk-burned-cdr";
export const RIVET_JUNK_ID = "dl-junk-pricing-pdf";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const RIVET_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "dl-drawer-recipes",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
] as const;

export const RIVET_REFUSE_COPY = "That one does not take a rivet note.";
export const RIVET_TABLE_LINE = "I will not rivet it.";
export const RIVET_OPTIONAL_LINE = "Still optional.";
export const RIVET_BOX_LINE = "Still in the box.";
export const RIVET_NOTICE_TITLE =
  "I will not rivet it. Still optional. Still in the box.";
export const RIVET_WALK_LINE =
  "Walkers still want Tuesday to rivet the lamp, or pin the shade so optional stays on.";
export const RIVET_STAYS_LINE =
  "This is the rivet note. I will not rivet it. Still optional. Still in the box.";
export const RIVET_STILL_LINE =
  "Still tote. Not grommet. Not collar. Not a shop. Not harp.";
export const RIVET_TOTE_LINE = "Add to tote still works.";
export const RIVET_EMPTY_LINE = "Nobody taped a rivet note yet.";
export const RIVET_LEAVE_LINE = "Leave the shade";

const SERVER_STORE = Symbol.for("iss.rivet-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(RIVET_OWNED_IDS);

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

export function parseRivetListingIds(
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

export function rivetCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const RIVET_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${RIVET_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(RIVET_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(RIVET_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${RIVET_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseRivetListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readRivetListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(RIVET_STORAGE_KEY);
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
          window.localStorage.setItem(RIVET_STORAGE_KEY, JSON.stringify(ids));
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

export function writeRivetListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = rivetCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(RIVET_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${RIVET_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(RIVET_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingRivetOverlay(
  listingId: string,
  listingIds: readonly string[] = readRivetListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isChairListing(listing: Listing) {
  return listing.id === RIVET_CHAIR_ID;
}

function isDiscListing(listing: Listing) {
  return listing.id === RIVET_DISC_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host lamp only. Chair, CD-R, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeRivet(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== RIVET_HOST_ID) {
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

export type RivetWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "chair"
  | "disc"
  | "owned";

function refuseRivet(
  listing: Listing | undefined,
): RivetWriteReason | null {
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
  if (isDiscListing(listing)) {
    return "disc";
  }
  if (isOwnedListing(listing) || listing.id !== RIVET_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingRivet(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseRivet(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingRivet(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseRivet(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeRivet(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === RIVET_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(RIVET_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RIVET_CHANGED_EVENT, listener);
  };
}
