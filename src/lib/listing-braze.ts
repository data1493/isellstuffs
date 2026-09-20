/**
 * I will not braze it — the whisk stays bent and metal. Still tote.
 *
 * Quench is dunk-the-wires. Planish is hammer-smooth. Upset is
 * thicken-the-ends. Truss is tie-the-splay. Peen is hammer-the-collar.
 * Walkers still want Sink Drawer to braze it, or “join the splay so
 * the balloon reads shop-round without a shop quench.” I will not
 * braze it. Still bent. Still metal. Still for sale. Not quench.
 * Not planish. Not a shop. Not upset.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:braze-listing-ids` is the client braze set.
 * Cookie `iss-braze-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write quench, planish, upset, truss, peen, anneal, silver,
 * tig, oxy, gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-bent-whisk` only. Mug, lid, recipes, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const BRAZE_STORAGE_KEY = "iss:braze-listing-ids";
export const BRAZE_COOKIE_NAME = "iss-braze-listing-ids";
export const BRAZE_CHANGED_EVENT = "iss:braze-changed";

export const BRAZE_HOST_ID = "kdr-bent-whisk";
export const BRAZE_MUG_ID = "kdr-chipped-mug";
export const BRAZE_LID_ID = "kdr-lid-no-pot";
export const BRAZE_RECIPES_ID = "dl-drawer-recipes";
export const BRAZE_ZINE_ID = "dl-stain-zine";
export const BRAZE_CHAIR_ID = "ysk-folding-chair";
export const BRAZE_GIFT_ID = "dl-mall-gift-card";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const BRAZE_OWNED_IDS = [
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

export const BRAZE_REFUSE_COPY = "That one does not take a braze note.";
export const BRAZE_TABLE_LINE = "I will not braze it.";
export const BRAZE_BENT_LINE = "Still bent.";
export const BRAZE_METAL_LINE = "Still metal.";
export const BRAZE_NOTICE_TITLE =
  "I will not braze it. Still bent. Still metal.";
export const BRAZE_WALK_LINE =
  "Walkers still want Sink Drawer to braze it, or join the splay so the balloon reads shop-round without a shop quench.";
export const BRAZE_STAYS_LINE =
  "This is the braze note. I will not braze it. Still bent. Still metal.";
export const BRAZE_STILL_LINE =
  "Still tote. Not quench. Not planish. Not a shop. Not upset.";
export const BRAZE_TOTE_LINE = "Add to tote still works.";
export const BRAZE_EMPTY_LINE = "Nobody taped a braze note yet.";
export const BRAZE_LEAVE_LINE = "Leave the splay";

const SERVER_STORE = Symbol.for("iss.braze-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(BRAZE_OWNED_IDS);

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

export function parseBrazeListingIds(
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

export function brazeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BRAZE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BRAZE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BRAZE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BRAZE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BRAZE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBrazeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBrazeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BRAZE_STORAGE_KEY);
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
          window.localStorage.setItem(BRAZE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeBrazeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = brazeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BRAZE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BRAZE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BRAZE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBrazeOverlay(
  listingId: string,
  listingIds: readonly string[] = readBrazeListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMugListing(listing: Listing) {
  return listing.id === BRAZE_MUG_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === BRAZE_LID_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host whisk only. Mug, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeBraze(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== BRAZE_HOST_ID) {
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

export type BrazeWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mug"
  | "lid"
  | "owned";

function refuseBraze(listing: Listing | undefined): BrazeWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== BRAZE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingBraze(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBraze(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingBraze(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBraze(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeBraze(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BRAZE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BRAZE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BRAZE_CHANGED_EVENT, listener);
  };
}
