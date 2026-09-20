/**
 * I will not tombstone it — the Game Boy stays cracked. Still tote.
 *
 * Squeegee is pull-the-paste (on main). Dam is lay-the-wall (on main).
 * Globtop is blob-the-die (on main). Acf is lay-the-film (on main).
 * Soak is hold-the-soak (on main). Hotbar is pulse-bond-the-flex
 * (on main). Pogo is spring-the-pads (on main). Underfill is
 * flood-the-epoxy (on main). Reball is put-new-spheres (on main).
 * Walkers still want Half-Working to tombstone it, or “rework the
 * standing joint so Tetris reads printed without a shop squeegee.”
 * I will not tombstone it. Still a crack. Still Tetris. Still for
 * sale. Not squeegee. Not dam. Not a shop. Not underfill. Not
 * globtop. Not acf. Not soak. Not hotbar. Not pogo. Not reball.
 * Not fillet. Not clock. Not reflow. Not depanel. Not nozzle.
 * Not fiducial. Not vcut. Not mousebite. Not ict. Not spi.
 * Not xray. Not hotair. Not rework. Not pnp. Not qfn. Not
 * selective. Not stencil. Not paste. Not hasl. Not aoi. Not
 * void. Not wave.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:tombstone-listing-ids` is the client tombstone set.
 * Cookie `iss-tombstone-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write squeegee, dam, globtop, acf, soak, hotbar, pogo,
 * underfill, reball, fillet, clock, reflow, flux, tin, depanel,
 * nozzle, fiducial, vcut, mousebite, ict, spi, xray, hotair,
 * rework, pnp, qfn, selective, stencil, paste, hasl, aoi, void,
 * wave, gift, buy, digital eligibility, or tote keys.
 * Host is `gtk-game-boy` only. Drawer, lid, LUT, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const TOMBSTONE_STORAGE_KEY = "iss:tombstone-listing-ids";
export const TOMBSTONE_COOKIE_NAME = "iss-tombstone-listing-ids";
export const TOMBSTONE_CHANGED_EVENT = "iss:tombstone-changed";

export const TOMBSTONE_HOST_ID = "gtk-game-boy";
export const TOMBSTONE_DRAWER_ID = "gtk-cable-drawer";
export const TOMBSTONE_LID_ID = "kdr-lid-no-pot";
export const TOMBSTONE_LUT_ID = "dl-camera-luts";
export const TOMBSTONE_ZINE_ID = "dl-stain-zine";
export const TOMBSTONE_CHAIR_ID = "ysk-folding-chair";
export const TOMBSTONE_GIFT_ID = "dl-mall-gift-card";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const TOMBSTONE_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "mdb-scratched-lp",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-camera-luts",
  "dl-drawer-recipes",
  "dl-crate-side-a",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
] as const;

export const TOMBSTONE_REFUSE_COPY = "That one does not take a tombstone note.";
export const TOMBSTONE_TABLE_LINE = "I will not tombstone it.";
export const TOMBSTONE_CRACK_LINE = "Still a crack.";
export const TOMBSTONE_TETRIS_LINE = "Still Tetris.";
export const TOMBSTONE_NOTICE_TITLE =
  "I will not tombstone it. Still a crack. Still Tetris.";
export const TOMBSTONE_WALK_LINE =
  "Walkers still want Half-Working to tombstone it, or rework the standing joint so Tetris reads printed without a shop squeegee.";
export const TOMBSTONE_STAYS_LINE =
  "This is the tombstone note. I will not tombstone it. Still a crack. Still Tetris.";
export const TOMBSTONE_STILL_LINE =
  "Still tote. Not squeegee. Not dam. Not a shop. Not underfill.";
export const TOMBSTONE_TOTE_LINE = "Add to tote still works.";
export const TOMBSTONE_EMPTY_LINE = "Nobody taped a tombstone note yet.";
export const TOMBSTONE_LEAVE_LINE = "Leave the joint";

const SERVER_STORE = Symbol.for("iss.tombstone-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(TOMBSTONE_OWNED_IDS);

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

export function parseTombstoneListingIds(
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

export function tombstoneCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const TOMBSTONE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${TOMBSTONE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(TOMBSTONE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(TOMBSTONE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${TOMBSTONE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseTombstoneListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readTombstoneListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(TOMBSTONE_STORAGE_KEY);
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
          window.localStorage.setItem(
            TOMBSTONE_STORAGE_KEY,
            JSON.stringify(ids),
          );
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

export function writeTombstoneListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = tombstoneCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(TOMBSTONE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${TOMBSTONE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(TOMBSTONE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingTombstoneOverlay(
  listingId: string,
  listingIds: readonly string[] = readTombstoneListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isDrawerListing(listing: Listing) {
  return listing.id === TOMBSTONE_DRAWER_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === TOMBSTONE_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === TOMBSTONE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host Game Boy only. Drawer, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeTombstone(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== TOMBSTONE_HOST_ID) {
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

export type TombstoneWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "drawer"
  | "lid"
  | "chair"
  | "owned";

function refuseTombstone(listing: Listing | undefined): TombstoneWriteReason | null {
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
  if (isChairListing(listing)) {
    return "chair";
  }
  if (!isPhysicalListing(listing)) {
    return "digital";
  }
  if (isDrawerListing(listing)) {
    return "drawer";
  }
  if (isLidListing(listing)) {
    return "lid";
  }
  if (isOwnedListing(listing) || listing.id !== TOMBSTONE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingTombstone(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTombstone(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingTombstone(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTombstone(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeTombstone(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === TOMBSTONE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(TOMBSTONE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TOMBSTONE_CHANGED_EVENT, listener);
  };
}
