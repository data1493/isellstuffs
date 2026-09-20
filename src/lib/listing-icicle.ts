/**
 * I will not icicle it — the Game Boy stays cracked. Still tote.
 *
 * Dewet is pull-the-wetting-back (on main — do not own).
 * Pillow is leave-the-BGA-head-in-pillow (on main — do not own).
 * Billboard is stand-the-long-edge (on main — do not own).
 * Tombstone is rework-the-standing-joint (on main — do not own).
 * Squeegee is pull-the-paste (on main — do not own).
 * Dam is lay-the-wall (on main — do not own).
 * Globtop is blob-the-die (on main — do not own).
 * Acf is lay-the-film (on main — do not own).
 * Soak is hold-the-soak (on main — do not own).
 * Hotbar is pulse-bond-the-flex (on main — do not own).
 * Pogo is spring-the-pads (on main). Underfill is flood-the-epoxy
 * (on main). Reball is put-new-spheres (on main). Fillet is
 * leave-the-toe (on main). Walkers still want Half-Working to
 * icicle it, or “shop-icicle the joint so Tetris reads printed
 * without a shop dewet.”
 * I will not icicle it. Still a crack. Still Tetris. Still for
 * sale. Not dewet. Not pillow. Not a shop. Not underfill.
 * Not billboard. Not tombstone. Not squeegee. Not dam. Not
 * globtop. Not acf. Not soak. Not hotbar. Not pogo. Not reball.
 * Not fillet. Not clock. Not reflow. Not depanel. Not nozzle.
 * Not fiducial. Not vcut. Not mousebite. Not ict. Not spi. Not
 * xray. Not hotair. Not rework. Not pnp. Not qfn. Not selective.
 * Not stencil. Not paste. Not hasl. Not aoi. Not void. Not wave.
 * Not grape. Not graping. Not drawbridge. Not hip. Not webbing.
 * Not slump. Not scoop. Not popcorn. Not kirkendall. Not
 * viafill. Not nonwet. Not dewetting. Not wetout. Not bridging.
 * Not midchip. Not satellite. Not osp. Not enig. Not imc. Not
 * nitrogen. Not aperture.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:icicle-listing-ids` is the client icicle set.
 * Cookie `iss-icicle-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write leftover dewet, leftover pillow, leftover fringe,
 * leftover rake, leftover opbd, leftover race, leftover mistrack,
 * leftover fizeau, leftover frost, leftover billboard, leftover
 * reflex, leftover ltsh, leftover flywheel, tombstone, squeegee,
 * dam, globtop, acf, soak, hotbar, pogo, underfill, reball,
 * fillet, clock, reflow, flux, tin, depanel, nozzle, fiducial,
 * vcut, mousebite, ict, spi, xray, hotair, rework, pnp, qfn,
 * selective, stencil, paste, hasl, aoi, void, wave, grape, hip,
 * gift, buy, digital eligibility, or tote keys. Host is
 * `gtk-game-boy` only. Drawer, lid, LUT, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const ICICLE_STORAGE_KEY = "iss:icicle-listing-ids";
export const ICICLE_COOKIE_NAME = "iss-icicle-listing-ids";
export const ICICLE_CHANGED_EVENT = "iss:icicle-changed";

export const ICICLE_HOST_ID = "gtk-game-boy";
export const ICICLE_DRAWER_ID = "gtk-cable-drawer";
export const ICICLE_LID_ID = "kdr-lid-no-pot";
export const ICICLE_LUT_ID = "dl-camera-luts";
export const ICICLE_ZINE_ID = "dl-stain-zine";
export const ICICLE_CHAIR_ID = "ysk-folding-chair";
export const ICICLE_GIFT_ID = "dl-mall-gift-card";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const ICICLE_OWNED_IDS = [
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

export const ICICLE_REFUSE_COPY = "That one does not take an icicle note.";
export const ICICLE_TABLE_LINE = "I will not icicle it.";
export const ICICLE_CRACK_LINE = "Still a crack.";
export const ICICLE_TETRIS_LINE = "Still Tetris.";
export const ICICLE_NOTICE_TITLE =
  "I will not icicle it. Still a crack. Still Tetris.";
export const ICICLE_WALK_LINE =
  "Walkers still want Half-Working to icicle it, or shop-icicle the joint so Tetris reads printed without a shop dewet.";
export const ICICLE_STAYS_LINE =
  "This is the icicle note. I will not icicle it. Still a crack. Still Tetris.";
export const ICICLE_STILL_LINE =
  "Still tote. Not dewet. Not pillow. Not a shop. Not underfill.";
export const ICICLE_TOTE_LINE = "Add to tote still works.";
export const ICICLE_EMPTY_LINE = "Nobody taped an icicle note yet.";
export const ICICLE_LEAVE_LINE = "Leave the icicle";

const SERVER_STORE = Symbol.for("iss.icicle-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(ICICLE_OWNED_IDS);

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

export function parseIcicleListingIds(
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

export function icicleCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const ICICLE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${ICICLE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(ICICLE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(ICICLE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${ICICLE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseIcicleListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readIcicleListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(ICICLE_STORAGE_KEY);
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
            ICICLE_STORAGE_KEY,
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

export function writeIcicleListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = icicleCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(ICICLE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${ICICLE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(ICICLE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingIcicleOverlay(
  listingId: string,
  listingIds: readonly string[] = readIcicleListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isDrawerListing(listing: Listing) {
  return listing.id === ICICLE_DRAWER_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === ICICLE_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === ICICLE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host Game Boy only. Drawer, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeIcicle(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== ICICLE_HOST_ID) {
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

export type IcicleWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "drawer"
  | "lid"
  | "chair"
  | "owned";

function refuseIcicle(listing: Listing | undefined): IcicleWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== ICICLE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingIcicle(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseIcicle(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingIcicle(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseIcicle(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeIcicle(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === ICICLE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(ICICLE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ICICLE_CHANGED_EVENT, listener);
  };
}
