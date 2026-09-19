/**
 * I will not grain them — the LUT pack stays three looks, still a cube.
 * Still tote.
 *
 * Warm stays warm. Convert is Rec.709. Grade is the look. Balance is
 * daylight. Shot is no hire-cam. Scope stays queued. Profile is CCM.
 * Slate is clapper. Log is in flight. Walkers still want Half-Working
 * to grain the looks, or “add 16mm so they look like film.” I will
 * not grain them. Still three looks. Still a cube. Still for sale.
 * Not convert. Not slate. Not a shop. Not scope.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:grain-listing-ids` is the client grain set.
 * Cookie `iss-grain-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write convert, grade, warm, balance, shot, scope, profile,
 * slate, log, film, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-camera-luts` only. Pack, font, Game Boy, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const GRAIN_STORAGE_KEY = "iss:grain-listing-ids";
export const GRAIN_COOKIE_NAME = "iss-grain-listing-ids";
export const GRAIN_CHANGED_EVENT = "iss:grain-changed";

export const GRAIN_HOST_ID = "dl-camera-luts";
export const GRAIN_PACK_ID = "dl-sample-pack";
export const GRAIN_FONT_ID = "dl-booth-font";
export const GRAIN_BOY_ID = "gtk-game-boy";
export const GRAIN_GIFT_ID = "dl-mall-gift-card";
export const GRAIN_ZINE_ID = "dl-stain-zine";
export const GRAIN_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const GRAIN_OWNED_IDS = [
  GRAIN_PACK_ID,
  GRAIN_FONT_ID,
  GRAIN_BOY_ID,
  "dl-junk-pricing-pdf",
  "dl-drawer-recipes",
  "dl-crate-side-a",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "mdb-scratched-lp",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "kdr-chipped-mug",
  "kdr-bent-whisk",
  "kdr-lid-no-pot",
] as const;

const ownedSet = new Set<string>(GRAIN_OWNED_IDS);

export const GRAIN_REFUSE_COPY = "That one does not take a grain note.";
export const GRAIN_TABLE_LINE = "I will not grain them.";
export const GRAIN_LOOKS_LINE = "Still three looks.";
export const GRAIN_CUBE_LINE = "Still a cube.";
export const GRAIN_NOTICE_TITLE =
  "I will not grain them. Still three looks. Still a cube.";
export const GRAIN_WALK_LINE =
  "Walkers still want Half-Working to grain the looks, or add 16mm so they look like film.";
export const GRAIN_STAYS_LINE =
  "This is the grain note. I will not grain them. Still three looks. Still a cube.";
export const GRAIN_STILL_LINE =
  "Still tote. Not convert. Not slate. Not a shop. Not scope.";
export const GRAIN_TOTE_LINE = "Add to tote still works.";
export const GRAIN_EMPTY_LINE = "Nobody taped a grain note yet.";
export const GRAIN_LEAVE_LINE = "Leave the looks";

const SERVER_STORE = Symbol.for("iss.grain-listing-ids");

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

export function parseGrainListingIds(
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

export function grainCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GRAIN_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GRAIN_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GRAIN_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GRAIN_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GRAIN_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGrainListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGrainListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GRAIN_STORAGE_KEY);
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
          window.localStorage.setItem(GRAIN_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGrainListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = grainCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GRAIN_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GRAIN_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GRAIN_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGrainOverlay(
  listingId: string,
  listingIds: readonly string[] = readGrainListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === GRAIN_PACK_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === GRAIN_FONT_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LUT pack only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeGrain(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== GRAIN_HOST_ID) {
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

export type GrainWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "font"
  | "owned";

function refuseGrain(listing: Listing | undefined): GrainWriteReason | null {
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
  if (isPackListing(listing)) {
    return "pack";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (isOwnedListing(listing) || listing.id !== GRAIN_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingGrain(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGrain(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingGrain(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGrain(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeGrain(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GRAIN_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GRAIN_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GRAIN_CHANGED_EVENT, listener);
  };
}
