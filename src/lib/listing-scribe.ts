/**
 * I will not scribe it — the lid stays unmarked. Still a lid. Still no pot.
 *
 * Knurl is cut-new-grip. Glass is the pane. Fits is 3-quart.
 * Saucepan is the missing pot. Lap is the polish. Gasket is the
 * seal. Walkers still want Sink Drawer to scribe the lid, or
 * “scratch the pot size so it finds a mate.” I will not scribe
 * it. Still a lid. Still no pot. Still for sale. Not knurl.
 * Not saucepan. Not glass.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:scribe-listing-ids` is the client scribe set.
 * Cookie `iss-scribe-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write knurl, glass, fits, saucepan, lap, gasket, knob, vent,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-lid-no-pot` only. Mug, recipes, whisk, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SCRIBE_STORAGE_KEY = "iss:scribe-listing-ids";
export const SCRIBE_COOKIE_NAME = "iss-scribe-listing-ids";
export const SCRIBE_CHANGED_EVENT = "iss:scribe-changed";

export const SCRIBE_HOST_ID = "kdr-lid-no-pot";
export const SCRIBE_MUG_ID = "kdr-chipped-mug";
export const SCRIBE_WHISK_ID = "kdr-bent-whisk";
export const SCRIBE_RECIPES_ID = "dl-drawer-recipes";
export const SCRIBE_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const SCRIBE_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-camera-luts",
  "mdb-scratched-lp",
] as const;

const ownedSet = new Set<string>(SCRIBE_OWNED_IDS);

export const SCRIBE_REFUSE_COPY = "That one does not take a scribe note.";
export const SCRIBE_TABLE_LINE = "I will not scribe it.";
export const SCRIBE_LID_LINE = "Still a lid.";
export const SCRIBE_POT_LINE = "Still no pot.";
export const SCRIBE_NOTICE_TITLE =
  "I will not scribe it. Still a lid. Still no pot.";
export const SCRIBE_WALK_LINE =
  "Walkers still want Sink Drawer to scribe the lid, or scratch the pot size so it finds a mate.";
export const SCRIBE_STAYS_LINE =
  "This is the scribe note. I will not scribe it. Still a lid. Still no pot.";
export const SCRIBE_STILL_LINE =
  "Still tote. Not knurl. Not saucepan. Not a shop. Not glass.";
export const SCRIBE_TOTE_LINE = "Add to tote still works.";
export const SCRIBE_EMPTY_LINE = "Nobody taped a scribe note yet.";
export const SCRIBE_LEAVE_LINE = "Leave the glass";

const SERVER_STORE = Symbol.for("iss.scribe-listing-ids");

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

export function parseScribeListingIds(
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

export function scribeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SCRIBE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SCRIBE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SCRIBE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SCRIBE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SCRIBE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseScribeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readScribeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SCRIBE_STORAGE_KEY);
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
          window.localStorage.setItem(SCRIBE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeScribeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = scribeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SCRIBE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SCRIBE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SCRIBE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingScribeOverlay(
  listingId: string,
  listingIds: readonly string[] = readScribeListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMugListing(listing: Listing) {
  return listing.id === SCRIBE_MUG_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === SCRIBE_WHISK_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === SCRIBE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host lid only. Mug, whisk, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeScribe(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== SCRIBE_HOST_ID) {
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

export type ScribeWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mug"
  | "whisk"
  | "chair"
  | "owned";

function refuseScribe(
  listing: Listing | undefined,
): ScribeWriteReason | null {
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
  if (isWhiskListing(listing)) {
    return "whisk";
  }
  if (isOwnedListing(listing) || listing.id !== SCRIBE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingScribe(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseScribe(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingScribe(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseScribe(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeScribe(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SCRIBE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SCRIBE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SCRIBE_CHANGED_EVENT, listener);
  };
}
