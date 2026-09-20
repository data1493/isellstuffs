/**
 * I will not truss it — the whisk stays bent and metal. Still tote.
 *
 * Anneal is heat-the-wires. Temper is set-the-spring. Peen is
 * hammer-the-collar. Tines is spare wire. Bent is leave-it-bent.
 * Cage is queued. Walkers still want Sink Drawer to truss it, or
 * “tie the balloon so the wires sit.” I will not truss it. Still
 * bent. Still metal. Still for sale. Not anneal. Not temper. Not
 * peen. Not tines.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:truss-listing-ids` is the client truss set.
 * Cookie `iss-truss-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write anneal, temper, peen, tines, cage, bent, rust, oil,
 * soap, gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-bent-whisk` only. Mug, lid, recipes, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const TRUSS_STORAGE_KEY = "iss:truss-listing-ids";
export const TRUSS_COOKIE_NAME = "iss-truss-listing-ids";
export const TRUSS_CHANGED_EVENT = "iss:truss-changed";

export const TRUSS_HOST_ID = "kdr-bent-whisk";
export const TRUSS_MUG_ID = "kdr-chipped-mug";
export const TRUSS_LID_ID = "kdr-lid-no-pot";
export const TRUSS_RECIPES_ID = "dl-drawer-recipes";
export const TRUSS_PACK_ID = "dl-sample-pack";
export const TRUSS_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const TRUSS_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
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
] as const;

export const TRUSS_REFUSE_COPY = "That one does not take a truss note.";
export const TRUSS_TABLE_LINE = "I will not truss it.";
export const TRUSS_BENT_LINE = "Still bent.";
export const TRUSS_METAL_LINE = "Still metal.";
export const TRUSS_NOTICE_TITLE =
  "I will not truss it. Still bent. Still metal.";
export const TRUSS_WALK_LINE =
  "Walkers still want Sink Drawer to truss it, or tie the balloon so the wires sit.";
export const TRUSS_STAYS_LINE =
  "This is the truss note. I will not truss it. Still bent. Still metal.";
export const TRUSS_STILL_LINE =
  "Still tote. Not anneal. Not temper. Not peen. Not tines.";
export const TRUSS_TOTE_LINE = "Add to tote still works.";
export const TRUSS_EMPTY_LINE = "Nobody taped a truss note yet.";
export const TRUSS_LEAVE_LINE = "Leave the bend";

const SERVER_STORE = Symbol.for("iss.truss-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(TRUSS_OWNED_IDS);

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

export function parseTrussListingIds(
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

export function trussCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const TRUSS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${TRUSS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(TRUSS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(TRUSS_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${TRUSS_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseTrussListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readTrussListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(TRUSS_STORAGE_KEY);
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
          window.localStorage.setItem(TRUSS_STORAGE_KEY, JSON.stringify(ids));
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

export function writeTrussListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = trussCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(TRUSS_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${TRUSS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(TRUSS_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingTrussOverlay(
  listingId: string,
  listingIds: readonly string[] = readTrussListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMugListing(listing: Listing) {
  return listing.id === TRUSS_MUG_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === TRUSS_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === TRUSS_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host whisk only. Mug, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeTruss(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== TRUSS_HOST_ID) {
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

export type TrussWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mug"
  | "lid"
  | "chair"
  | "owned";

function refuseTruss(
  listing: Listing | undefined,
): TrussWriteReason | null {
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
  if (isMugListing(listing)) {
    return "mug";
  }
  if (isLidListing(listing)) {
    return "lid";
  }
  if (isOwnedListing(listing) || listing.id !== TRUSS_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingTruss(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTruss(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingTruss(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTruss(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeTruss(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === TRUSS_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(TRUSS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TRUSS_CHANGED_EVENT, listener);
  };
}
