/**
 * Pet hair stays — furniture and textile honesty. Still tote.
 *
 * Smoke is the jacket smell. Wash is I washed it.
 * This is furniture and textile pet hair.
 * Not smoke. Not wash.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:hair-listing-ids` is the client hair set.
 * Cookie `iss-hair-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write smoke, wash, pockets, box, sew, manual, size, laces, bent,
 * cord, shell, heat, cases, plays, fits, press, cells, parts, film, look,
 * ask, hands, scan, heavy, with, van, firm, packed, sold, file-gone, gift,
 * buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not hold pet hair.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const HAIR_STORAGE_KEY = "iss:hair-listing-ids";
export const HAIR_COOKIE_NAME = "iss-hair-listing-ids";
export const HAIR_CHANGED_EVENT = "iss:hair-changed";

export const HAIR_REFUSE_COPY = "That one is not pet hair.";
export const HAIR_TABLE_LINE = "Pet hair stays.";
export const HAIR_SMOKE_LINE = "Smoke is the jacket smell.";
export const HAIR_WASH_LINE = "Wash is I washed it.";
export const HAIR_STAYS_LINE = "This is furniture and textile pet hair.";
export const HAIR_STILL_LINE = "Still tote. Not smoke. Not wash.";
export const HAIR_TOTE_LINE = "Add to tote still works.";
export const HAIR_EMPTY_LINE = "Nobody taped the pet hair yet.";

const SERVER_STORE = Symbol.for("iss.hair-listing-ids");

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

export function parseHairListingIds(raw: string | null | undefined): string[] {
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

export function hairCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const HAIR_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${HAIR_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(HAIR_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(HAIR_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${HAIR_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseHairListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readHairListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(HAIR_STORAGE_KEY);
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
          window.localStorage.setItem(HAIR_STORAGE_KEY, JSON.stringify(ids));
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

export function writeHairListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = hairCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(HAIR_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${HAIR_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(HAIR_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingHairOverlay(
  listingId: string,
  listingIds = readHairListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeHair(listing: Listing | undefined): listing is Listing {
  if (!listing) {
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

export type HairWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type HairWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: HairWriteReason; listingIds: string[] };

function refuseHair(
  listing: Listing | undefined,
  listingIds: string[],
): HairWriteResult | null {
  if (!listing) {
    return { ok: false, reason: "missing", listingIds };
  }
  if (listing.status === "file-gone") {
    return { ok: false, reason: "file-gone", listingIds };
  }
  if (listing.status === "sold") {
    return { ok: false, reason: "sold", listingIds };
  }
  if (isGiftListing(listing)) {
    return { ok: false, reason: "gift", listingIds };
  }
  if (!isPhysicalListing(listing)) {
    return { ok: false, reason: "digital", listingIds };
  }
  return null;
}

export function markListingHair(
  listing: Listing | undefined,
  listingIds: string[],
): HairWriteResult {
  const refused = refuseHair(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingHair(
  listing: Listing | undefined,
  listingIds: string[],
): HairWriteResult {
  const refused = refuseHair(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return {
    ok: true,
    listingIds: listingIds.filter((id) => id !== taped.id),
  };
}

export function subscribeHair(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === HAIR_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(HAIR_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(HAIR_CHANGED_EVENT, listener);
  };
}
