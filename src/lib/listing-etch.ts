/**
 * I will not read the runout — the unnamed LP stays unnamed. Still tote.
 *
 * Press is reissue. VG is no Goldmine. Name (stall) is no Discogs.
 * Warp is flatten. Skip is the chorus. Dust is the wipe. Center is
 * the hole. Walkers still want Sunday Crate to read the etch, or
 * “tell me which pressing.” I will not read the runout. Groove stays
 * unnamed. Still Side A. Still skips. Still for sale. Not press.
 * Not name. Not vg.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:etch-listing-ids` is the client etch set.
 * Cookie `iss-etch-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and digital files are refused — a liner PDF does not
 * take a runout. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const ETCH_STORAGE_KEY = "iss:etch-listing-ids";
export const ETCH_COOKIE_NAME = "iss-etch-listing-ids";
export const ETCH_CHANGED_EVENT = "iss:etch-changed";

export const ETCH_REFUSE_COPY = "That one does not take an etch note.";
export const ETCH_TABLE_LINE = "I will not read the runout.";
export const ETCH_GROOVE_LINE = "Groove stays unnamed.";
export const ETCH_SIDE_LINE = "Still Side A. Still skips.";
export const ETCH_NOTICE_TITLE =
  "I will not read the runout. Groove stays unnamed.";
export const ETCH_WALK_LINE =
  "Walkers still want Sunday Crate to read the etch, or tell me which pressing.";
export const ETCH_STAYS_LINE =
  "This is the etch note. Groove stays unnamed.";
export const ETCH_STILL_LINE =
  "Still tote. Still Side A. Still skips. Not press. Not name. Not vg.";
export const ETCH_TOTE_LINE = "Add to tote still works.";
export const ETCH_EMPTY_LINE = "Nobody taped the etch note yet.";

const SERVER_STORE = Symbol.for("iss.etch-listing-ids");

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

export function parseEtchListingIds(raw: string | null | undefined): string[] {
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

export function etchCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const ETCH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${ETCH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(ETCH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(ETCH_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${ETCH_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseEtchListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readEtchListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(ETCH_STORAGE_KEY);
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
          window.localStorage.setItem(ETCH_STORAGE_KEY, JSON.stringify(ids));
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

export function writeEtchListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = etchCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(ETCH_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${ETCH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(ETCH_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingEtchOverlay(
  listingId: string,
  listingIds: readonly string[] = readEtchListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeEtch(listing: Listing | undefined): listing is Listing {
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

export type EtchWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type EtchWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: EtchWriteReason; listingIds: string[] };

function refuseEtch(
  listing: Listing | undefined,
  listingIds: string[],
): EtchWriteResult | null {
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

export function markListingEtch(
  listing: Listing | undefined,
  listingIds: string[],
): EtchWriteResult {
  const refused = refuseEtch(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingEtch(
  listing: Listing | undefined,
  listingIds: string[],
): EtchWriteResult {
  const refused = refuseEtch(listing, listingIds);
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

export function subscribeEtch(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === ETCH_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(ETCH_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ETCH_CHANGED_EVENT, listener);
  };
}
