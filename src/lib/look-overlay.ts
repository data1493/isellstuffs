/**
 * Look, don't bag. Display piece on the table — not for sale.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:look-listing-ids` is the client look set.
 * Cookie `iss-look-listing-ids` is the same JSON so PDPs and explore SSR it.
 *
 * Physical `cartEligible: false` only. Never rewrite `status`.
 * Never write sold, packed, file-gone, gift, or tote keys.
 * Gift listings and digital files are refused — a PDF is not a lamp.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const LOOK_STORAGE_KEY = "iss:look-listing-ids";
export const LOOK_COOKIE_NAME = "iss-look-listing-ids";
export const LOOK_CHANGED_EVENT = "iss:look-changed";

export const LOOK_MISSING_COPY = "No look for that listing.";
export const LOOK_FILE_COPY = "A file is not a display piece.";
export const LOOK_GIFT_COPY = "The gift card is for sale at the desk.";
export const LOOK_SOLD_COPY =
  "It already walked. Look is for what still sits on the table.";
export const LOOK_GONE_COPY = "The folder is empty. Nothing to look at.";
export const LOOK_TABLE_LINE = "Display piece on the table. Not for sale.";
export const LOOK_TOTE_LINE =
  "Look drops the tote. Sell-again puts Add to cart back.";
export const LOOK_LOT_LINE =
  "The booth stays on the lot. This is not a pack-up.";

const SERVER_STORE = Symbol.for("iss.look-listing-ids");

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

export function parseLookListingIds(raw: string | null | undefined): string[] {
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

export function lookCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const LOOK_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${LOOK_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(LOOK_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(LOOK_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${LOOK_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseLookListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

type WorkUnitStore = {
  cookies?: { get?: (name: string) => { value?: string } | undefined };
  headers?: { get?: (name: string) => string | null };
};

function peekCookieHeader(header: string | null | undefined) {
  if (!header) {
    return undefined;
  }
  const parts = header.split("; ");
  const prefix = `${LOOK_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function peekRequestLookRaw(): string | undefined {
  if (canUseStorage()) {
    return undefined;
  }

  try {
    const builtin = (
      process as NodeJS.Process & {
        getBuiltinModule?: (name: string) => {
          createRequire: (url: string) => (id: string) => {
            workUnitAsyncStorage?: {
              getStore?: () => WorkUnitStore | undefined;
            };
          };
        };
      }
    ).getBuiltinModule?.("module");
    const req = builtin?.createRequire(import.meta.url);
    if (!req) {
      return undefined;
    }
    const paths = [
      "next/dist/server/app-render/work-unit-async-storage.external",
      "next/dist/server/app-render/work-unit-async-storage-instance",
    ];
    for (const id of paths) {
      try {
        const mod = req(id) as {
          workUnitAsyncStorage?: {
            getStore?: () => WorkUnitStore | undefined;
          };
          workUnitAsyncStorageInstance?: {
            getStore?: () => WorkUnitStore | undefined;
          };
        };
        const store =
          mod.workUnitAsyncStorage?.getStore?.() ??
          mod.workUnitAsyncStorageInstance?.getStore?.();
        if (!store) {
          continue;
        }

        const fromCookies = store.cookies?.get?.(LOOK_COOKIE_NAME)?.value;
        if (fromCookies) {
          return fromCookies;
        }

        const fromHeader = peekCookieHeader(store.headers?.get?.("cookie"));
        if (fromHeader) {
          return fromHeader;
        }
      } catch {
        // try the next Next.js store module
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export function readLookListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(LOOK_STORAGE_KEY);
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
          window.localStorage.setItem(LOOK_STORAGE_KEY, JSON.stringify(ids));
        } catch {
          // blocked storage
        }
        return ids;
      }
    }
    return snapshotFromRaw(fromStorage ?? null);
  }

  const peeked = parseLookListingIds(peekRequestLookRaw());
  const stored = serverStore();
  const merged = uniqueListingIds([...peeked, ...stored]);
  if (peeked.length > 0) {
    const g = globalThis as ServerGlobal;
    g[SERVER_STORE] = merged;
  }
  return merged;
}

export function writeLookListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = lookCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(LOOK_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${LOOK_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(LOOK_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingLookOverlay(
  listingId: string,
  listingIds = readLookListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canStampLook(listing: Listing | undefined): listing is Listing {
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

export function stampLookListing(
  listing: Listing,
  lookIds: ReadonlySet<string>,
): Listing {
  if (!lookIds.has(listing.id)) {
    return listing;
  }
  if (listing.status === "sold" || listing.status === "file-gone") {
    return listing;
  }
  if (!canStampLook(listing)) {
    return listing;
  }
  if (!listing.cartEligible) {
    return listing;
  }
  return { ...listing, cartEligible: false };
}

export function stampLookListings(
  rows: readonly Listing[],
  lookIds = readLookListingIds(),
): Listing[] {
  if (lookIds.length === 0) {
    return rows as Listing[];
  }

  const looking = new Set(lookIds);
  let changed = false;
  const next = rows.map((listing) => {
    const stamped = stampLookListing(listing, looking);
    if (stamped !== listing) {
      changed = true;
    }
    return stamped;
  });
  return changed ? next : (rows as Listing[]);
}

export type LookWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type LookWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: LookWriteReason; listingIds: string[] };

function refuseLook(
  listing: Listing | undefined,
  listingIds: string[],
): LookWriteResult | null {
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

export function markListingLook(
  listing: Listing | undefined,
  listingIds: string[],
): LookWriteResult {
  const refused = refuseLook(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function sellAgainListing(
  listing: Listing | undefined,
  listingIds: string[],
): LookWriteResult {
  const refused = refuseLook(listing, listingIds);
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

export function subscribeLook(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === LOOK_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LOOK_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOOK_CHANGED_EVENT, listener);
  };
}
