/**
 * I will not scale them — the recipe scans stay three cards. Still tote.
 *
 * Cards is typed-cookbook. Vibe is cups. Double is yield. Metric is
 * grams. Walkers still want Sink Drawer to scale the scans, or
 * “rewrite the ratios for a crowd.” I will not scale them. Still
 * vibes. Still three cards. Still for sale. Not metric. Not double.
 * Not a shop. Not cards.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:scale-listing-ids` is the client scale set.
 * Cookie `iss-scale-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write cards, vibe, double, mins, metric, grease, laminate,
 * paginate, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-drawer-recipes` only. Junk PDF, font, lid, gift, zine,
 * and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const SCALE_STORAGE_KEY = "iss:scale-listing-ids";
export const SCALE_COOKIE_NAME = "iss-scale-listing-ids";
export const SCALE_CHANGED_EVENT = "iss:scale-changed";

export const SCALE_HOST_ID = "dl-drawer-recipes";
export const SCALE_PDF_ID = "dl-junk-pricing-pdf";
export const SCALE_FONT_ID = "dl-booth-font";
export const SCALE_LID_ID = "kdr-lid-no-pot";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const SCALE_OWNED_IDS = [
  SCALE_PDF_ID,
  SCALE_FONT_ID,
  SCALE_LID_ID,
  "dl-crate-side-a",
  "dl-sample-pack",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "kdr-chipped-mug",
  "kdr-bent-whisk",
] as const;

const ownedSet = new Set<string>(SCALE_OWNED_IDS);

export const SCALE_REFUSE_COPY = "That one does not take a scale note.";
export const SCALE_TABLE_LINE = "I will not scale them.";
export const SCALE_VIBE_LINE = "Still vibes.";
export const SCALE_CARDS_LINE = "Still three cards.";
export const SCALE_NOTICE_TITLE =
  "I will not scale them. Still vibes. Still three cards.";
export const SCALE_WALK_LINE =
  "Walkers still want Sink Drawer to scale the scans, or rewrite the ratios for a crowd.";
export const SCALE_STAYS_LINE =
  "This is the scale note. I will not scale them. Still vibes. Still three cards.";
export const SCALE_STILL_LINE =
  "Still tote. Not metric. Not double. Not a shop. Not cards.";
export const SCALE_TOTE_LINE = "Add to tote still works.";
export const SCALE_EMPTY_LINE = "Nobody taped a scale note yet.";
export const SCALE_LEAVE_LINE = "Leave the vibes";

const SERVER_STORE = Symbol.for("iss.scale-listing-ids");

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

export function parseScaleListingIds(
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

export function scaleCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SCALE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SCALE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SCALE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SCALE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SCALE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseScaleListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readScaleListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SCALE_STORAGE_KEY);
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
          window.localStorage.setItem(SCALE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeScaleListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = scaleCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SCALE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SCALE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SCALE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingScaleOverlay(
  listingId: string,
  listingIds: readonly string[] = readScaleListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPdfListing(listing: Listing) {
  return listing.id === SCALE_PDF_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === SCALE_FONT_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === SCALE_LID_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host recipes only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeScale(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== SCALE_HOST_ID) {
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

export type ScaleWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pdf"
  | "font"
  | "lid"
  | "owned";

function refuseScale(
  listing: Listing | undefined,
): ScaleWriteReason | null {
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
    return isLidListing(listing) ? "lid" : "physical";
  }
  if (isPdfListing(listing)) {
    return "pdf";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (isOwnedListing(listing) || listing.id !== SCALE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingScale(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseScale(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingScale(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseScale(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeScale(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SCALE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SCALE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SCALE_CHANGED_EVENT, listener);
  };
}
