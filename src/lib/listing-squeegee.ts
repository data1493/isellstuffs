/**
 * I will not squeegee it — the Game Boy stays cracked. Still tote.
 *
 * Dam is lay-the-wall (on main). Globtop is blob-the-die (on main).
 * Acf is lay-the-film (on main). Soak is hold-the-soak (on main).
 * Hotbar is pulse-bond-the-flex (on main). Pogo is spring-the-pads
 * (on main). Underfill is flood-the-epoxy (on main). Reball is
 * put-new-spheres (on main). Walkers still want Half-Working to
 * squeegee it, or “pull shop paste so Tetris reads printed without
 * a shop dam.” I will not squeegee it. Still a crack. Still Tetris.
 * Still for sale. Not dam. Not globtop. Not a shop. Not underfill.
 * Not acf. Not soak. Not hotbar. Not pogo. Not reball. Not fillet.
 * Not clock. Not reflow. Not stencil. Not paste. Not hasl. Not aoi.
 * Not void. Not wave. Not zaxis. Not anisotropic. Not film. Not ncf.
 * Not cof. Not encapsulant. Not wall. Not damfill. Not blob.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:squeegee-listing-ids` is the client squeegee set.
 * Cookie `iss-squeegee-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write dam, globtop, acf, soak, hotbar, pogo, underfill, reball,
 * fillet, clock, reflow, flux, tin, stencil, paste, hasl, aoi, void,
 * wave, zaxis, anisotropic, film, ncf, cof, encapsulant, wall, damfill,
 * blob, gift, buy, digital eligibility, or tote keys.
 * Host is `gtk-game-boy` only. Drawer, lid, LUT, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SQUEEGEE_STORAGE_KEY = "iss:squeegee-listing-ids";
export const SQUEEGEE_COOKIE_NAME = "iss-squeegee-listing-ids";
export const SQUEEGEE_CHANGED_EVENT = "iss:squeegee-changed";

export const SQUEEGEE_HOST_ID = "gtk-game-boy";
export const SQUEEGEE_DRAWER_ID = "gtk-cable-drawer";
export const SQUEEGEE_LID_ID = "kdr-lid-no-pot";
export const SQUEEGEE_LUT_ID = "dl-camera-luts";
export const SQUEEGEE_ZINE_ID = "dl-stain-zine";
export const SQUEEGEE_CHAIR_ID = "ysk-folding-chair";
export const SQUEEGEE_GIFT_ID = "dl-mall-gift-card";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const SQUEEGEE_OWNED_IDS = [
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

export const SQUEEGEE_REFUSE_COPY = "That one does not take a squeegee note.";
export const SQUEEGEE_TABLE_LINE = "I will not squeegee it.";
export const SQUEEGEE_CRACK_LINE = "Still a crack.";
export const SQUEEGEE_TETRIS_LINE = "Still Tetris.";
export const SQUEEGEE_NOTICE_TITLE =
  "I will not squeegee it. Still a crack. Still Tetris.";
export const SQUEEGEE_WALK_LINE =
  "Walkers still want Half-Working to squeegee it, or pull shop paste so Tetris reads printed without a shop dam.";
export const SQUEEGEE_STAYS_LINE =
  "This is the squeegee note. I will not squeegee it. Still a crack. Still Tetris.";
export const SQUEEGEE_STILL_LINE =
  "Still tote. Not dam. Not globtop. Not a shop. Not underfill.";
export const SQUEEGEE_TOTE_LINE = "Add to tote still works.";
export const SQUEEGEE_EMPTY_LINE = "Nobody taped a squeegee note yet.";
export const SQUEEGEE_LEAVE_LINE = "Leave the paste";

const SERVER_STORE = Symbol.for("iss.squeegee-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(SQUEEGEE_OWNED_IDS);

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

export function parseSqueegeeListingIds(
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

export function squeegeeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SQUEEGEE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SQUEEGEE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SQUEEGEE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SQUEEGEE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SQUEEGEE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSqueegeeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSqueegeeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SQUEEGEE_STORAGE_KEY);
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
            SQUEEGEE_STORAGE_KEY,
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

export function writeSqueegeeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = squeegeeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SQUEEGEE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SQUEEGEE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SQUEEGEE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSqueegeeOverlay(
  listingId: string,
  listingIds: readonly string[] = readSqueegeeListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isDrawerListing(listing: Listing) {
  return listing.id === SQUEEGEE_DRAWER_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === SQUEEGEE_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === SQUEEGEE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host Game Boy only. Drawer, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeSqueegee(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== SQUEEGEE_HOST_ID) {
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

export type SqueegeeWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "drawer"
  | "lid"
  | "chair"
  | "owned";

function refuseSqueegee(listing: Listing | undefined): SqueegeeWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== SQUEEGEE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingSqueegee(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSqueegee(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingSqueegee(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSqueegee(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeSqueegee(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SQUEEGEE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SQUEEGEE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SQUEEGEE_CHANGED_EVENT, listener);
  };
}
