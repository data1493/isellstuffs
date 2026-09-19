/**
 * I will not cube them — the LUT pack stays three looks, still a pack.
 * Still tote.
 *
 * Convert is Rec.709. Warm stays warm. Grade is no custom LUT. Log is
 * in flight. Profile is CCM. Slate is clapper. Scope stays queued.
 * Grain is 16mm. Walkers still want Half-Working to cube them, or
 * “export a fourth .cube so the lot looks finished.” I will not cube
 * them. Still three looks. Still a pack. Still for sale. Not convert.
 * Not grade. Not a shop. Not log.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:cube-listing-ids` is the client cube set.
 * Cookie `iss-cube-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write convert, grade, warm, grain, log, scope, profile,
 * slate, look-export, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-camera-luts` only. Pack, font, Game Boy, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const CUBE_STORAGE_KEY = "iss:cube-listing-ids";
export const CUBE_COOKIE_NAME = "iss-cube-listing-ids";
export const CUBE_CHANGED_EVENT = "iss:cube-changed";

export const CUBE_HOST_ID = "dl-camera-luts";
export const CUBE_PACK_ID = "dl-sample-pack";
export const CUBE_FONT_ID = "dl-booth-font";
export const CUBE_BOY_ID = "gtk-game-boy";
export const CUBE_GIFT_ID = "dl-mall-gift-card";
export const CUBE_ZINE_ID = "dl-stain-zine";
export const CUBE_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const CUBE_OWNED_IDS = [
  CUBE_PACK_ID,
  CUBE_FONT_ID,
  CUBE_BOY_ID,
  "dl-junk-pricing-pdf",
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

const ownedSet = new Set<string>(CUBE_OWNED_IDS);

export const CUBE_REFUSE_COPY = "That one does not take a cube note.";
export const CUBE_TABLE_LINE = "I will not cube them.";
export const CUBE_LOOKS_LINE = "Still three looks.";
export const CUBE_PACK_LINE = "Still a pack.";
export const CUBE_NOTICE_TITLE =
  "I will not cube them. Still three looks. Still a pack.";
export const CUBE_WALK_LINE =
  "Walkers still want Half-Working to cube them, or export a fourth .cube so the lot looks finished.";
export const CUBE_STAYS_LINE =
  "This is the cube note. I will not cube them. Still three looks. Still a pack.";
export const CUBE_STILL_LINE =
  "Still tote. Not convert. Not grade. Not a shop. Not log.";
export const CUBE_TOTE_LINE = "Add to tote still works.";
export const CUBE_EMPTY_LINE = "Nobody taped a cube note yet.";
export const CUBE_LEAVE_LINE = "Leave the three looks";

const SERVER_STORE = Symbol.for("iss.cube-listing-ids");

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

export function parseCubeListingIds(
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

export function cubeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const CUBE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CUBE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(CUBE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(CUBE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CUBE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseCubeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readCubeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(CUBE_STORAGE_KEY);
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
          window.localStorage.setItem(CUBE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeCubeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = cubeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CUBE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${CUBE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(CUBE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingCubeOverlay(
  listingId: string,
  listingIds: readonly string[] = readCubeListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === CUBE_PACK_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === CUBE_FONT_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LUT pack only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeCube(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== CUBE_HOST_ID) {
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

export type CubeWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "font"
  | "owned";

function refuseCube(listing: Listing | undefined): CubeWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== CUBE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingCube(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCube(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingCube(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCube(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeCube(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CUBE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CUBE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CUBE_CHANGED_EVENT, listener);
  };
}
