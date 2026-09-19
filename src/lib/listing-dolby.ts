/**
 * I will not Dolby it — SUMMER 93 stays hiss. Still tote.
 *
 * Hiss is the tape. Bake is no oven. Azimuth is the heading.
 * Degauss is wipe-the-residual. Walkers still want Sunday Crate
 * to Dolby the mixtape, or “encode NR so the hiss drops.” I will
 * not Dolby it. Still hiss. Still SUMMER 93. Still for sale. Not
 * hiss. Not degauss. Not azimuth.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:dolby-listing-ids` is the client Dolby set.
 * Cookie `iss-dolby-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write hiss, bake, azimuth, degauss, leader, wind, dub,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `mdb-mixtape-93` only. LP, liner PDF, gift, zine, CD-R,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const DOLBY_STORAGE_KEY = "iss:dolby-listing-ids";
export const DOLBY_COOKIE_NAME = "iss-dolby-listing-ids";
export const DOLBY_CHANGED_EVENT = "iss:dolby-changed";

export const DOLBY_HOST_ID = "mdb-mixtape-93";
export const DOLBY_LP_ID = "mdb-scratched-lp";
export const DOLBY_CDR_ID = "ysk-burned-cdr";
export const DOLBY_LINER_ID = "dl-crate-side-a";
export const DOLBY_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const DOLBY_OWNED_IDS = [
  DOLBY_LP_ID,
  DOLBY_CDR_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-wobbly-lamp",
  "kdr-chipped-mug",
  "kdr-bent-whisk",
  "mdb-jewel-stack",
  "dl-booth-font",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
] as const;

const ownedSet = new Set<string>(DOLBY_OWNED_IDS);

export const DOLBY_REFUSE_COPY = "That one does not take a Dolby note.";
export const DOLBY_TABLE_LINE = "I will not Dolby it.";
export const DOLBY_HISS_LINE = "Still hiss.";
export const DOLBY_SUMMER_LINE = "Still SUMMER 93.";
export const DOLBY_NOTICE_TITLE =
  "I will not Dolby it. Still hiss. Still SUMMER 93.";
export const DOLBY_WALK_LINE =
  "Walkers still want Sunday Crate to Dolby the mixtape, or encode NR so the hiss drops.";
export const DOLBY_STAYS_LINE =
  "This is the Dolby note. I will not Dolby it. Still hiss. Still SUMMER 93.";
export const DOLBY_STILL_LINE =
  "Still tote. Not hiss. Not degauss. Not a shop. Not azimuth.";
export const DOLBY_TOTE_LINE = "Add to tote still works.";
export const DOLBY_EMPTY_LINE = "Nobody taped a Dolby note yet.";
export const DOLBY_LEAVE_LINE = "Leave the hiss";

const SERVER_STORE = Symbol.for("iss.dolby-listing-ids");

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

export function parseDolbyListingIds(
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

export function dolbyCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const DOLBY_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${DOLBY_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(DOLBY_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(DOLBY_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${DOLBY_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseDolbyListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readDolbyListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(DOLBY_STORAGE_KEY);
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
          window.localStorage.setItem(DOLBY_STORAGE_KEY, JSON.stringify(ids));
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

export function writeDolbyListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = dolbyCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(DOLBY_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${DOLBY_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(DOLBY_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingDolbyOverlay(
  listingId: string,
  listingIds: readonly string[] = readDolbyListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLpListing(listing: Listing) {
  return listing.id === DOLBY_LP_ID;
}

function isCdrListing(listing: Listing) {
  return listing.id === DOLBY_CDR_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === DOLBY_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host mixtape only. LP, CD-R, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeDolby(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== DOLBY_HOST_ID) {
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

export type DolbyWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lp"
  | "cdr"
  | "chair"
  | "owned";

function refuseDolby(
  listing: Listing | undefined,
): DolbyWriteReason | null {
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
  if (isLpListing(listing)) {
    return "lp";
  }
  if (isCdrListing(listing)) {
    return "cdr";
  }
  if (isOwnedListing(listing) || listing.id !== DOLBY_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingDolby(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDolby(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingDolby(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDolby(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeDolby(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === DOLBY_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(DOLBY_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(DOLBY_CHANGED_EVENT, listener);
  };
}
