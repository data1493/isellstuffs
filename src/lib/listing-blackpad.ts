/**
 * I will not blackpad it — the Game Boy stays cracked. Still tote.
 *
 * Blowhole is shop-blowhole-the-joint (on main — do not own).
 * Icicle is shop-icicle-the-joint (on main — do not own).
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
 * blackpad it, or “shop-blackpad the pads so Tetris reads ENIG
 * without a shop blowhole.”
 * I will not blackpad it. Still a crack. Still Tetris. Still for
 * sale. Not blowhole. Not icicle. Not a shop. Not underfill.
 * Not dewet. Not pillow. Not billboard. Not tombstone. Not
 * squeegee. Not dam. Not globtop. Not acf. Not soak. Not hotbar.
 * Not pogo. Not reball. Not fillet. Not clock. Not reflow. Not
 * pinhole. Not outgas. Not caf. Not leach. Not wicking. Not
 * rosin. Not dross. Not barrel. Not teardrop. Not annular. Not
 * solderball. Not coldjoint. Not padlift. Not halo. Not tinpest.
 * Not purpleplague. Not holewall. Not microvia. Not backdrill.
 * Not immersion. Not hardgold. Not softgold. Not depanel. Not
 * nozzle. Not fiducial. Not vcut. Not mousebite. Not ict. Not
 * spi. Not xray. Not hotair. Not rework. Not pnp. Not qfn. Not
 * selective. Not stencil. Not paste. Not hasl. Not aoi. Not void.
 * Not wave. Not grape. Not graping. Not drawbridge. Not hip. Not
 * webbing. Not slump. Not scoop. Not popcorn. Not kirkendall.
 * Not viafill. Not nonwet. Not dewetting. Not wetout. Not
 * bridging. Not midchip. Not satellite. Not osp. Not enig. Not
 * imc. Not nitrogen. Not aperture. Not heel. Not dendrite. Not
 * crater. Not whisker. Not orange. Not measle. Not crazing. Not
 * delam. Not meniscus.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:blackpad-listing-ids` is the client blackpad set.
 * Cookie `iss-blackpad-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write leftover blowhole, leftover icicle, leftover dewet,
 * leftover pillow, leftover billboard, leftover tombstone,
 * leftover squeegee, leftover dam, leftover globtop, leftover acf,
 * leftover soak, leftover hotbar, leftover mother, leftover
 * brewster, leftover pclt, leftover eddy, leftover eccentric,
 * leftover haidinger, leftover frost, leftover reflex, leftover
 * fringe, leftover rake, leftover opbd, leftover race, leftover
 * mistrack, leftover fizeau, leftover ltsh, leftover flywheel,
 * pogo, underfill, reball, fillet, clock, reflow, flux, tin,
 * pinhole, outgas, caf, leach, wicking, rosin, dross, barrel,
 * teardrop, annular, solderball, coldjoint, padlift, halo,
 * tinpest, purpleplague, holewall, microvia, backdrill, immersion,
 * hardgold, softgold, depanel, nozzle, fiducial, vcut, mousebite,
 * ict, spi, xray, hotair, rework, pnp, qfn, selective, stencil,
 * paste, hasl, aoi, void, wave, grape, hip, gift, buy, ebdt,
 * stator, Agent Row, digital eligibility, or tote keys. Host is
 * `gtk-game-boy` only. Drawer, lid, LUT, gift, zine, and listings
 * already owned by another overlay stay off. Fixture `sold` /
 * `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const BLACKPAD_STORAGE_KEY = "iss:blackpad-listing-ids";
export const BLACKPAD_COOKIE_NAME = "iss-blackpad-listing-ids";
export const BLACKPAD_CHANGED_EVENT = "iss:blackpad-changed";

export const BLACKPAD_HOST_ID = "gtk-game-boy";
export const BLACKPAD_DRAWER_ID = "gtk-cable-drawer";
export const BLACKPAD_LID_ID = "kdr-lid-no-pot";
export const BLACKPAD_LUT_ID = "dl-camera-luts";
export const BLACKPAD_ZINE_ID = "dl-stain-zine";
export const BLACKPAD_CHAIR_ID = "ysk-folding-chair";
export const BLACKPAD_GIFT_ID = "dl-mall-gift-card";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const BLACKPAD_OWNED_IDS = [
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

export const BLACKPAD_REFUSE_COPY = "That one does not take a blackpad note.";
export const BLACKPAD_TABLE_LINE = "I will not blackpad it.";
export const BLACKPAD_CRACK_LINE = "Still a crack.";
export const BLACKPAD_TETRIS_LINE = "Still Tetris.";
export const BLACKPAD_NOTICE_TITLE =
  "I will not blackpad it. Still a crack. Still Tetris.";
export const BLACKPAD_WALK_LINE =
  "Walkers still want Half-Working to blackpad it, or shop-blackpad the pads so Tetris reads ENIG without a shop blowhole.";
export const BLACKPAD_STAYS_LINE =
  "This is the blackpad note. I will not blackpad it. Still a crack. Still Tetris.";
export const BLACKPAD_STILL_LINE =
  "Still tote. Not blowhole. Not icicle. Not a shop. Not underfill.";
export const BLACKPAD_TOTE_LINE = "Add to tote still works.";
export const BLACKPAD_EMPTY_LINE = "Nobody taped a blackpad note yet.";
export const BLACKPAD_LEAVE_LINE = "Leave the blackpad";

const SERVER_STORE = Symbol.for("iss.blackpad-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(BLACKPAD_OWNED_IDS);

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

export function parseBlackpadListingIds(
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

export function blackpadCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BLACKPAD_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BLACKPAD_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BLACKPAD_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BLACKPAD_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BLACKPAD_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBlackpadListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBlackpadListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BLACKPAD_STORAGE_KEY);
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
            BLACKPAD_STORAGE_KEY,
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

export function writeBlackpadListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = blackpadCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BLACKPAD_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BLACKPAD_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BLACKPAD_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBlackpadOverlay(
  listingId: string,
  listingIds: readonly string[] = readBlackpadListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isDrawerListing(listing: Listing) {
  return listing.id === BLACKPAD_DRAWER_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === BLACKPAD_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === BLACKPAD_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host Game Boy only. Drawer, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeBlackpad(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== BLACKPAD_HOST_ID) {
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

export type BlackpadWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "drawer"
  | "lid"
  | "chair"
  | "owned";

function refuseBlackpad(listing: Listing | undefined): BlackpadWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== BLACKPAD_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingBlackpad(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBlackpad(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingBlackpad(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBlackpad(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeBlackpad(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BLACKPAD_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BLACKPAD_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BLACKPAD_CHANGED_EVENT, listener);
  };
}
