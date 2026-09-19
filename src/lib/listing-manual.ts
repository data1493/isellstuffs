/**
 * There is no manual — no paper in the box. Still tote.
 *
 * Booklet is liner notes. Workbook is a companion PDF.
 * This is a physical SKU with no paper manual. Figure it out.
 * Not booklet. Not workbook. Not a fourth status.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:manual-listing-ids` is the client manual set.
 * Cookie `iss-manual-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write book, workbook, cells, remote, foundry, knob, wrong,
 * vibe, scan, stems, skip, stack, pile, grade, parts, wash, stick,
 * cord, shell, cases, plays, press, film, look, ask, hands, van,
 * firm, packed, sold, file-gone, gift, buy, digital eligibility,
 * or tote keys.
 * Gift listings and digital files are refused — a PDF already is
 * the file, not a missing paper manual. Fixture `sold` / `file-gone`
 * rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const MANUAL_STORAGE_KEY = "iss:manual-listing-ids";
export const MANUAL_COOKIE_NAME = "iss-manual-listing-ids";
export const MANUAL_CHANGED_EVENT = "iss:manual-changed";

export const MANUAL_REFUSE_COPY = "That one does not take a missing manual.";
export const MANUAL_TABLE_LINE = "There is no manual.";
export const MANUAL_PAPER_LINE = "No paper in the box.";
export const MANUAL_FIGURE_LINE = "Figure it out.";
export const MANUAL_BOOK_LINE =
  "Booklet is liner notes. Workbook is a companion PDF.";
export const MANUAL_BOX_LINE = "This is a physical SKU with no paper manual.";
export const MANUAL_STILL_LINE = "Still tote. Not booklet. Not workbook.";
export const MANUAL_TOTE_LINE = "Add to tote still works.";
export const MANUAL_EMPTY_LINE = "Nobody taped the manual yet.";

const SERVER_STORE = Symbol.for("iss.manual-listing-ids");

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

export function parseManualListingIds(raw: string | null | undefined): string[] {
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

export function manualCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const MANUAL_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${MANUAL_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(MANUAL_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(MANUAL_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${MANUAL_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseManualListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readManualListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(MANUAL_STORAGE_KEY);
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
          window.localStorage.setItem(MANUAL_STORAGE_KEY, JSON.stringify(ids));
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

export function writeManualListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = manualCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(MANUAL_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${MANUAL_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(MANUAL_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingManualOverlay(
  listingId: string,
  listingIds = readManualListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeManual(listing: Listing | undefined): listing is Listing {
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

export type ManualWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type ManualWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: ManualWriteReason; listingIds: string[] };

function refuseManual(
  listing: Listing | undefined,
  listingIds: string[],
): ManualWriteResult | null {
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

export function markListingManual(
  listing: Listing | undefined,
  listingIds: string[],
): ManualWriteResult {
  const refused = refuseManual(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingManual(
  listing: Listing | undefined,
  listingIds: string[],
): ManualWriteResult {
  const refused = refuseManual(listing, listingIds);
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

export function subscribeManual(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === MANUAL_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(MANUAL_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(MANUAL_CHANGED_EVENT, listener);
  };
}
