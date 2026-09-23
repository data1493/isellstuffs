/**
 * More in the van — another tangle out back. Ask.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:van-listing-ids` is the client van set.
 * Cookie `iss-van-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `status` or `cartEligible`.
 * Never write look, garage, packed, sold, file-gone, gift, or tote keys.
 * Gift listings and digital files are refused — a PDF is not a cable pile.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const VAN_STORAGE_KEY = "iss:van-listing-ids";
export const VAN_COOKIE_NAME = "iss-van-listing-ids";
export const VAN_CHANGED_EVENT = "iss:van-changed";

export const VAN_MISSING_COPY = "No van for that listing.";
export const VAN_FILE_COPY = "A file is not in the van.";
export const VAN_GIFT_COPY = "The gift card is at the desk.";
export const VAN_SOLD_COPY =
  "It already walked. Tape the next tangle, not this sticker.";
export const VAN_GONE_COPY = "The folder is empty. Nothing in the van.";
export const VAN_TABLE_LINE = "More out back. Ask.";
export const VAN_TOTE_LINE = "Still baggable. Add to tote still works.";
export const VAN_GARAGE_LINE = "Garage is home. This is the van.";
export const VAN_LOOK_LINE = "Look is not for sale. The van still is.";

const SERVER_STORE = Symbol.for("iss.van-listing-ids");

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

export function parseVanListingIds(raw: string | null | undefined): string[] {
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

export function vanCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const VAN_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${VAN_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(VAN_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(VAN_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${VAN_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseVanListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readVanListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(VAN_STORAGE_KEY);
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
          window.localStorage.setItem(VAN_STORAGE_KEY, JSON.stringify(ids));
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

export function writeVanListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = vanCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(VAN_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${VAN_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(VAN_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingVanOverlay(
  listingId: string,
  listingIds = readVanListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canStampVan(listing: Listing | undefined): listing is Listing {
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

export type VanWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type VanWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: VanWriteReason; listingIds: string[] };

function refuseVan(
  listing: Listing | undefined,
  listingIds: string[],
): VanWriteResult | null {
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

export function markListingVan(
  listing: Listing | undefined,
  listingIds: string[],
): VanWriteResult {
  const refused = refuseVan(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingVan(
  listing: Listing | undefined,
  listingIds: string[],
): VanWriteResult {
  const refused = refuseVan(listing, listingIds);
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

export function subscribeVan(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === VAN_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(VAN_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(VAN_CHANGED_EVENT, listener);
  };
}
