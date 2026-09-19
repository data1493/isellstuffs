/**
 * Wrong on purpose — the Side A liner PDF that stays wrong. Still tote.
 *
 * Scan is paper to a file. Press is which pressing. This liner stays
 * wrong. That's the file. Still for sale. Not scan. Not grade.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:wrong-listing-ids` is the client wrong set.
 * Cookie `iss-wrong-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write scan, press, grade, vibe, workbook, stems, folder, stick,
 * book, cases, look, ask, hands, van, firm, packed, sold, file-gone,
 * gift, buy, digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp does not take
 * a wrong liner. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "./commerce/types";

export const WRONG_STORAGE_KEY = "iss:wrong-listing-ids";
export const WRONG_COOKIE_NAME = "iss-wrong-listing-ids";
export const WRONG_CHANGED_EVENT = "iss:wrong-changed";

export const WRONG_REFUSE_COPY = "That one does not take a wrong liner.";
export const WRONG_TABLE_LINE = "Wrong on purpose.";
export const WRONG_SCAN_LINE = "Scan is paper to a file. Press is which pressing.";
export const WRONG_LINER_LINE = "This is the Side A liner PDF that stays wrong.";
export const WRONG_STILL_LINE = "Still tote. Not scan. Not grade.";
export const WRONG_TOTE_LINE = "Add to tote still works.";
export const WRONG_EMPTY_LINE = "Nobody taped the liner yet.";

const SERVER_STORE = Symbol.for("iss.wrong-listing-ids");

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

export function parseWrongListingIds(raw: string | null | undefined): string[] {
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

export function wrongCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const WRONG_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${WRONG_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(WRONG_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(WRONG_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${WRONG_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseWrongListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readWrongListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(WRONG_STORAGE_KEY);
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
          window.localStorage.setItem(WRONG_STORAGE_KEY, JSON.stringify(ids));
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

export function writeWrongListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = wrongCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(WRONG_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${WRONG_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(WRONG_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingWrongOverlay(
  listingId: string,
  listingIds = readWrongListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeWrong(listing: Listing | undefined): listing is Listing {
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

export type WrongWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type WrongWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: WrongWriteReason; listingIds: string[] };

function refuseWrong(
  listing: Listing | undefined,
  listingIds: string[],
): WrongWriteResult | null {
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

export function markListingWrong(
  listing: Listing | undefined,
  listingIds: string[],
): WrongWriteResult {
  const refused = refuseWrong(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingWrong(
  listing: Listing | undefined,
  listingIds: string[],
): WrongWriteResult {
  const refused = refuseWrong(listing, listingIds);
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

export function subscribeWrong(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === WRONG_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(WRONG_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(WRONG_CHANGED_EVENT, listener);
  };
}
