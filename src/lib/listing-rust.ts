/**
 * The rust stays — whisk-rust honesty. Still tote.
 *
 * Tines is no spare wire. Bent is the splay. Oil is the squeak.
 * Walkers still want Sink Drawer to lift the rust, or “make the
 * wires chrome.” The rust stays. Still metal. Still beats eggs.
 * Not tines. Not a hardware shop. Not oil.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:rust-listing-ids` is the client rust set.
 * Cookie `iss-rust-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write tines, bent, oil, cap, vent, saucer, dishes, meter,
 * chrome, replate, oxidize, balloon, whip, eggs, film, look, ask,
 * hands, van, firm, packed, sold, file-gone, gift, buy, digital
 * eligibility, or tote keys.
 * Gift listings and digital files are refused — a recipe scan is
 * not a whisk. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const RUST_STORAGE_KEY = "iss:rust-listing-ids";
export const RUST_COOKIE_NAME = "iss-rust-listing-ids";
export const RUST_CHANGED_EVENT = "iss:rust-changed";

export const RUST_REFUSE_COPY = "That one does not rust.";
export const RUST_TABLE_LINE = "The rust stays.";
export const RUST_METAL_LINE = "Still metal.";
export const RUST_EGGS_LINE = "Still beats eggs.";
export const RUST_NOTICE_TITLE = "The rust stays. Still metal. Still beats eggs.";
export const RUST_WALK_LINE =
  "Walkers still want Sink Drawer to lift the rust.";
export const RUST_STAYS_LINE = "This is the rust paper.";
export const RUST_STILL_LINE = "Still tote. Not a hardware shop.";
export const RUST_TOTE_LINE = "Add to tote still works.";
export const RUST_EMPTY_LINE = "Nobody taped the rust yet.";

const SERVER_STORE = Symbol.for("iss.rust-listing-ids");

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

export function parseRustListingIds(raw: string | null | undefined): string[] {
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

export function rustCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const RUST_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${RUST_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(RUST_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(RUST_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${RUST_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseRustListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readRustListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(RUST_STORAGE_KEY);
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
          window.localStorage.setItem(RUST_STORAGE_KEY, JSON.stringify(ids));
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

export function writeRustListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = rustCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(RUST_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${RUST_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(RUST_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingRustOverlay(
  listingId: string,
  listingIds = readRustListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeRust(listing: Listing | undefined): listing is Listing {
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

export type RustWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type RustWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: RustWriteReason; listingIds: string[] };

function refuseRust(
  listing: Listing | undefined,
  listingIds: string[],
): RustWriteResult | null {
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

export function markListingRust(
  listing: Listing | undefined,
  listingIds: string[],
): RustWriteResult {
  const refused = refuseRust(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingRust(
  listing: Listing | undefined,
  listingIds: string[],
): RustWriteResult {
  const refused = refuseRust(listing, listingIds);
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

export function subscribeRust(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === RUST_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(RUST_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RUST_CHANGED_EVENT, listener);
  };
}
