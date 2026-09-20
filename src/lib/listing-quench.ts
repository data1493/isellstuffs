/**
 * I will not quench it — the whisk stays a splay and a whisk. Still tote.
 *
 * Temper is set-the-spring. Anneal is heat-the-wires. Peen is
 * hammer-the-collar. Truss is tie-the-splay. Planish is queued.
 * Walkers still want Sink Drawer to quench it, or “dunk the balloon
 * so the wires snap back without a shop temper.” I will not quench
 * it. Still a splay. Still a whisk. Still for sale. Not temper. Not
 * anneal. Not a shop. Not peen.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:quench-listing-ids` is the client quench set.
 * Cookie `iss-quench-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write temper, anneal, peen, truss, cage, planish, bent,
 * rust, oil, soap, gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-bent-whisk` only. Mug, lid, recipes, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const QUENCH_STORAGE_KEY = "iss:quench-listing-ids";
export const QUENCH_COOKIE_NAME = "iss-quench-listing-ids";
export const QUENCH_CHANGED_EVENT = "iss:quench-changed";

export const QUENCH_HOST_ID = "kdr-bent-whisk";
export const QUENCH_MUG_ID = "kdr-chipped-mug";
export const QUENCH_LID_ID = "kdr-lid-no-pot";
export const QUENCH_RECIPES_ID = "dl-drawer-recipes";
export const QUENCH_ZINE_ID = "dl-stain-zine";
export const QUENCH_CHAIR_ID = "ysk-folding-chair";
export const QUENCH_GIFT_ID = "dl-mall-gift-card";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const QUENCH_OWNED_IDS = [
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

export const QUENCH_REFUSE_COPY = "That one does not take a quench note.";
export const QUENCH_TABLE_LINE = "I will not quench it.";
export const QUENCH_SPLAY_LINE = "Still a splay.";
export const QUENCH_WHISK_LINE = "Still a whisk.";
export const QUENCH_NOTICE_TITLE =
  "I will not quench it. Still a splay. Still a whisk.";
export const QUENCH_WALK_LINE =
  "Walkers still want Sink Drawer to quench it, or dunk the balloon so the wires snap back without a shop temper.";
export const QUENCH_STAYS_LINE =
  "This is the quench note. I will not quench it. Still a splay. Still a whisk.";
export const QUENCH_STILL_LINE =
  "Still tote. Not temper. Not anneal. Not a shop. Not peen.";
export const QUENCH_TOTE_LINE = "Add to tote still works.";
export const QUENCH_EMPTY_LINE = "Nobody taped a quench note yet.";
export const QUENCH_LEAVE_LINE = "Leave the splay";

const SERVER_STORE = Symbol.for("iss.quench-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(QUENCH_OWNED_IDS);

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

export function parseQuenchListingIds(
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

export function quenchCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const QUENCH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${QUENCH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(QUENCH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(QUENCH_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${QUENCH_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseQuenchListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readQuenchListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(QUENCH_STORAGE_KEY);
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
          window.localStorage.setItem(QUENCH_STORAGE_KEY, JSON.stringify(ids));
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

export function writeQuenchListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = quenchCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(QUENCH_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${QUENCH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(QUENCH_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingQuenchOverlay(
  listingId: string,
  listingIds: readonly string[] = readQuenchListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMugListing(listing: Listing) {
  return listing.id === QUENCH_MUG_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === QUENCH_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === QUENCH_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host whisk only. Mug, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeQuench(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== QUENCH_HOST_ID) {
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

export type QuenchWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mug"
  | "lid"
  | "chair"
  | "owned";

function refuseQuench(
  listing: Listing | undefined,
): QuenchWriteReason | null {
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
  if (isMugListing(listing)) {
    return "mug";
  }
  if (isLidListing(listing)) {
    return "lid";
  }
  if (isOwnedListing(listing) || listing.id !== QUENCH_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingQuench(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseQuench(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingQuench(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseQuench(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeQuench(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === QUENCH_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(QUENCH_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(QUENCH_CHANGED_EVENT, listener);
  };
}
