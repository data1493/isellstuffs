/**
 * The discs walked — empty jewel case. Still tote.
 *
 * Jewel case on the table. The discs walked.
 * Plays is how many times it spun. This is an empty case.
 * Not wrap.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:cases-listing-ids` is the client empty-case set.
 * Cookie `iss-cases-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write plays, fits, laces, heat, wrap, poly, size, smoke, cells,
 * pockets, parts, film, look, ask, hands, scan, heavy, with, van, firm,
 * packed, sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF is not a jewel case.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const CASES_STORAGE_KEY = "iss:cases-listing-ids";
export const CASES_COOKIE_NAME = "iss-cases-listing-ids";
export const CASES_CHANGED_EVENT = "iss:cases-changed";

export const CASES_REFUSE_COPY = "That one is not an empty case.";
export const CASES_TABLE_LINE = "The discs walked.";
export const CASES_JEWEL_LINE = "Jewel case on the table.";
export const CASES_PLAYS_LINE = "Plays is how many times it spun.";
export const CASES_WRAP_LINE = "This is an empty case. Not wrap.";
export const CASES_STILL_LINE = "The case is empty. Still tote.";
export const CASES_TOTE_LINE = "Add to tote still works.";
export const CASES_EMPTY_LINE = "Nobody taped the empty case yet.";

const SERVER_STORE = Symbol.for("iss.cases-listing-ids");

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

export function parseCasesListingIds(raw: string | null | undefined): string[] {
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

export function casesCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const CASES_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CASES_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(CASES_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(CASES_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CASES_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseCasesListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readCasesListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(CASES_STORAGE_KEY);
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
          window.localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(ids));
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

export function writeCasesListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = casesCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CASES_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${CASES_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(CASES_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingCasesOverlay(
  listingId: string,
  listingIds = readCasesListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeCases(listing: Listing | undefined): listing is Listing {
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

export type CasesWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type CasesWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: CasesWriteReason; listingIds: string[] };

function refuseCases(
  listing: Listing | undefined,
  listingIds: string[],
): CasesWriteResult | null {
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

export function markListingCases(
  listing: Listing | undefined,
  listingIds: string[],
): CasesWriteResult {
  const refused = refuseCases(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingCases(
  listing: Listing | undefined,
  listingIds: string[],
): CasesWriteResult {
  const refused = refuseCases(listing, listingIds);
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

export function subscribeCases(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CASES_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CASES_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CASES_CHANGED_EVENT, listener);
  };
}
