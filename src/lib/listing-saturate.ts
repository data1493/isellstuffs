/**
 * I will not saturate them — the kicks stay thin. Still twelve shots.
 * Still a zip. Still tote.
 *
 * Quantize is snap-the-kicks. Gate is kick-ring. Tune is pitch.
 * Crush is make-them-hit. Dither is queued. Walkers still want
 * Beats to saturate them, or “brown the one-shots so the pack hits.”
 * I will not saturate them. Still twelve shots. Still a zip. Still
 * for sale. Not quantize. Not crush. Not a shop. Not gate.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:saturate-listing-ids` is the client saturate set.
 * Cookie `iss-saturate-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write quantize, gate, tune, crush, dither, stems, loop, clip,
 * norm, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-sample-pack` only. Font, LUT, gift, zine, physical,
 * and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const SATURATE_STORAGE_KEY = "iss:saturate-listing-ids";
export const SATURATE_COOKIE_NAME = "iss-saturate-listing-ids";
export const SATURATE_CHANGED_EVENT = "iss:saturate-changed";

export const SATURATE_HOST_ID = "dl-sample-pack";
export const SATURATE_FONT_ID = "dl-booth-font";
export const SATURATE_LUT_ID = "dl-camera-luts";
export const SATURATE_ZINE_ID = "dl-stain-zine";
export const SATURATE_GIFT_ID = "dl-mall-gift-card";
export const SATURATE_DRAWER_ID = "gtk-cable-drawer";
export const SATURATE_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const SATURATE_OWNED_IDS = [
  SATURATE_FONT_ID,
  SATURATE_LUT_ID,
  SATURATE_ZINE_ID,
  SATURATE_GIFT_ID,
  SATURATE_DRAWER_ID,
  "dl-junk-pricing-pdf",
  "dl-drawer-recipes",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-game-boy",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "mdb-scratched-lp",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
] as const;

const ownedSet = new Set<string>(SATURATE_OWNED_IDS);

export const SATURATE_REFUSE_COPY = "That one does not take a saturate note.";
export const SATURATE_TABLE_LINE = "I will not saturate them.";
export const SATURATE_SHOTS_LINE = "Still twelve shots.";
export const SATURATE_ZIP_LINE = "Still a zip.";
export const SATURATE_NOTICE_TITLE =
  "I will not saturate them. Still twelve shots. Still a zip.";
export const SATURATE_WALK_LINE =
  "Walkers still want Beats to saturate them, or brown the one-shots so the pack hits.";
export const SATURATE_STAYS_LINE =
  "This is the saturate note. I will not saturate them. Still twelve shots. Still a zip.";
export const SATURATE_STILL_LINE =
  "Still tote. Not quantize. Not crush. Not a shop. Not gate.";
export const SATURATE_TOTE_LINE = "Add to tote still works.";
export const SATURATE_EMPTY_LINE = "Nobody taped a saturate note yet.";
export const SATURATE_LEAVE_LINE = "Leave the kicks thin";

const SERVER_STORE = Symbol.for("iss.saturate-listing-ids");

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

export function parseSaturateListingIds(
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

export function saturateCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SATURATE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SATURATE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SATURATE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SATURATE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SATURATE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSaturateListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSaturateListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SATURATE_STORAGE_KEY);
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
          window.localStorage.setItem(SATURATE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSaturateListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = saturateCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SATURATE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SATURATE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SATURATE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSaturateOverlay(
  listingId: string,
  listingIds: readonly string[] = readSaturateListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isFontListing(listing: Listing) {
  return listing.id === SATURATE_FONT_ID;
}

function isLutListing(listing: Listing) {
  return listing.id === SATURATE_LUT_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host sample pack only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeSaturate(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== SATURATE_HOST_ID) {
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

export type SaturateWriteReason =
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

function refuseSaturate(
  listing: Listing | undefined,
): SaturateWriteReason | null {
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
  if (listing.id === SATURATE_ZINE_ID) {
    return "zine";
  }
  if (listing.id === SATURATE_CHAIR_ID) {
    return "chair";
  }
  if (isOwnedListing(listing) || listing.id !== SATURATE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingSaturate(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSaturate(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingSaturate(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSaturate(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeSaturate(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SATURATE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SATURATE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SATURATE_CHANGED_EVENT, listener);
  };
}
