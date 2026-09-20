/**
 * I will not pillow it — the Game Boy stays cracked. Still tote.
 *
 * Billboard is stand-the-long-edge (leftover on main — do not own).
 * Tombstone is rework-the-standing-joint (on main — do not own).
 * Squeegee is pull-the-paste (on main — do not own).
 * Dam is lay-the-wall (on main — do not own).
 * Globtop is blob-the-die (on main — do not own).
 * Acf is lay-the-film (on main — do not own).
 * Soak is hold-the-soak (on main — do not own).
 * Hotbar is pulse-bond-the-flex (on main — do not own).
 * Pogo is spring-the-pads (on main). Underfill is flood-the-epoxy
 * (on main). Reball is put-new-spheres (on main). Walkers still
 * want Half-Working to pillow it, or “leave the BGA head-in-pillow
 * so Tetris reads printed without a shop billboard.”
 * I will not pillow it. Still a crack. Still Tetris. Still for
 * sale. Not billboard. Not tombstone. Not a shop. Not underfill.
 * Not squeegee. Not dam. Not globtop. Not acf. Not soak. Not
 * hotbar. Not pogo. Not reball. Not fillet. Not clock. Not
 * reflow. Not depanel. Not nozzle. Not fiducial. Not vcut.
 * Not mousebite. Not ict. Not spi. Not xray. Not hotair.
 * Not rework. Not pnp. Not qfn. Not selective. Not stencil.
 * Not paste. Not hasl. Not aoi. Not void. Not wave. Not grape.
 * Not graping. Not drawbridge. Not hip. Not webbing. Not slump.
 * Not scoop. Not popcorn. Not kirkendall. Not viafill.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:pillow-listing-ids` is the client pillow set.
 * Cookie `iss-pillow-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write billboard, frost, resonance, bsln, thrust, reflex,
 * tombstone, squeegee, dam, globtop, acf, soak, hotbar, pogo,
 * underfill, reball, fillet, fringe, rake, clock, reflow, flux,
 * tin, depanel, nozzle, fiducial, vcut, mousebite, ict, spi, xray,
 * hotair, rework, pnp, qfn, selective, stencil, paste, hasl, aoi,
 * void, wave, grape, hip, gift, buy, digital eligibility, or tote
 * keys. Host is `gtk-game-boy` only. Drawer, lid, LUT, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const PILLOW_STORAGE_KEY = "iss:pillow-listing-ids";
export const PILLOW_COOKIE_NAME = "iss-pillow-listing-ids";
export const PILLOW_CHANGED_EVENT = "iss:pillow-changed";

export const PILLOW_HOST_ID = "gtk-game-boy";
export const PILLOW_DRAWER_ID = "gtk-cable-drawer";
export const PILLOW_LID_ID = "kdr-lid-no-pot";
export const PILLOW_LUT_ID = "dl-camera-luts";
export const PILLOW_ZINE_ID = "dl-stain-zine";
export const PILLOW_CHAIR_ID = "ysk-folding-chair";
export const PILLOW_GIFT_ID = "dl-mall-gift-card";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const PILLOW_OWNED_IDS = [
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

export const PILLOW_REFUSE_COPY = "That one does not take a pillow note.";
export const PILLOW_TABLE_LINE = "I will not pillow it.";
export const PILLOW_CRACK_LINE = "Still a crack.";
export const PILLOW_TETRIS_LINE = "Still Tetris.";
export const PILLOW_NOTICE_TITLE =
  "I will not pillow it. Still a crack. Still Tetris.";
export const PILLOW_WALK_LINE =
  "Walkers still want Half-Working to pillow it, or leave the BGA head-in-pillow so Tetris reads printed without a shop billboard.";
export const PILLOW_STAYS_LINE =
  "This is the pillow note. I will not pillow it. Still a crack. Still Tetris.";
export const PILLOW_STILL_LINE =
  "Still tote. Not billboard. Not tombstone. Not a shop. Not underfill.";
export const PILLOW_TOTE_LINE = "Add to tote still works.";
export const PILLOW_EMPTY_LINE = "Nobody taped a pillow note yet.";
export const PILLOW_LEAVE_LINE = "Leave the pillow";

const SERVER_STORE = Symbol.for("iss.pillow-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(PILLOW_OWNED_IDS);

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

export function parsePillowListingIds(
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

export function pillowCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const PILLOW_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PILLOW_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(PILLOW_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PILLOW_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${PILLOW_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePillowListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readPillowListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(PILLOW_STORAGE_KEY);
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
            PILLOW_STORAGE_KEY,
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

export function writePillowListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = pillowCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PILLOW_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PILLOW_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(PILLOW_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingPillowOverlay(
  listingId: string,
  listingIds: readonly string[] = readPillowListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isDrawerListing(listing: Listing) {
  return listing.id === PILLOW_DRAWER_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === PILLOW_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === PILLOW_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host Game Boy only. Drawer, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapePillow(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== PILLOW_HOST_ID) {
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

export type PillowWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "drawer"
  | "lid"
  | "chair"
  | "owned";

function refusePillow(listing: Listing | undefined): PillowWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== PILLOW_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingPillow(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePillow(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingPillow(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePillow(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribePillow(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PILLOW_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PILLOW_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PILLOW_CHANGED_EVENT, listener);
  };
}
