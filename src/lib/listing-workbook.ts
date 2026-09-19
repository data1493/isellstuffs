/**
 * There is no workbook — the junk PDF is the file. Still tote.
 *
 * Grade is I don't grade. This is the junk PDF with no companion
 * book. That's the file. Still for sale. Not scan. Not the folder.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:workbook-listing-ids` is the client workbook set.
 * Cookie `iss-workbook-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write grade, scan, folder, skip, stack, pile, remote,
 * listing-cases, stick, wash, plays, press, film, look, ask, hands,
 * van, firm, packed, sold, file-gone, gift, buy, digital eligibility,
 * chip, hinge, burn, or tote keys.
 * Physical listings and gift cards are refused — a lamp does not
 * take a workbook. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "./commerce/types";

export const WORKBOOK_STORAGE_KEY = "iss:workbook-listing-ids";
export const WORKBOOK_COOKIE_NAME = "iss-workbook-listing-ids";
export const WORKBOOK_CHANGED_EVENT = "iss:workbook-changed";

export const WORKBOOK_REFUSE_COPY = "That one does not take a workbook.";
export const WORKBOOK_TABLE_LINE = "There is no workbook.";
export const WORKBOOK_FILE_LINE = "The PDF is the file.";
export const WORKBOOK_GRADE_LINE =
  "Grade is I don't grade. This is the junk PDF with no companion book.";
export const WORKBOOK_STILL_LINE = "Still tote. Not a fourth status.";
export const WORKBOOK_TOTE_LINE = "Add to tote still works.";
export const WORKBOOK_SCAN_LINE = "Not scan. Not the folder.";
export const WORKBOOK_EMPTY_LINE = "Nobody taped the workbook yet.";

const SERVER_STORE = Symbol.for("iss.workbook-listing-ids");

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

export function parseWorkbookListingIds(
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

export function workbookCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const WORKBOOK_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${WORKBOOK_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(WORKBOOK_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(WORKBOOK_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${WORKBOOK_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseWorkbookListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readWorkbookListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(WORKBOOK_STORAGE_KEY);
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
          window.localStorage.setItem(
            WORKBOOK_STORAGE_KEY,
            JSON.stringify(ids),
          );
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

export function writeWorkbookListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = workbookCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(WORKBOOK_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${WORKBOOK_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(WORKBOOK_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingWorkbookOverlay(
  listingId: string,
  listingIds = readWorkbookListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeWorkbook(
  listing: Listing | undefined,
): listing is Listing {
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

export type WorkbookWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type WorkbookWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: WorkbookWriteReason; listingIds: string[] };

function refuseWorkbook(
  listing: Listing | undefined,
  listingIds: string[],
): WorkbookWriteResult | null {
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

export function markListingWorkbook(
  listing: Listing | undefined,
  listingIds: string[],
): WorkbookWriteResult {
  const refused = refuseWorkbook(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingWorkbook(
  listing: Listing | undefined,
  listingIds: string[],
): WorkbookWriteResult {
  const refused = refuseWorkbook(listing, listingIds);
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

export function subscribeWorkbook(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === WORKBOOK_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(WORKBOOK_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(WORKBOOK_CHANGED_EVENT, listener);
  };
}
