/**
 * I will not outline them — still two weights. Still OTF.
 * Still tote.
 *
 * Subset is webfont-cut. Ligature is join-the-fi. Variable is
 * one-file. Hint is hinted-OTF. Walkers still want Beats to
 * outline them, or “convert the food-court map so it prints
 * without the file.” I will not outline them. Still two weights.
 * Still OTF. Still for sale. Not subset. Not hint. Not a shop.
 * Not ligature.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:outline-listing-ids` is the client outline set.
 * Cookie `iss-outline-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write subset, ligature, variable, hint, foundry, slant,
 * bold, specimen, icons, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-booth-font` only. Pack, LUT, gift, zine, physical,
 * and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const OUTLINE_STORAGE_KEY = "iss:outline-listing-ids";
export const OUTLINE_COOKIE_NAME = "iss-outline-listing-ids";
export const OUTLINE_CHANGED_EVENT = "iss:outline-changed";

export const OUTLINE_HOST_ID = "dl-booth-font";
export const OUTLINE_PACK_ID = "dl-sample-pack";
export const OUTLINE_LUT_ID = "dl-camera-luts";
export const OUTLINE_ZINE_ID = "dl-stain-zine";
export const OUTLINE_CHAIR_ID = "ysk-folding-chair";
export const OUTLINE_GIFT_ID = "dl-mall-gift-card";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const OUTLINE_OWNED_IDS = [
  OUTLINE_PACK_ID,
  OUTLINE_LUT_ID,
  OUTLINE_ZINE_ID,
  "dl-junk-pricing-pdf",
  "dl-crate-side-a",
  "dl-drawer-recipes",
  "gtk-game-boy",
  "clo-windbreaker",
  "clo-split-soles",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "gtk-cable-drawer",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "ysk-burned-cdr",
  "kdr-chipped-mug",
] as const;

const ownedSet = new Set<string>(OUTLINE_OWNED_IDS);

export const OUTLINE_REFUSE_COPY = "That one does not take an outline note.";
export const OUTLINE_TABLE_LINE = "I will not outline them.";
export const OUTLINE_WEIGHTS_LINE = "Still two weights.";
export const OUTLINE_OTF_LINE = "Still OTF.";
export const OUTLINE_NOTICE_TITLE =
  "I will not outline them. Still two weights. Still OTF.";
export const OUTLINE_WALK_LINE =
  "Walkers still want Beats to outline them, or convert the food-court map so it prints without the file.";
export const OUTLINE_STAYS_LINE =
  "This is the outline note. I will not outline them. Still two weights. Still OTF.";
export const OUTLINE_STILL_LINE =
  "Still tote. Not subset. Not hint. Not a shop. Not ligature.";
export const OUTLINE_TOTE_LINE = "Add to tote still works.";
export const OUTLINE_EMPTY_LINE = "Nobody taped an outline note yet.";
export const OUTLINE_LEAVE_LINE = "Leave the file";

const SERVER_STORE = Symbol.for("iss.outline-listing-ids");

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

export function parseOutlineListingIds(
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

export function outlineCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const OUTLINE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${OUTLINE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(OUTLINE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(OUTLINE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${OUTLINE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseOutlineListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readOutlineListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(OUTLINE_STORAGE_KEY);
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
          window.localStorage.setItem(
            OUTLINE_STORAGE_KEY,
            JSON.stringify(ids),
          );
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

export function writeOutlineListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = outlineCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(OUTLINE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${OUTLINE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(OUTLINE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingOutlineOverlay(
  listingId: string,
  listingIds: readonly string[] = readOutlineListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === OUTLINE_PACK_ID;
}

function isLutListing(listing: Listing) {
  return listing.id === OUTLINE_LUT_ID;
}

function isZineListing(listing: Listing) {
  return listing.id === OUTLINE_ZINE_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === OUTLINE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host booth font only. Pack, LUT, overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeOutline(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== OUTLINE_HOST_ID) {
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

export type OutlineWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "lut"
  | "zine"
  | "chair"
  | "owned";

function refuseOutline(
  listing: Listing | undefined,
): OutlineWriteReason | null {
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
  if (!isDigitalListing(listing)) {
    return "physical";
  }
  if (isPackListing(listing)) {
    return "pack";
  }
  if (isLutListing(listing)) {
    return "lut";
  }
  if (isZineListing(listing)) {
    return "zine";
  }
  if (isOwnedListing(listing) || listing.id !== OUTLINE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingOutline(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseOutline(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingOutline(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseOutline(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeOutline(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === OUTLINE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(OUTLINE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(OUTLINE_CHANGED_EVENT, listener);
  };
}
