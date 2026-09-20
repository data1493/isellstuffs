/**
 * I will not billboard it — the Game Boy stays cracked. Still tote.
 *
 * Tombstone is rework-the-standing-joint (queued leftover — do not own).
 * Squeegee is pull-the-paste (queued leftover — do not own).
 * Dam is lay-the-wall (queued leftover — do not own).
 * Globtop is blob-the-die (queued leftover — do not own).
 * Acf is lay-the-film (queued leftover — do not own).
 * Soak is hold-the-soak (queued leftover — do not own).
 * Hotbar is pulse-bond-the-flex (queued leftover — do not own).
 * Pogo is spring-the-pads (on main). Underfill is flood-the-epoxy
 * (on main). Reball is put-new-spheres (on main). Walkers still
 * want Half-Working to billboard it, or “stand the chip on its
 * long edge so Tetris reads printed without a shop tombstone.”
 * I will not billboard it. Still a crack. Still Tetris. Still for
 * sale. Not tombstone. Not squeegee. Not a shop. Not underfill.
 * Not dam. Not globtop. Not acf. Not soak. Not hotbar. Not pogo.
 * Not reball. Not fillet. Not clock. Not reflow. Not depanel.
 * Not nozzle. Not fiducial. Not vcut. Not mousebite. Not ict.
 * Not spi. Not xray. Not hotair. Not rework. Not pnp. Not qfn.
 * Not selective. Not stencil. Not paste. Not hasl. Not aoi.
 * Not void. Not wave. Not grape. Not graping. Not drawbridge.
 * Not hip. Not webbing. Not slump. Not scoop. Not popcorn.
 * Not kirkendall. Not viafill.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:billboard-listing-ids` is the client billboard set.
 * Cookie `iss-billboard-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write tombstone, squeegee, dam, globtop, acf, soak, hotbar,
 * pogo, underfill, reball, fillet, clock, reflow, flux, tin, depanel,
 * nozzle, fiducial, vcut, mousebite, ict, spi, xray, hotair,
 * rework, pnp, qfn, selective, stencil, paste, hasl, aoi, void,
 * wave, grape, gift, buy, digital eligibility, or tote keys.
 * Host is `gtk-game-boy` only. Drawer, lid, LUT, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const BILLBOARD_STORAGE_KEY = "iss:billboard-listing-ids";
export const BILLBOARD_COOKIE_NAME = "iss-billboard-listing-ids";
export const BILLBOARD_CHANGED_EVENT = "iss:billboard-changed";

export const BILLBOARD_HOST_ID = "gtk-game-boy";
export const BILLBOARD_DRAWER_ID = "gtk-cable-drawer";
export const BILLBOARD_LID_ID = "kdr-lid-no-pot";
export const BILLBOARD_LUT_ID = "dl-camera-luts";
export const BILLBOARD_ZINE_ID = "dl-stain-zine";
export const BILLBOARD_CHAIR_ID = "ysk-folding-chair";
export const BILLBOARD_GIFT_ID = "dl-mall-gift-card";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const BILLBOARD_OWNED_IDS = [
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

export const BILLBOARD_REFUSE_COPY = "That one does not take a billboard note.";
export const BILLBOARD_TABLE_LINE = "I will not billboard it.";
export const BILLBOARD_CRACK_LINE = "Still a crack.";
export const BILLBOARD_TETRIS_LINE = "Still Tetris.";
export const BILLBOARD_NOTICE_TITLE =
  "I will not billboard it. Still a crack. Still Tetris.";
export const BILLBOARD_WALK_LINE =
  "Walkers still want Half-Working to billboard it, or stand the chip on its long edge so Tetris reads printed without a shop tombstone.";
export const BILLBOARD_STAYS_LINE =
  "This is the billboard note. I will not billboard it. Still a crack. Still Tetris.";
export const BILLBOARD_STILL_LINE =
  "Still tote. Not tombstone. Not squeegee. Not a shop. Not underfill.";
export const BILLBOARD_TOTE_LINE = "Add to tote still works.";
export const BILLBOARD_EMPTY_LINE = "Nobody taped a billboard note yet.";
export const BILLBOARD_LEAVE_LINE = "Leave the stand";

const SERVER_STORE = Symbol.for("iss.billboard-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(BILLBOARD_OWNED_IDS);

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

export function parseBillboardListingIds(
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

export function billboardCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BILLBOARD_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BILLBOARD_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BILLBOARD_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BILLBOARD_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BILLBOARD_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBillboardListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBillboardListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BILLBOARD_STORAGE_KEY);
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
            BILLBOARD_STORAGE_KEY,
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

export function writeBillboardListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = billboardCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BILLBOARD_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BILLBOARD_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BILLBOARD_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBillboardOverlay(
  listingId: string,
  listingIds: readonly string[] = readBillboardListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isDrawerListing(listing: Listing) {
  return listing.id === BILLBOARD_DRAWER_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === BILLBOARD_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === BILLBOARD_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host Game Boy only. Drawer, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeBillboard(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== BILLBOARD_HOST_ID) {
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

export type BillboardWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "drawer"
  | "lid"
  | "chair"
  | "owned";

function refuseBillboard(listing: Listing | undefined): BillboardWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== BILLBOARD_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingBillboard(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBillboard(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingBillboard(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBillboard(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeBillboard(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BILLBOARD_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BILLBOARD_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BILLBOARD_CHANGED_EVENT, listener);
  };
}
