/**
 * I will not hone it — the unnamed LP still skips. Still unnamed.
 *
 * Puck is weight-on-Side-A. Skip is the chorus. Center is the hole.
 * Dust is the wipe. VG is no Goldmine. Polish is Brasso. Lathe is
 * the CD-R. Walkers still want Sunday Crate to hone the groove, or
 * “stone the nick so Side A plays through.” I will not hone it.
 * Still skips. Still unnamed. Still for sale. Not puck. Not polish.
 * Not a shop. Not skip.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:hone-listing-ids` is the client hone set.
 * Cookie `iss-hone-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write skip, puck, dust, center, vg, jacket, wax, polish,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `mdb-scratched-lp` only. Mixtape, mug, jewels, liner, gift,
 * zine, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const HONE_STORAGE_KEY = "iss:hone-listing-ids";
export const HONE_COOKIE_NAME = "iss-hone-listing-ids";
export const HONE_CHANGED_EVENT = "iss:hone-changed";

export const HONE_HOST_ID = "mdb-scratched-lp";
export const HONE_MIXTAPE_ID = "mdb-mixtape-93";
export const HONE_MUG_ID = "kdr-chipped-mug";
export const HONE_JEWELS_ID = "mdb-jewel-stack";
export const HONE_LINER_ID = "dl-crate-side-a";
export const HONE_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const HONE_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "dl-booth-font",
  "kdr-chipped-mug",
  "kdr-bent-whisk",
  "kdr-lid-no-pot",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-drawer-recipes",
  "dl-camera-luts",
] as const;

export const HONE_REFUSE_COPY = "That one does not take a hone note.";
export const HONE_TABLE_LINE = "I will not hone it.";
export const HONE_SKIP_LINE = "Still skips.";
export const HONE_UNNAMED_LINE = "Still unnamed.";
export const HONE_NOTICE_TITLE =
  "I will not hone it. Still skips. Still unnamed.";
export const HONE_WALK_LINE =
  "Walkers still want Sunday Crate to hone the groove, or stone the nick so Side A plays through.";
export const HONE_STAYS_LINE =
  "This is the hone note. I will not hone it. Still skips. Still unnamed.";
export const HONE_STILL_LINE =
  "Still tote. Not puck. Not polish. Not a shop. Not skip.";
export const HONE_TOTE_LINE = "Add to tote still works.";
export const HONE_EMPTY_LINE = "Nobody taped a hone note yet.";
export const HONE_LEAVE_LINE = "Leave the nick";

const SERVER_STORE = Symbol.for("iss.hone-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(HONE_OWNED_IDS);

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

export function parseHoneListingIds(
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

export function honeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const HONE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${HONE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(HONE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(HONE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${HONE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseHoneListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readHoneListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(HONE_STORAGE_KEY);
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
          window.localStorage.setItem(HONE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeHoneListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = honeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(HONE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${HONE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(HONE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingHoneOverlay(
  listingId: string,
  listingIds: readonly string[] = readHoneListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === HONE_MIXTAPE_ID;
}

function isMugListing(listing: Listing) {
  return listing.id === HONE_MUG_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === HONE_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === HONE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LP only. Mixtape, mug, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeHone(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== HONE_HOST_ID) {
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

export type HoneWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "mug"
  | "jewels"
  | "chair"
  | "owned";

function refuseHone(
  listing: Listing | undefined,
): HoneWriteReason | null {
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
  if (isMixtapeListing(listing)) {
    return "mixtape";
  }
  if (isMugListing(listing)) {
    return "mug";
  }
  if (isJewelsListing(listing)) {
    return "jewels";
  }
  if (isOwnedListing(listing) || listing.id !== HONE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingHone(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseHone(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingHone(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseHone(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeHone(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === HONE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(HONE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(HONE_CHANGED_EVENT, listener);
  };
}
