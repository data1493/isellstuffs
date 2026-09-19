/**
 * I will not quantize them — twelve shots stay twelve shots. Still a zip.
 * Still tote.
 *
 * Stems is twelve shots. Tune is pitch. Gate is kick-ring. Crush is
 * make-them-hit. Walkers still want Beats to quantize the pack, or
 * “snap the kicks to the grid.” I will not quantize them. Still
 * twelve shots. Still a zip. Still for sale. Not gate. Not tune.
 * Not a shop. Not crush.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:quantize-listing-ids` is the client quantize set.
 * Cookie `iss-quantize-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write stems, tune, gate, crush, bounce, loop, rights, scale,
 * bpm, burn, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-sample-pack` only. Font, LUT, recipes, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const QUANTIZE_STORAGE_KEY = "iss:quantize-listing-ids";
export const QUANTIZE_COOKIE_NAME = "iss-quantize-listing-ids";
export const QUANTIZE_CHANGED_EVENT = "iss:quantize-changed";

export const QUANTIZE_HOST_ID = "dl-sample-pack";
export const QUANTIZE_FONT_ID = "dl-booth-font";
export const QUANTIZE_LUT_ID = "dl-camera-luts";
export const QUANTIZE_ZINE_ID = "dl-stain-zine";
export const QUANTIZE_RECIPES_ID = "dl-drawer-recipes";
export const QUANTIZE_GIFT_ID = "dl-mall-gift-card";
export const QUANTIZE_CDR_ID = "ysk-burned-cdr";
export const QUANTIZE_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const QUANTIZE_OWNED_IDS = [
  QUANTIZE_FONT_ID,
  QUANTIZE_LUT_ID,
  QUANTIZE_ZINE_ID,
  QUANTIZE_RECIPES_ID,
  QUANTIZE_GIFT_ID,
  QUANTIZE_CDR_ID,
  "dl-junk-pricing-pdf",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "ysk-wobbly-lamp",
] as const;

const ownedSet = new Set<string>(QUANTIZE_OWNED_IDS);

export const QUANTIZE_REFUSE_COPY = "That one does not take a quantize note.";
export const QUANTIZE_TABLE_LINE = "I will not quantize them.";
export const QUANTIZE_SHOTS_LINE = "Still twelve shots.";
export const QUANTIZE_ZIP_LINE = "Still a zip.";
export const QUANTIZE_NOTICE_TITLE =
  "I will not quantize them. Still twelve shots. Still a zip.";
export const QUANTIZE_WALK_LINE =
  "Walkers still want Beats to quantize the pack, or snap the kicks to the grid.";
export const QUANTIZE_STAYS_LINE =
  "This is the quantize note. I will not quantize them. Still twelve shots. Still a zip.";
export const QUANTIZE_STILL_LINE =
  "Still tote. Not gate. Not tune. Not a shop. Not crush.";
export const QUANTIZE_TOTE_LINE = "Add to tote still works.";
export const QUANTIZE_EMPTY_LINE = "Nobody taped a quantize note yet.";
export const QUANTIZE_LEAVE_LINE = "Leave the twelve shots";

const SERVER_STORE = Symbol.for("iss.quantize-listing-ids");

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

export function parseQuantizeListingIds(
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

export function quantizeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const QUANTIZE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${QUANTIZE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(QUANTIZE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(QUANTIZE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${QUANTIZE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseQuantizeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readQuantizeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(QUANTIZE_STORAGE_KEY);
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
          window.localStorage.setItem(QUANTIZE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeQuantizeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = quantizeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(QUANTIZE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${QUANTIZE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(QUANTIZE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingQuantizeOverlay(
  listingId: string,
  listingIds: readonly string[] = readQuantizeListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isFontListing(listing: Listing) {
  return listing.id === QUANTIZE_FONT_ID;
}

function isLutListing(listing: Listing) {
  return listing.id === QUANTIZE_LUT_ID;
}

function isRecipesListing(listing: Listing) {
  return listing.id === QUANTIZE_RECIPES_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host sample pack only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeQuantize(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== QUANTIZE_HOST_ID) {
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

export type QuantizeWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "font"
  | "lut"
  | "recipes"
  | "zine"
  | "owned";

function refuseQuantize(
  listing: Listing | undefined,
): QuantizeWriteReason | null {
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
  if (!isDigitalListing(listing)) {
    return "physical";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (isLutListing(listing)) {
    return "lut";
  }
  if (isRecipesListing(listing)) {
    return "recipes";
  }
  if (listing.id === QUANTIZE_ZINE_ID) {
    return "zine";
  }
  if (isOwnedListing(listing) || listing.id !== QUANTIZE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingQuantize(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseQuantize(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingQuantize(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseQuantize(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeQuantize(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === QUANTIZE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(QUANTIZE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(QUANTIZE_CHANGED_EVENT, listener);
  };
}
