/**
 * I will not peen it — the whisk stays splayed and metal. Still tote.
 *
 * Bent is leave-it-bent. Tines is spare-wire. Anneal is heat-the-wires.
 * Rust is no chrome. Oil is the drop. Soap is egg-off. Walkers still
 * want Sink Drawer to peen the whisk, or “hammer the collar so the
 * balloon sits.” I will not peen it. Still splayed. Still metal.
 * Still for sale. Not anneal. Not bent. Not tines.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:peen-listing-ids` is the client peen set.
 * Cookie `iss-peen-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write bent, tines, anneal, rust, oil, soap, knurl, handle,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-bent-whisk` only. Mug, lid, recipes, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const PEEN_STORAGE_KEY = "iss:peen-listing-ids";
export const PEEN_COOKIE_NAME = "iss-peen-listing-ids";
export const PEEN_CHANGED_EVENT = "iss:peen-changed";

export const PEEN_HOST_ID = "kdr-bent-whisk";
export const PEEN_MUG_ID = "kdr-chipped-mug";
export const PEEN_LID_ID = "kdr-lid-no-pot";
export const PEEN_RECIPES_ID = "dl-drawer-recipes";
export const PEEN_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const PEEN_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
] as const;

export const PEEN_REFUSE_COPY = "That one does not take a peen note.";
export const PEEN_TABLE_LINE = "I will not peen it.";
export const PEEN_SPLAYED_LINE = "Still splayed.";
export const PEEN_METAL_LINE = "Still metal.";
export const PEEN_NOTICE_TITLE =
  "I will not peen it. Still splayed. Still metal.";
export const PEEN_WALK_LINE =
  "Walkers still want Sink Drawer to peen the whisk, or hammer the collar so the balloon sits.";
export const PEEN_STAYS_LINE =
  "This is the peen note. I will not peen it. Still splayed. Still metal.";
export const PEEN_STILL_LINE =
  "Still tote. Not anneal. Not bent. Not a shop. Not tines.";
export const PEEN_TOTE_LINE = "Add to tote still works.";
export const PEEN_EMPTY_LINE = "Nobody taped a peen note yet.";
export const PEEN_LEAVE_LINE = "Leave the splay";

const SERVER_STORE = Symbol.for("iss.peen-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(PEEN_OWNED_IDS);

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

export function parsePeenListingIds(
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

export function peenCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const PEEN_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PEEN_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(PEEN_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PEEN_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${PEEN_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePeenListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readPeenListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(PEEN_STORAGE_KEY);
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
          window.localStorage.setItem(PEEN_STORAGE_KEY, JSON.stringify(ids));
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

export function writePeenListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = peenCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PEEN_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PEEN_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(PEEN_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingPeenOverlay(
  listingId: string,
  listingIds: readonly string[] = readPeenListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMugListing(listing: Listing) {
  return listing.id === PEEN_MUG_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === PEEN_LID_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host whisk only. Mug, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapePeen(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== PEEN_HOST_ID) {
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

export type PeenWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mug"
  | "lid"
  | "owned";

function refusePeen(
  listing: Listing | undefined,
): PeenWriteReason | null {
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
  if (isMugListing(listing)) {
    return "mug";
  }
  if (isLidListing(listing)) {
    return "lid";
  }
  if (isOwnedListing(listing) || listing.id !== PEEN_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingPeen(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePeen(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingPeen(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePeen(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribePeen(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PEEN_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PEEN_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PEEN_CHANGED_EVENT, listener);
  };
}
