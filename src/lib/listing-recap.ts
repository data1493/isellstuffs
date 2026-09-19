/**
 * I will not recap — Game Boy save-battery refusal. Still tote.
 *
 * Link is no Nintendo cable. Glue is no epoxy. Line is the screen.
 * Dump is no ROM. Cells are the AAs. Walkers still want
 * Half-Working to recap the save battery, or “make Tetris
 * remember.” I will not recap. What saves is luck. Still Tetris.
 * Still a Game Boy. Still for sale. Not cells. Not dump. Not link.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:recap-listing-ids` is the client recap set.
 * Cookie `iss-recap-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write link, glue, line, dump, cells, beep, flash, meter,
 * sram, save, battery, dim, bright, contacts, boot, film, look,
 * ask, hands, van, firm, packed, sold, file-gone, gift, buy,
 * digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a LUT does not recap.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const RECAP_STORAGE_KEY = "iss:recap-listing-ids";
export const RECAP_COOKIE_NAME = "iss-recap-listing-ids";
export const RECAP_CHANGED_EVENT = "iss:recap-changed";

export const RECAP_REFUSE_COPY = "That one does not take a recap note.";
export const RECAP_TABLE_LINE = "I will not recap.";
export const RECAP_LUCK_LINE = "What saves is luck.";
export const RECAP_TETRIS_LINE = "Still Tetris.";
export const RECAP_NOTICE_TITLE =
  "I will not recap. What saves is luck. Still Tetris.";
export const RECAP_WALK_LINE =
  "Walkers still want Half-Working to recap the save battery.";
export const RECAP_STAYS_LINE =
  "This is the recap note. What saves is luck. Still Tetris.";
export const RECAP_STILL_LINE = "Still tote. Not cells. Not dump. Not link.";
export const RECAP_TOTE_LINE = "Add to tote still works.";
export const RECAP_EMPTY_LINE = "Nobody taped a recap note yet.";

const SERVER_STORE = Symbol.for("iss.recap-listing-ids");

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

export function parseRecapListingIds(raw: string | null | undefined): string[] {
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

export function recapCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const RECAP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${RECAP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(RECAP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(RECAP_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${RECAP_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseRecapListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readRecapListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(RECAP_STORAGE_KEY);
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
          window.localStorage.setItem(RECAP_STORAGE_KEY, JSON.stringify(ids));
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

export function writeRecapListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = recapCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(RECAP_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${RECAP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(RECAP_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingRecapOverlay(
  listingId: string,
  listingIds: readonly string[] = readRecapListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeRecap(listing: Listing | undefined): listing is Listing {
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

export type RecapWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type RecapWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: RecapWriteReason; listingIds: string[] };

function refuseRecap(
  listing: Listing | undefined,
  listingIds: string[],
): RecapWriteResult | null {
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

export function markListingRecap(
  listing: Listing | undefined,
  listingIds: string[],
): RecapWriteResult {
  const refused = refuseRecap(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingRecap(
  listing: Listing | undefined,
  listingIds: string[],
): RecapWriteResult {
  const refused = refuseRecap(listing, listingIds);
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

export function subscribeRecap(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === RECAP_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(RECAP_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RECAP_CHANGED_EVENT, listener);
  };
}
