/**
 * I will not edge it — the pair stays peeling. Still a pair. Still a peel.
 *
 * Skive is thin-the-edge. Welt is cobbler-welt. Burnish is edge-slick.
 * Stitch is cobbler-seam. Toe is the peel stays. Walkers still want
 * Closet to edge it, or finish the split so the peel looks like a
 * repair. I will not edge it. Still a pair. Still a peel. Still for
 * sale. Not skive. Not welt. Not burnish.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:edge-listing-ids` is the client edge set.
 * Cookie `iss-edge-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write skive, welt, burnish, darn, pleat, mat, scrape, tap,
 * strop, erase, foxing, dye, gift, buy, digital eligibility, or tote keys.
 * Host is `clo-split-soles` only. Jacket, font, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const EDGE_STORAGE_KEY = "iss:edge-listing-ids";
export const EDGE_COOKIE_NAME = "iss-edge-listing-ids";
export const EDGE_CHANGED_EVENT = "iss:edge-changed";

export const EDGE_HOST_ID = "clo-split-soles";
export const EDGE_JACKET_ID = "clo-windbreaker";
export const EDGE_FONT_ID = "dl-booth-font";
export const EDGE_CHAIR_ID = "ysk-folding-chair";
export const EDGE_GIFT_ID = "dl-mall-gift-card";
export const EDGE_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const EDGE_OWNED_IDS = [
  EDGE_JACKET_ID,
  EDGE_FONT_ID,
  "mdb-jewel-stack",
  "mdb-scratched-lp",
  "mdb-mixtape-93",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-wobbly-lamp",
  "ysk-burned-cdr",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "kdr-bent-whisk",
  "dl-sample-pack",
  "dl-junk-pricing-pdf",
  "dl-drawer-recipes",
  "dl-camera-luts",
  "dl-crate-side-a",
] as const;

const ownedSet = new Set<string>(EDGE_OWNED_IDS);

export const EDGE_REFUSE_COPY = "That one does not take an edge note.";
export const EDGE_TABLE_LINE = "I will not edge it.";
export const EDGE_PAIR_LINE = "Still a pair.";
export const EDGE_PEEL_LINE = "Still a peel.";
export const EDGE_NOTICE_TITLE =
  "I will not edge it. Still a pair. Still a peel.";
export const EDGE_WALK_LINE =
  "Walkers still want Closet to edge it, or finish the split so the peel looks like a repair.";
export const EDGE_STAYS_LINE =
  "This is the edge note. I will not edge it. Still a pair. Still a peel.";
export const EDGE_STILL_LINE =
  "Still tote. Not skive. Not welt. Not burnish.";
export const EDGE_TOTE_LINE = "Add to tote still works.";
export const EDGE_EMPTY_LINE = "Nobody taped an edge note yet.";
export const EDGE_LEAVE_LINE = "Leave the peel";

const SERVER_STORE = Symbol.for("iss.edge-listing-ids");

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

export function parseEdgeListingIds(
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

export function edgeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const EDGE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${EDGE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(EDGE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(EDGE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${EDGE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseEdgeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readEdgeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(EDGE_STORAGE_KEY);
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
          window.localStorage.setItem(EDGE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeEdgeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = edgeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(EDGE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${EDGE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(EDGE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingEdgeOverlay(
  listingId: string,
  listingIds: readonly string[] = readEdgeListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isJacketListing(listing: Listing) {
  return listing.id === EDGE_JACKET_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === EDGE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host split-soles only. Overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeEdge(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== EDGE_HOST_ID) {
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

export type EdgeWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "jacket"
  | "chair"
  | "owned";

function refuseEdge(listing: Listing | undefined): EdgeWriteReason | null {
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
  if (isJacketListing(listing)) {
    return "jacket";
  }
  if (isOwnedListing(listing) || listing.id !== EDGE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingEdge(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseEdge(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingEdge(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseEdge(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeEdge(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === EDGE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(EDGE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EDGE_CHANGED_EVENT, listener);
  };
}
