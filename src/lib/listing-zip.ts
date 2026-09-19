/**
 * I don't have the zip — leftover jewel honesty. Still tote.
 *
 * Stick is I don't email the zip. Burn is no fresh disc. Print is Beats
 * will not run the PDF at the table. Ink is the Sharpie stays. Plays is
 * I spun it once. Walkers still open the BEATS 07 jewel expecting the
 * folder zip, a USB in the case, or Beats to unzip at the table.
 * The disc is the leftover. Pay and open the folder. Still for sale.
 * Not stick. Not a USB shop. Not ink.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:zip-listing-ids` is the client zip set.
 * Cookie `iss-zip-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write ink, plays, stick, print, burn, rip, dump, folder, unzip,
 * files, wav, film, look, ask, hands, van, firm, packed, sold,
 * file-gone, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a sample-pack zip is
 * not a leftover jewel. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const ZIP_STORAGE_KEY = "iss:zip-listing-ids";
export const ZIP_COOKIE_NAME = "iss-zip-listing-ids";
export const ZIP_CHANGED_EVENT = "iss:zip-changed";

export const ZIP_REFUSE_COPY = "That one is not a leftover zip.";
export const ZIP_TABLE_LINE = "I don't have the zip.";
export const ZIP_DISC_LINE = "The disc is the leftover.";
export const ZIP_NOTICE_TITLE = "I don't have the zip. The disc is the leftover.";
export const ZIP_STICK_LINE = "Stick is I don't email the zip.";
export const ZIP_BURN_LINE = "Burn is no fresh disc. Print is Beats will not run the PDF.";
export const ZIP_INK_LINE = "Ink is the Sharpie stays. Plays is I spun it once.";
export const ZIP_FOLDER_LINE = "Pay and open the folder.";
export const ZIP_STILL_LINE = "Still tote. Not stick. Not a USB shop. Not ink.";
export const ZIP_TOTE_LINE = "Add to tote still works.";
export const ZIP_EMPTY_LINE = "Nobody taped the leftover zip yet.";

const SERVER_STORE = Symbol.for("iss.zip-listing-ids");

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

export function parseZipListingIds(raw: string | null | undefined): string[] {
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

export function zipCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const ZIP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${ZIP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(ZIP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(ZIP_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${ZIP_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseZipListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readZipListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(ZIP_STORAGE_KEY);
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
          window.localStorage.setItem(ZIP_STORAGE_KEY, JSON.stringify(ids));
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

export function writeZipListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = zipCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(ZIP_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${ZIP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(ZIP_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingZipOverlay(
  listingId: string,
  listingIds = readZipListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeZip(listing: Listing | undefined): listing is Listing {
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

export type ZipWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type ZipWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: ZipWriteReason; listingIds: string[] };

function refuseZip(
  listing: Listing | undefined,
  listingIds: string[],
): ZipWriteResult | null {
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

export function markListingZip(
  listing: Listing | undefined,
  listingIds: string[],
): ZipWriteResult {
  const refused = refuseZip(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingZip(
  listing: Listing | undefined,
  listingIds: string[],
): ZipWriteResult {
  const refused = refuseZip(listing, listingIds);
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

export function subscribeZip(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === ZIP_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(ZIP_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ZIP_CHANGED_EVENT, listener);
  };
}
