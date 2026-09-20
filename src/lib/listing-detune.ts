/**
 * I will not detune them — the shots stay where they sit. Still slaps.
 * Still four dollars. Still tote.
 *
 * Saturate is brown-the-kicks. Quantize is snap-the-kicks. Gate is
 * kick-ring. Norm is level. Resample is queued. Dither is queued.
 * Walkers still want Beats to detune them, or “slip the twelve so
 * they sit in C without a shop resample.” I will not detune them.
 * Still slaps. Still four dollars. Still for sale. Not saturate.
 * Not quantize. Not a shop. Not resample. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:detune-listing-ids` is the client detune set.
 * Cookie `iss-detune-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write saturate, quantize, resample, dither, gate, norm,
 * tune, gain, loud, peak, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-sample-pack` only. Font, LUT, Game Boy, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Detune is slip the shots, not a login. Register stays print bars.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const DETUNE_STORAGE_KEY = "iss:detune-listing-ids";
export const DETUNE_COOKIE_NAME = "iss-detune-listing-ids";
export const DETUNE_CHANGED_EVENT = "iss:detune-changed";

export const DETUNE_HOST_ID = "dl-sample-pack";
export const DETUNE_FONT_ID = "dl-booth-font";
export const DETUNE_LUT_ID = "dl-camera-luts";
export const DETUNE_BOY_ID = "gtk-game-boy";
export const DETUNE_ZINE_ID = "dl-stain-zine";
export const DETUNE_GIFT_ID = "dl-mall-gift-card";
export const DETUNE_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const DETUNE_OWNED_IDS = [
  DETUNE_FONT_ID,
  DETUNE_LUT_ID,
  DETUNE_BOY_ID,
  DETUNE_ZINE_ID,
  DETUNE_GIFT_ID,
  "dl-junk-pricing-pdf",
  "dl-drawer-recipes",
  "dl-crate-side-a",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "mdb-scratched-lp",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
] as const;

const ownedSet = new Set<string>(DETUNE_OWNED_IDS);

export const DETUNE_REFUSE_COPY = "That one does not take a detune note.";
export const DETUNE_TABLE_LINE = "I will not detune them.";
export const DETUNE_SLAPS_LINE = "Still slaps.";
export const DETUNE_FOUR_LINE = "Still four dollars.";
export const DETUNE_NOTICE_TITLE =
  "I will not detune them. Still slaps. Still four dollars.";
export const DETUNE_WALK_LINE =
  "Walkers still want Beats to detune them, or slip the twelve so they sit in C without a shop resample.";
export const DETUNE_STAYS_LINE =
  "This is the detune note. I will not detune them. Still slaps. Still four dollars.";
export const DETUNE_STILL_LINE =
  "Still tote. Not saturate. Not quantize. Not a shop. Not resample. Not an account.";
export const DETUNE_TOTE_LINE = "Add to tote still works.";
export const DETUNE_EMPTY_LINE = "Nobody taped a detune note yet.";
export const DETUNE_LEAVE_LINE = "Leave the shots";

const SERVER_STORE = Symbol.for("iss.detune-listing-ids");

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

export function parseDetuneListingIds(
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

export function detuneCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const DETUNE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${DETUNE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(DETUNE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(DETUNE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${DETUNE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseDetuneListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readDetuneListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(DETUNE_STORAGE_KEY);
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
          window.localStorage.setItem(DETUNE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeDetuneListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = detuneCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(DETUNE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${DETUNE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(DETUNE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingDetuneOverlay(
  listingId: string,
  listingIds: readonly string[] = readDetuneListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isFontListing(listing: Listing) {
  return listing.id === DETUNE_FONT_ID;
}

function isLutListing(listing: Listing) {
  return listing.id === DETUNE_LUT_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host sample pack only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeDetune(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== DETUNE_HOST_ID) {
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

export type DetuneWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "font"
  | "lut"
  | "zine"
  | "chair"
  | "owned";

function refuseDetune(
  listing: Listing | undefined,
): DetuneWriteReason | null {
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
  if (listing.id === DETUNE_ZINE_ID) {
    return "zine";
  }
  if (listing.id === DETUNE_CHAIR_ID) {
    return "chair";
  }
  if (isOwnedListing(listing) || listing.id !== DETUNE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingDetune(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDetune(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingDetune(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDetune(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeDetune(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === DETUNE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(DETUNE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(DETUNE_CHANGED_EVENT, listener);
  };
}
