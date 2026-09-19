/**
 * Measurements are vibes — recipe-card paper that will not give inches.
 *
 * Size is the lying tag. Fits is the lid. I don't measure.
 * These are vibes. Three cards. Not a cookbook.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:vibe-listing-ids` is the client vibe set.
 * Cookie `iss-vibe-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write size, fits, heat, chip, hinge, burn, grade, scan, stems,
 * workbook, folder, stick, press, film, look, ask, hands, van, firm,
 * packed, sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp does not take
 * recipe-card vibes. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "./commerce/types";

export const VIBE_STORAGE_KEY = "iss:vibe-listing-ids";
export const VIBE_COOKIE_NAME = "iss-vibe-listing-ids";
export const VIBE_CHANGED_EVENT = "iss:vibe-changed";

export const VIBE_REFUSE_COPY = "I don't measure that one.";
export const VIBE_TABLE_LINE = "Measurements are vibes.";
export const VIBE_COOKBOOK_LINE = "Three cards. Not a cookbook.";
export const VIBE_SIZE_LINE = "Size is the lying tag. Fits is the lid.";
export const VIBE_INCH_LINE =
  "This is recipe-card paper that will not give inches.";
export const VIBE_STILL_LINE = "Still tote. Not size. Not fits.";
export const VIBE_TOTE_LINE = "Add to tote still works.";
export const VIBE_EMPTY_LINE = "Nobody taped the vibes yet.";

const SERVER_STORE = Symbol.for("iss.vibe-listing-ids");

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

export function parseVibeListingIds(raw: string | null | undefined): string[] {
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

export function vibeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const VIBE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${VIBE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(VIBE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(VIBE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${VIBE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseVibeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readVibeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(VIBE_STORAGE_KEY);
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
          window.localStorage.setItem(VIBE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeVibeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = vibeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(VIBE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${VIBE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(VIBE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingVibeOverlay(
  listingId: string,
  listingIds = readVibeListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeVibe(listing: Listing | undefined): listing is Listing {
  if (!listing) {
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

export type VibeWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type VibeWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: VibeWriteReason; listingIds: string[] };

function refuseVibe(
  listing: Listing | undefined,
  listingIds: string[],
): VibeWriteResult | null {
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
  if (!isDigitalListing(listing)) {
    return { ok: false, reason: "physical", listingIds };
  }
  return null;
}

export function markListingVibe(
  listing: Listing | undefined,
  listingIds: string[],
): VibeWriteResult {
  const refused = refuseVibe(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingVibe(
  listing: Listing | undefined,
  listingIds: string[],
): VibeWriteResult {
  const refused = refuseVibe(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (!listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return {
    ok: true,
    listingIds: listingIds.filter((id) => id !== listing!.id),
  };
}

export function subscribeVibe(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === VIBE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(VIBE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(VIBE_CHANGED_EVENT, listener);
  };
}
