/**
 * I will not dart it — the windbreaker stays worn twice and a car.
 * Still tote.
 *
 * Wash is I washed it. Spray is no Scotchgard. Lining is the shell.
 * Cinch is the waist. Size is the lying tag. Stitch is the split-sole
 * pair, not this jacket. Walkers still want Closet to dart the
 * sides, or “make it a real M.” I will not dart it. Still worn
 * twice. Still a car. Still for sale. Not wash. Not spray. Not lining.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:dart-listing-ids` is the client dart set.
 * Cookie `iss-dart-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write wash, spray, lining, cinch, hood, elastic, scent, cream,
 * stitch, ferrite, variable, finalize, nest, anneal, grommet, gift,
 * buy, digital eligibility, or tote keys.
 * Host is `clo-windbreaker` only. Sneakers, lamp, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const DART_STORAGE_KEY = "iss:dart-listing-ids";
export const DART_COOKIE_NAME = "iss-dart-listing-ids";
export const DART_CHANGED_EVENT = "iss:dart-changed";

export const DART_HOST_ID = "clo-windbreaker";
export const DART_SNEAKER_ID = "clo-split-soles";
export const DART_LAMP_ID = "ysk-wobbly-lamp";
export const DART_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const DART_OWNED_IDS = [
  "clo-split-soles",
  "gtk-cable-drawer",
  "ysk-burned-cdr",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "kdr-bent-whisk",
  "ysk-wobbly-lamp",
  "gtk-game-boy",
  "dl-junk-pricing-pdf",
] as const;

export const DART_REFUSE_COPY = "That one does not take a dart note.";
export const DART_TABLE_LINE = "I will not dart it.";
export const DART_WORN_LINE = "Still worn twice.";
export const DART_CAR_LINE = "Still a car.";
export const DART_NOTICE_TITLE =
  "I will not dart it. Still worn twice. Still a car.";
export const DART_WALK_LINE =
  "Walkers still want Closet to dart the sides, or make it a real M.";
export const DART_STAYS_LINE =
  "This is the dart note. I will not dart it. Still worn twice. Still a car.";
export const DART_STILL_LINE = "Still tote. Not wash. Not spray. Not lining.";
export const DART_TOTE_LINE = "Add to tote still works.";
export const DART_EMPTY_LINE = "Nobody taped a dart note yet.";
export const DART_LEAVE_LINE = "Leave the hang";

const SERVER_STORE = Symbol.for("iss.dart-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(DART_OWNED_IDS);

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

export function parseDartListingIds(
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

export function dartCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const DART_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${DART_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(DART_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(DART_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${DART_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseDartListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readDartListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(DART_STORAGE_KEY);
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
          window.localStorage.setItem(DART_STORAGE_KEY, JSON.stringify(ids));
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

export function writeDartListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = dartCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(DART_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${DART_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(DART_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingDartOverlay(
  listingId: string,
  listingIds: readonly string[] = readDartListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isSneakerListing(listing: Listing) {
  return listing.id === DART_SNEAKER_ID;
}

function isLampListing(listing: Listing) {
  return listing.id === DART_LAMP_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host jacket only. Sneakers, lamp, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeDart(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== DART_HOST_ID) {
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

export type DartWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "sneakers"
  | "lamp"
  | "owned";

function refuseDart(
  listing: Listing | undefined,
): DartWriteReason | null {
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
  if (isSneakerListing(listing)) {
    return "sneakers";
  }
  if (isLampListing(listing)) {
    return "lamp";
  }
  if (isOwnedListing(listing) || listing.id !== DART_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingDart(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDart(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingDart(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDart(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeDart(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === DART_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(DART_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(DART_CHANGED_EVENT, listener);
  };
}
