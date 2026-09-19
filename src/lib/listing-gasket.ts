/**
 * I will not gasket — knob wiggles. Still a lid. Still tote.
 *
 * Walkers still want Sink Drawer to gasket the lid, or “make it
 * seal.” I will not gasket. Knob wiggles. Still a lid. Still for
 * sale. Not glass. Not a hardware shop. Not vent.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:gasket-listing-ids` is the client gasket set.
 * Cookie `iss-gasket-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and digital files are refused — a recipe scan does
 * not take a gasket. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const GASKET_STORAGE_KEY = "iss:gasket-listing-ids";
export const GASKET_COOKIE_NAME = "iss-gasket-listing-ids";
export const GASKET_CHANGED_EVENT = "iss:gasket-changed";

export const GASKET_REFUSE_COPY = "That one does not take a gasket.";
export const GASKET_TABLE_LINE = "I will not gasket.";
export const GASKET_KNOB_LINE = "Knob wiggles.";
export const GASKET_LID_LINE = "Still a lid.";
export const GASKET_NOTICE_TITLE = "I will not gasket. Knob wiggles. Still a lid.";
export const GASKET_WALK_LINE =
  "Walkers still want Sink Drawer to gasket the lid, or make it seal.";
export const GASKET_STAYS_LINE = "This is the gasket note. Knob wiggles. Still a lid.";
export const GASKET_STILL_LINE =
  "Still tote. Not glass. Not a hardware shop. Not vent.";
export const GASKET_TOTE_LINE = "Add to tote still works.";
export const GASKET_EMPTY_LINE = "Nobody taped the gasket note yet.";

const SERVER_STORE = Symbol.for("iss.gasket-listing-ids");

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

export function parseGasketListingIds(raw: string | null | undefined): string[] {
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

export function gasketCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GASKET_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GASKET_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GASKET_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GASKET_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GASKET_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGasketListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGasketListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GASKET_STORAGE_KEY);
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
          window.localStorage.setItem(GASKET_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGasketListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = gasketCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GASKET_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GASKET_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GASKET_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGasketOverlay(
  listingId: string,
  listingIds: readonly string[] = readGasketListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeGasket(listing: Listing | undefined): listing is Listing {
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

export type GasketWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type GasketWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: GasketWriteReason; listingIds: string[] };

function refuseGasket(
  listing: Listing | undefined,
  listingIds: string[],
): GasketWriteResult | null {
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

export function markListingGasket(
  listing: Listing | undefined,
  listingIds: string[],
): GasketWriteResult {
  const refused = refuseGasket(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingGasket(
  listing: Listing | undefined,
  listingIds: string[],
): GasketWriteResult {
  const refused = refuseGasket(listing, listingIds);
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

export function subscribeGasket(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GASKET_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GASKET_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GASKET_CHANGED_EVENT, listener);
  };
}
