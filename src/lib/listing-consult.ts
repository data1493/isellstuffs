/**
 * I don't consult — one page. Still a rule of thumb. Still tote.
 *
 * Typeset is I will not Canva it. Revise is not this year’s numbers.
 * Print is I don’t print the PDF at the table. Workbook is no sequel.
 * Grid is I will not spreadsheet. Appraise / rule were killed.
 * Walkers still want Tuesday to price their pile, or “tell me what
 * this is worth.” I don't consult. One page. Still a rule of thumb.
 * Still for sale. Not typeset. Not a desk. Not grid.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:consult-listing-ids` is the client consult set.
 * Cookie `iss-consult-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write typeset, revise, workbook, print, grid, mins, expire,
 * kit, rule, appraise, folder, film, look, ask, hands, van, firm,
 * packed, sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp is not a
 * consult. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const CONSULT_STORAGE_KEY = "iss:consult-listing-ids";
export const CONSULT_COOKIE_NAME = "iss-consult-listing-ids";
export const CONSULT_CHANGED_EVENT = "iss:consult-changed";

export const CONSULT_REFUSE_COPY = "That one does not take a consult.";
export const CONSULT_TABLE_LINE = "I don't consult.";
export const CONSULT_ONE_LINE = "One page.";
export const CONSULT_RULE_LINE = "Still a rule of thumb.";
export const CONSULT_NOTICE_TITLE =
  "I don't consult. One page. Still a rule of thumb.";
export const CONSULT_WALK_LINE =
  "Walkers still want Tuesday to price their pile, or tell me what this is worth.";
export const CONSULT_STILL_LINE =
  "Still tote. Not typeset. Not a desk. Not grid.";
export const CONSULT_TOTE_LINE = "Add to tote still works.";
export const CONSULT_EMPTY_LINE = "Nobody taped a consult yet.";

const SERVER_STORE = Symbol.for("iss.consult-listing-ids");

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

export function parseConsultListingIds(
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

export function consultCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const CONSULT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CONSULT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(CONSULT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(CONSULT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CONSULT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseConsultListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readConsultListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(CONSULT_STORAGE_KEY);
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
          window.localStorage.setItem(CONSULT_STORAGE_KEY, JSON.stringify(ids));
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

export function writeConsultListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = consultCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CONSULT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${CONSULT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(CONSULT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingConsultOverlay(
  listingId: string,
  listingIds: readonly string[] = readConsultListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeConsult(listing: Listing | undefined): listing is Listing {
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

export type ConsultWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type ConsultWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: ConsultWriteReason; listingIds: string[] };

function refuseConsult(
  listing: Listing | undefined,
  listingIds: string[],
): ConsultWriteResult | null {
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

export function markListingConsult(
  listing: Listing | undefined,
  listingIds: string[],
): ConsultWriteResult {
  const refused = refuseConsult(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingConsult(
  listing: Listing | undefined,
  listingIds: string[],
): ConsultWriteResult {
  const refused = refuseConsult(listing, listingIds);
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

export function subscribeConsult(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSULT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CONSULT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CONSULT_CHANGED_EVENT, listener);
  };
}
