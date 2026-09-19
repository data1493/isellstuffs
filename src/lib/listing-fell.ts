/**
 * I will not fell it — the windbreaker stays worn twice and mint-green.
 * Still tote.
 *
 * Serge is overlock. Dart is take-in. Cinch is the waist. Sew is no
 * hem. Gusset is a pit panel. Bartack is a bar. Walkers still want
 * Closet to fell the pits, or “fold the seam so the stain sits
 * inside.” I will not fell it. Still worn twice. Still mint-green.
 * Still for sale. Not serge. Not dart. Not sew.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:fell-listing-ids` is the client fell set.
 * Cookie `iss-fell-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write serge, dart, cinch, sew, gusset, bartack, lining,
 * size, gift, buy, digital eligibility, or tote keys.
 * Host is `clo-windbreaker` only. Sneakers, lamp, chair, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const FELL_STORAGE_KEY = "iss:fell-listing-ids";
export const FELL_COOKIE_NAME = "iss-fell-listing-ids";
export const FELL_CHANGED_EVENT = "iss:fell-changed";

export const FELL_HOST_ID = "clo-windbreaker";
export const FELL_SNEAKER_ID = "clo-split-soles";
export const FELL_LAMP_ID = "ysk-wobbly-lamp";
export const FELL_CHAIR_ID = "ysk-folding-chair";
export const FELL_ZINE_ID = "dl-stain-zine";
export const FELL_FONT_ID = "dl-booth-font";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const FELL_OWNED_IDS = [
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "dl-drawer-recipes",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "ysk-wobbly-lamp",
  "dl-camera-luts",
  "mdb-scratched-lp",
] as const;

export const FELL_REFUSE_COPY = "That one does not take a fell note.";
export const FELL_TABLE_LINE = "I will not fell it.";
export const FELL_WORN_LINE = "Still worn twice.";
export const FELL_MINT_LINE = "Still mint-green.";
export const FELL_NOTICE_TITLE =
  "I will not fell it. Still worn twice. Still mint-green.";
export const FELL_WALK_LINE =
  "Walkers still want Closet to fell the pits, or fold the seam so the stain sits inside.";
export const FELL_STAYS_LINE =
  "This is the fell note. I will not fell it. Still worn twice. Still mint-green.";
export const FELL_STILL_LINE =
  "Still tote. Not serge. Not dart. Not a shop. Not sew.";
export const FELL_TOTE_LINE = "Add to tote still works.";
export const FELL_EMPTY_LINE = "Nobody taped a fell note yet.";
export const FELL_LEAVE_LINE = "Leave the pits";

const SERVER_STORE = Symbol.for("iss.fell-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(FELL_OWNED_IDS);

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

export function parseFellListingIds(
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

export function fellCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const FELL_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${FELL_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(FELL_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(FELL_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${FELL_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseFellListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readFellListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(FELL_STORAGE_KEY);
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
          window.localStorage.setItem(FELL_STORAGE_KEY, JSON.stringify(ids));
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

export function writeFellListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = fellCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(FELL_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${FELL_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(FELL_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingFellOverlay(
  listingId: string,
  listingIds: readonly string[] = readFellListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isSneakerListing(listing: Listing) {
  return listing.id === FELL_SNEAKER_ID;
}

function isLampListing(listing: Listing) {
  return listing.id === FELL_LAMP_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === FELL_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host jacket only. Sneakers, lamp, chair, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeFell(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== FELL_HOST_ID) {
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

export type FellWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "sneakers"
  | "lamp"
  | "chair"
  | "owned";

function refuseFell(
  listing: Listing | undefined,
): FellWriteReason | null {
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
  if (isSneakerListing(listing)) {
    return "sneakers";
  }
  if (isLampListing(listing)) {
    return "lamp";
  }
  if (isOwnedListing(listing) || listing.id !== FELL_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingFell(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFell(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingFell(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFell(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeFell(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === FELL_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(FELL_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FELL_CHANGED_EVENT, listener);
  };
}
