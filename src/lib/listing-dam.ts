/**
 * I will not dam it — the Game Boy stays cracked. Still tote.
 *
 * Globtop is blob-the-die (on main). Acf is lay-the-film (on main).
 * Soak is hold-the-soak (on main). Hotbar is pulse-bond-the-flex
 * (on main). Pogo is spring-the-pads (on main). Underfill is
 * flood-the-epoxy (on main). Reball is put-new-spheres (on main).
 * Walkers still want Half-Working to dam it, or “lay shop dam
 * walls so Tetris reads contained without a shop globtop.” I will
 * not dam it. Still a crack. Still Tetris. Still for sale. Not
 * globtop. Not acf. Not a shop. Not underfill. Not soak. Not
 * hotbar. Not pogo. Not reball. Not fillet. Not clock. Not
 * reflow. Not zaxis. Not anisotropic. Not film. Not ncf. Not
 * cof. Not encapsulant. Not wall. Not damfill. Not blob.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:dam-listing-ids` is the client dam set.
 * Cookie `iss-dam-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write globtop, acf, soak, hotbar, pogo, underfill, reball,
 * fillet, clock, reflow, flux, tin, zaxis, anisotropic, film, ncf,
 * cof, encapsulant, wall, damfill, blob, gift, buy, digital
 * eligibility, or tote keys.
 * Host is `gtk-game-boy` only. Drawer, lid, LUT, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const DAM_STORAGE_KEY = "iss:dam-listing-ids";
export const DAM_COOKIE_NAME = "iss-dam-listing-ids";
export const DAM_CHANGED_EVENT = "iss:dam-changed";

export const DAM_HOST_ID = "gtk-game-boy";
export const DAM_DRAWER_ID = "gtk-cable-drawer";
export const DAM_LID_ID = "kdr-lid-no-pot";
export const DAM_LUT_ID = "dl-camera-luts";
export const DAM_ZINE_ID = "dl-stain-zine";
export const DAM_CHAIR_ID = "ysk-folding-chair";
export const DAM_GIFT_ID = "dl-mall-gift-card";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const DAM_OWNED_IDS = [
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

export const DAM_REFUSE_COPY = "That one does not take a dam note.";
export const DAM_TABLE_LINE = "I will not dam it.";
export const DAM_CRACK_LINE = "Still a crack.";
export const DAM_TETRIS_LINE = "Still Tetris.";
export const DAM_NOTICE_TITLE = "I will not dam it. Still a crack. Still Tetris.";
export const DAM_WALK_LINE =
  "Walkers still want Half-Working to dam it, or lay shop dam walls so Tetris reads contained without a shop globtop.";
export const DAM_STAYS_LINE =
  "This is the dam note. I will not dam it. Still a crack. Still Tetris.";
export const DAM_STILL_LINE =
  "Still tote. Not globtop. Not acf. Not a shop. Not underfill.";
export const DAM_TOTE_LINE = "Add to tote still works.";
export const DAM_EMPTY_LINE = "Nobody taped a dam note yet.";
export const DAM_LEAVE_LINE = "Leave the wall";

const SERVER_STORE = Symbol.for("iss.dam-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(DAM_OWNED_IDS);

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

export function parseDamListingIds(raw: string | null | undefined): string[] {
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

export function damCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const DAM_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${DAM_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(DAM_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(DAM_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${DAM_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseDamListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readDamListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(DAM_STORAGE_KEY);
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
          window.localStorage.setItem(DAM_STORAGE_KEY, JSON.stringify(ids));
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

export function writeDamListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = damCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(DAM_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${DAM_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(DAM_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingDamOverlay(
  listingId: string,
  listingIds: readonly string[] = readDamListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isDrawerListing(listing: Listing) {
  return listing.id === DAM_DRAWER_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === DAM_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === DAM_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host Game Boy only. Drawer, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeDam(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== DAM_HOST_ID) {
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

export type DamWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "drawer"
  | "lid"
  | "chair"
  | "owned";

function refuseDam(listing: Listing | undefined): DamWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== DAM_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingDam(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDam(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingDam(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDam(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeDam(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === DAM_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(DAM_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(DAM_CHANGED_EVENT, listener);
  };
}
