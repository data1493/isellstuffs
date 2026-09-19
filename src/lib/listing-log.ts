/**
 * I will not unlog — the LUT pack stays parking-lot cubes. Still tote.
 *
 * Convert is Rec.709. Warm stays warm. Grade is no custom LUT.
 * Shot is no hire-cam. Balance is daylight. Walkers still want
 * Half-Working to unlog the parking-lot cubes, or “make them
 * Rec.709-ready.” I will not unlog. Parking-lot looks. Still
 * three cubes. Still for sale. Not convert. Not a color desk.
 * Not balance.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:log-listing-ids` is the client log set.
 * Cookie `iss-log-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write convert, warm, grade, shot, balance, recap, flash,
 * beep, cine, unlog, packed, sold, file-gone, gift, buy, digital
 * eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp does not
 * unlog. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const LOG_STORAGE_KEY = "iss:log-listing-ids";
export const LOG_COOKIE_NAME = "iss-log-listing-ids";
export const LOG_CHANGED_EVENT = "iss:log-changed";

export const LOG_REFUSE_COPY = "That one does not take a log note.";
export const LOG_TABLE_LINE = "I will not unlog.";
export const LOG_LOOKS_LINE = "Parking-lot looks.";
export const LOG_CUBES_LINE = "Still three cubes.";
export const LOG_NOTICE_TITLE =
  "I will not unlog. Parking-lot looks. Still three cubes.";
export const LOG_CONVERT_LINE =
  "Convert is Rec.709. Warm stays warm. Grade is no custom LUT.";
export const LOG_WALK_LINE =
  "Walkers still want Half-Working to unlog the parking-lot cubes, or make them Rec.709-ready.";
export const LOG_STILL_LINE =
  "Still tote. Not convert. Not a color desk. Not balance.";
export const LOG_TOTE_LINE = "Add to tote still works.";
export const LOG_EMPTY_LINE = "Nobody taped the log note yet.";

const SERVER_STORE = Symbol.for("iss.log-listing-ids");

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

export function parseLogListingIds(raw: string | null | undefined): string[] {
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

export function logCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const LOG_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${LOG_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(LOG_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(LOG_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${LOG_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseLogListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readLogListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(LOG_STORAGE_KEY);
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
          window.localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(ids));
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

export function writeLogListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = logCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(LOG_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${LOG_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(LOG_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingLogOverlay(
  listingId: string,
  listingIds = readLogListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeLog(listing: Listing | undefined): listing is Listing {
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

export type LogWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type LogWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: LogWriteReason; listingIds: string[] };

function refuseLog(
  listing: Listing | undefined,
  listingIds: string[],
): LogWriteResult | null {
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

export function markListingLog(
  listing: Listing | undefined,
  listingIds: string[],
): LogWriteResult {
  const refused = refuseLog(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingLog(
  listing: Listing | undefined,
  listingIds: string[],
): LogWriteResult {
  const refused = refuseLog(listing, listingIds);
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

export function subscribeLog(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === LOG_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LOG_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOG_CHANGED_EVENT, listener);
  };
}
