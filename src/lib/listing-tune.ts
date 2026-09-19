/**
 * I will not tune it — one-shots stay as recorded. Still tote.
 *
 * Stems is twelve shots. BPM is a guess. Loop is I will not slice.
 * Picky / swap-a-kick was killed. Grade is a LUT, not a kick.
 * Walkers still want Beats to tune the $4 pack, or “put the
 * one-shots in C.” I will not tune it. One-shots as recorded.
 * Still for sale. Not bpm. Not a mix desk. Not loop.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:tune-listing-ids` is the client tune set.
 * Cookie `iss-tune-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and physical rows are refused — a CD-R is not a
 * tuned pack. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const TUNE_STORAGE_KEY = "iss:tune-listing-ids";
export const TUNE_COOKIE_NAME = "iss-tune-listing-ids";
export const TUNE_CHANGED_EVENT = "iss:tune-changed";

export const TUNE_REFUSE_COPY = "That one does not take a tune note.";
export const TUNE_TABLE_LINE = "I will not tune it.";
export const TUNE_STAYS_LINE = "One-shots as recorded.";
export const TUNE_NOTICE_TITLE = "I will not tune it. One-shots as recorded.";
export const TUNE_WALK_LINE = "Walkers still want the kicks in C.";
export const TUNE_STILL_LINE = "Still tote. Not bpm. Not a mix desk. Not loop.";
export const TUNE_TOTE_LINE = "Add to tote still works.";
export const TUNE_EMPTY_LINE = "Nobody taped the tune note yet.";

const SERVER_STORE = Symbol.for("iss.tune-listing-ids");

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

export function parseTuneListingIds(raw: string | null | undefined): string[] {
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

export function tuneCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const TUNE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${TUNE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(TUNE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(TUNE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${TUNE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseTuneListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readTuneListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(TUNE_STORAGE_KEY);
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
          window.localStorage.setItem(TUNE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeTuneListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = tuneCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(TUNE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${TUNE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(TUNE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingTuneOverlay(
  listingId: string,
  listingIds = readTuneListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeTune(listing: Listing | undefined): listing is Listing {
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

export type TuneWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type TuneWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: TuneWriteReason; listingIds: string[] };

function refuseTune(
  listing: Listing | undefined,
  listingIds: string[],
): TuneWriteResult | null {
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

export function markListingTune(
  listing: Listing | undefined,
  listingIds: string[],
): TuneWriteResult {
  const refused = refuseTune(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingTune(
  listing: Listing | undefined,
  listingIds: string[],
): TuneWriteResult {
  const refused = refuseTune(listing, listingIds);
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

export function subscribeTune(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === TUNE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(TUNE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TUNE_CHANGED_EVENT, listener);
  };
}
