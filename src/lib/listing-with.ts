/**
 * These two go together — two titles that walk together.
 *
 * Shape: JSON array of `[Listing.id, Listing.id]` pairs from `@/lib/commerce`.
 * localStorage key `iss:listing-with-pairs` is the client pair set.
 * Cookie `iss-listing-with-pairs` is the same JSON so both PDPs SSR the mate.
 *
 * The mate is on the table. Not a bundle SKU. Two prices stay two prices.
 * Never rewrite `status`, `cartEligible`, or tote / van / hands / firm keys.
 * Same-stall physical only. Gift listings and digital files are refused.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  listingsByStall,
  type Listing,
} from "@/lib/commerce";

export const WITH_STORAGE_KEY = "iss:listing-with-pairs";
export const WITH_COOKIE_NAME = "iss-listing-with-pairs";
export const WITH_CHANGED_EVENT = "iss:listing-with-changed";

export const WITH_MISSING_COPY = "No pair for that listing.";
export const WITH_FILE_COPY = "A file does not walk with a jacket.";
export const WITH_GIFT_COPY = "The gift card stays at the desk.";
export const WITH_SOLD_COPY =
  "It already walked. Pair the next two, not this sticker.";
export const WITH_GONE_COPY = "The folder is empty. Nothing to walk with.";
export const WITH_STALL_COPY = "The mate has to sit on the same table.";
export const WITH_EMPTY_COPY = "Nobody else on this table to walk with.";
export const WITH_TABLE_LINE = "These two walk together.";
export const WITH_TOTE_LINE = "Still two SKUs. Tote math stays put.";
export const WITH_VAN_LINE = "Van is more of one pile. With is two titles.";
export const WITH_MATE_LINE = "The mate is on the table. Not a bundle.";

export type ListingWithPair = readonly [string, string];

const SERVER_STORE = Symbol.for("iss.listing-with-pairs");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: ListingWithPair[];
};

const emptyPairs: ListingWithPair[] = [];

let cachedRaw: string | null | undefined;
let cachedPairs: ListingWithPair[] = emptyPairs;

function canUseStorage() {
  return typeof window !== "undefined";
}

export function normalizeWithPair(
  a: string,
  b: string,
): ListingWithPair | null {
  if (typeof a !== "string" || typeof b !== "string") {
    return null;
  }
  const left = a.trim();
  const right = b.trim();
  if (!left || !right || left === right) {
    return null;
  }
  return left < right ? [left, right] : [right, left];
}

export function uniquePairs(pairs: readonly ListingWithPair[]): ListingWithPair[] {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const next: ListingWithPair[] = [];

  for (const pair of pairs) {
    const normalized = normalizeWithPair(pair[0], pair[1]);
    if (!normalized) {
      continue;
    }
    const key = `${normalized[0]}\0${normalized[1]}`;
    if (seenKeys.has(key)) {
      continue;
    }
    if (seenIds.has(normalized[0]) || seenIds.has(normalized[1])) {
      continue;
    }
    seenKeys.add(key);
    seenIds.add(normalized[0]);
    seenIds.add(normalized[1]);
    next.push(normalized);
  }

  return next.length === 0 ? emptyPairs : next;
}

function asPair(value: unknown): ListingWithPair | null {
  if (!Array.isArray(value) || value.length !== 2) {
    return null;
  }
  if (typeof value[0] !== "string" || typeof value[1] !== "string") {
    return null;
  }
  return normalizeWithPair(value[0], value[1]);
}

export function parseWithPairs(
  raw: string | null | undefined,
): ListingWithPair[] {
  if (!raw) {
    return emptyPairs;
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
      return emptyPairs;
    }
    return uniquePairs(
      parsed
        .map((entry) => asPair(entry))
        .filter((pair): pair is ListingWithPair => pair !== null),
    );
  } catch {
    return emptyPairs;
  }
}

export function withCookieValue(pairs: readonly ListingWithPair[]): string {
  return JSON.stringify(uniquePairs(pairs));
}

export const WITH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${WITH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(WITH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(WITH_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${WITH_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedPairs;
  }
  cachedRaw = raw;
  cachedPairs = parseWithPairs(raw);
  return cachedPairs;
}

function serverStore(): ListingWithPair[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyPairs;
}

export function readWithPairs(): ListingWithPair[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(WITH_STORAGE_KEY);
    if (fromStorage) {
      const stored = snapshotFromRaw(fromStorage);
      if (stored.length > 0) {
        return stored;
      }
    }
    const fromCookie = readCookieRaw();
    if (fromCookie) {
      const pairs = snapshotFromRaw(fromCookie);
      if (pairs.length > 0) {
        try {
          window.localStorage.setItem(
            WITH_STORAGE_KEY,
            JSON.stringify(pairs),
          );
        } catch {
          // blocked storage
        }
        return pairs;
      }
    }
    return snapshotFromRaw(fromStorage ?? null);
  }

  return serverStore();
}

export function writeWithPairs(pairs: ListingWithPair[]) {
  const next = uniquePairs(pairs);
  const raw = withCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(WITH_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${WITH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedPairs = next;
    window.dispatchEvent(new Event(WITH_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedPairs = next;
}

export function mateOf(
  listingId: string,
  pairs: readonly ListingWithPair[] = readWithPairs(),
): string | null {
  for (const pair of pairs) {
    if (pair[0] === listingId) {
      return pair[1];
    }
    if (pair[1] === listingId) {
      return pair[0];
    }
  }
  return null;
}

export function isListingWithOverlay(
  listingId: string,
  pairs: readonly ListingWithPair[] = readWithPairs(),
) {
  return mateOf(listingId, pairs) !== null;
}

/** Physical unique goods on the same table. Digital, gift, sold, file-gone stay off. */
export function canStampWith(listing: Listing | undefined): listing is Listing {
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

export function canWalkWith(
  listing: Listing | undefined,
  mate: Listing | undefined,
): mate is Listing {
  if (!canStampWith(listing) || !canStampWith(mate)) {
    return false;
  }
  if (listing.id === mate.id) {
    return false;
  }
  return listing.stallId === mate.stallId;
}

export function sameStallMates(listing: Listing): Listing[] {
  if (!canStampWith(listing)) {
    return [];
  }
  return listingsByStall(listing.stallId).filter((item) =>
    canWalkWith(listing, item),
  );
}

export type WithWriteReason =
  | "missing"
  | "missing-mate"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "stall"
  | "self";

export type WithWriteResult =
  | { ok: true; pairs: ListingWithPair[] }
  | { ok: false; reason: WithWriteReason; pairs: ListingWithPair[] };

function refuseListing(
  listing: Listing | undefined,
  pairs: ListingWithPair[],
): WithWriteResult | null {
  if (!listing) {
    return { ok: false, reason: "missing", pairs };
  }
  if (listing.status === "file-gone") {
    return { ok: false, reason: "file-gone", pairs };
  }
  if (listing.status === "sold") {
    return { ok: false, reason: "sold", pairs };
  }
  if (isGiftListing(listing)) {
    return { ok: false, reason: "gift", pairs };
  }
  if (!isPhysicalListing(listing)) {
    return { ok: false, reason: "digital", pairs };
  }
  return null;
}

function refuseMate(
  listing: Listing,
  mate: Listing | undefined,
  pairs: ListingWithPair[],
): WithWriteResult | null {
  if (!mate) {
    return { ok: false, reason: "missing-mate", pairs };
  }
  if (mate.id === listing.id) {
    return { ok: false, reason: "self", pairs };
  }
  if (mate.status === "file-gone") {
    return { ok: false, reason: "file-gone", pairs };
  }
  if (mate.status === "sold") {
    return { ok: false, reason: "sold", pairs };
  }
  if (isGiftListing(mate)) {
    return { ok: false, reason: "gift", pairs };
  }
  if (!isPhysicalListing(mate)) {
    return { ok: false, reason: "digital", pairs };
  }
  if (mate.stallId !== listing.stallId) {
    return { ok: false, reason: "stall", pairs };
  }
  return null;
}

function dropListing(pairs: ListingWithPair[], listingId: string) {
  return pairs.filter(
    (pair) => pair[0] !== listingId && pair[1] !== listingId,
  );
}

export function pairListings(
  listing: Listing | undefined,
  mate: Listing | undefined,
  pairs: ListingWithPair[],
): WithWriteResult {
  const refusedHost = refuseListing(listing, pairs);
  if (refusedHost) {
    return refusedHost;
  }
  const refusedMate = refuseMate(listing!, mate, pairs);
  if (refusedMate) {
    return refusedMate;
  }

  const nextPair = normalizeWithPair(listing!.id, mate!.id);
  if (!nextPair) {
    return { ok: false, reason: "self", pairs };
  }

  const current = mateOf(listing!.id, pairs);
  if (current === mate!.id) {
    return { ok: true, pairs };
  }

  const cleared = dropListing(dropListing(pairs, listing!.id), mate!.id);
  return { ok: true, pairs: [...cleared, nextPair] };
}

export function unpairListing(
  listing: Listing | undefined,
  pairs: ListingWithPair[],
): WithWriteResult {
  const refused = refuseListing(listing, pairs);
  if (refused) {
    return refused;
  }
  if (!mateOf(listing!.id, pairs)) {
    return { ok: true, pairs };
  }
  return { ok: true, pairs: dropListing(pairs, listing!.id) };
}

export function subscribeWith(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === WITH_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(WITH_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(WITH_CHANGED_EVENT, listener);
  };
}
