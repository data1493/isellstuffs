/**
 * I will not snug it — the lid stays a wiggle. Still a wiggle.
 * Still a lid.
 *
 * Tap is thread-the-lid. Vent is steam-hole. Knurl is cut-new-grip.
 * Stake is set-the-knob. Walkers still want Sink Drawer to snug
 * it, or “finger-tight the loose knob so the glass sits without
 * a shop tap.” I will not snug it. Still a wiggle. Still a lid.
 * Still for sale. Not tap. Not vent. Not a shop. Not knurl.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:snug-listing-ids` is the client snug set.
 * Cookie `iss-snug-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write tap, vent, knurl, stake, chamfer, chase, tighten,
 * seat, die, gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-lid-no-pot` only. Mug, recipes, whisk, lamp, gift,
 * zine, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SNUG_STORAGE_KEY = "iss:snug-listing-ids";
export const SNUG_COOKIE_NAME = "iss-snug-listing-ids";
export const SNUG_CHANGED_EVENT = "iss:snug-changed";

export const SNUG_HOST_ID = "kdr-lid-no-pot";
export const SNUG_MUG_ID = "kdr-chipped-mug";
export const SNUG_WHISK_ID = "kdr-bent-whisk";
export const SNUG_RECIPES_ID = "dl-drawer-recipes";
export const SNUG_LAMP_ID = "ysk-wobbly-lamp";
export const SNUG_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const SNUG_OWNED_IDS = [
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

const ownedSet = new Set<string>(SNUG_OWNED_IDS);

export const SNUG_REFUSE_COPY = "That one does not take a snug note.";
export const SNUG_TABLE_LINE = "I will not snug it.";
export const SNUG_WIGGLE_LINE = "Still a wiggle.";
export const SNUG_LID_LINE = "Still a lid.";
export const SNUG_NOTICE_TITLE =
  "I will not snug it. Still a wiggle. Still a lid.";
export const SNUG_WALK_LINE =
  "Walkers still want Sink Drawer to snug it, or finger-tight the loose knob so the glass sits without a shop tap.";
export const SNUG_STAYS_LINE =
  "This is the snug note. I will not snug it. Still a wiggle. Still a lid.";
export const SNUG_STILL_LINE =
  "Still tote. Not tap. Not vent. Not a shop. Not knurl.";
export const SNUG_TOTE_LINE = "Add to tote still works.";
export const SNUG_EMPTY_LINE = "Nobody taped a snug note yet.";
export const SNUG_LEAVE_LINE = "Leave the wiggle";

const SERVER_STORE = Symbol.for("iss.snug-listing-ids");

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

export function parseSnugListingIds(
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

export function snugCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SNUG_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SNUG_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SNUG_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SNUG_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SNUG_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSnugListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSnugListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SNUG_STORAGE_KEY);
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
          window.localStorage.setItem(SNUG_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSnugListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = snugCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SNUG_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SNUG_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SNUG_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSnugOverlay(
  listingId: string,
  listingIds: readonly string[] = readSnugListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMugListing(listing: Listing) {
  return listing.id === SNUG_MUG_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === SNUG_WHISK_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === SNUG_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host lid only. Mug, whisk, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeSnug(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== SNUG_HOST_ID) {
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

export type SnugWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mug"
  | "whisk"
  | "chair"
  | "owned";

function refuseSnug(listing: Listing | undefined): SnugWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== SNUG_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingSnug(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSnug(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingSnug(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSnug(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeSnug(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SNUG_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SNUG_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SNUG_CHANGED_EVENT, listener);
  };
}
