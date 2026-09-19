/**
 * I don't dump — Game Boy ROM refusal. Still tote.
 *
 * Cells are the AAs out. Line is the screen. Manual is no booklet.
 * Walkers still want a ROM of Tetris. This is the dump refusal.
 * Press start. Still a Game Boy. Not cells. Not a ROM shop. Not scan.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:dump-listing-ids` is the client dump set.
 * Cookie `iss-dump-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write cells, line, manual, shell, claim, scan, fuse, tetris,
 * rom, cart, film, look, ask, hands, van, firm, packed, sold,
 * file-gone, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF is not a cart.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const DUMP_STORAGE_KEY = "iss:dump-listing-ids";
export const DUMP_COOKIE_NAME = "iss-dump-listing-ids";
export const DUMP_CHANGED_EVENT = "iss:dump-changed";

export const DUMP_REFUSE_COPY = "That one does not dump.";
export const DUMP_TABLE_LINE = "I don't dump.";
export const DUMP_PRESS_LINE = "Press start.";
export const DUMP_NOTICE_TITLE = "I don't dump. Press start.";
export const DUMP_CELLS_LINE = "Cells are the AAs out. Line is the screen.";
export const DUMP_CART_LINE = "Walkers still want a ROM of Tetris.";
export const DUMP_STILL_LINE = "Still tote. Not cells. Not a ROM shop. Not scan.";
export const DUMP_TOTE_LINE = "Add to tote still works.";
export const DUMP_EMPTY_LINE = "Nobody taped a dump refusal yet.";

const SERVER_STORE = Symbol.for("iss.dump-listing-ids");

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

export function parseDumpListingIds(raw: string | null | undefined): string[] {
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

export function dumpCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const DUMP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${DUMP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(DUMP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(DUMP_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${DUMP_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseDumpListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readDumpListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(DUMP_STORAGE_KEY);
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
          window.localStorage.setItem(DUMP_STORAGE_KEY, JSON.stringify(ids));
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

export function writeDumpListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = dumpCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(DUMP_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${DUMP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(DUMP_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingDumpOverlay(
  listingId: string,
  listingIds = readDumpListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeDump(listing: Listing | undefined): listing is Listing {
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

export type DumpWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type DumpWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: DumpWriteReason; listingIds: string[] };

function refuseDump(
  listing: Listing | undefined,
  listingIds: string[],
): DumpWriteResult | null {
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

export function markListingDump(
  listing: Listing | undefined,
  listingIds: string[],
): DumpWriteResult {
  const refused = refuseDump(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingDump(
  listing: Listing | undefined,
  listingIds: string[],
): DumpWriteResult {
  const refused = refuseDump(listing, listingIds);
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

export function subscribeDump(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === DUMP_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(DUMP_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(DUMP_CHANGED_EVENT, listener);
  };
}
