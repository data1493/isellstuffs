/**
 * I will not lathe it — the CD-R stays scratched. Still tote.
 *
 * Polish is the scratch. Ink is the Sharpie. Plays is I spun it
 * once. Finalize is the open session. Walkers still want Beats to
 * lathe BEATS 07, or “make the scratch go.” I will not lathe it.
 * Still scratched. Still Sharpie. Still for sale. Not polish. Not
 * ink. Not plays.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:lathe-listing-ids` is the client lathe set.
 * Cookie `iss-lathe-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write polish, ink, plays, finalize, contents, face, skip,
 * burn, gift, buy, digital eligibility, or tote keys.
 * Host is `ysk-burned-cdr` only. Pack, font, gift, zine, and listings
 * already owned by another overlay stay off. Gate pack, tin drawer,
 * contrast Game Boy, and dart jacket stay on their own notes.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const LATHE_STORAGE_KEY = "iss:lathe-listing-ids";
export const LATHE_COOKIE_NAME = "iss-lathe-listing-ids";
export const LATHE_CHANGED_EVENT = "iss:lathe-changed";

export const LATHE_HOST_ID = "ysk-burned-cdr";
export const LATHE_PACK_ID = "dl-sample-pack";
export const LATHE_FONT_ID = "dl-booth-font";
export const LATHE_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const LATHE_OWNED_IDS = [
  "gtk-game-boy",
  "clo-windbreaker",
  "clo-split-soles",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "gtk-cable-drawer",
  "dl-booth-font",
  "dl-sample-pack",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "dl-junk-pricing-pdf",
] as const;

const ownedSet = new Set<string>(LATHE_OWNED_IDS);

export const LATHE_REFUSE_COPY = "That one does not take a lathe note.";
export const LATHE_TABLE_LINE = "I will not lathe it.";
export const LATHE_SCRATCHED_LINE = "Still scratched.";
export const LATHE_SHARPIE_LINE = "Still Sharpie.";
export const LATHE_NOTICE_TITLE =
  "I will not lathe it. Still scratched. Still Sharpie.";
export const LATHE_WALK_LINE =
  "Walkers still want Beats to lathe the disc, or make the scratch go.";
export const LATHE_STAYS_LINE =
  "This is the lathe note. I will not lathe it. Still scratched. Still Sharpie.";
export const LATHE_STILL_LINE = "Still tote. Not polish. Not ink. Not plays.";
export const LATHE_TOTE_LINE = "Add to tote still works.";
export const LATHE_EMPTY_LINE = "Nobody taped a lathe note yet.";
export const LATHE_LEAVE_LINE = "Leave the scratch";

const SERVER_STORE = Symbol.for("iss.lathe-listing-ids");

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

export function parseLatheListingIds(
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

export function latheCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const LATHE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${LATHE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(LATHE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(LATHE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${LATHE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseLatheListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readLatheListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(LATHE_STORAGE_KEY);
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
          window.localStorage.setItem(LATHE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeLatheListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = latheCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(LATHE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${LATHE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(LATHE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingLatheOverlay(
  listingId: string,
  listingIds: readonly string[] = readLatheListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === LATHE_PACK_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === LATHE_FONT_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host disc only. Pack, font, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeLathe(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== LATHE_HOST_ID) {
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

export type LatheWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "font"
  | "owned";

function refuseLathe(listing: Listing | undefined): LatheWriteReason | null {
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
  if (isPackListing(listing)) {
    return "pack";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (isOwnedListing(listing) || listing.id !== LATHE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingLathe(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseLathe(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingLathe(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseLathe(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeLathe(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === LATHE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LATHE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LATHE_CHANGED_EVENT, listener);
  };
}
