/**
 * Live sold sticker. No inventory service.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:sold-listing-ids` is the client sticker set.
 * Cookie `iss-sold-listing-ids` is the same JSON so PDPs and explore SSR it.
 *
 * Never write `iss:cart-listing-ids` or `iss-cart-listing-ids`.
 * Gift listings and digital files are not auto-sold — a PDF is not a unique chair.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const SOLD_STORAGE_KEY = "iss:sold-listing-ids";
export const SOLD_COOKIE_NAME = "iss-sold-listing-ids";
export const SOLD_CHANGED_EVENT = "iss:sold-changed";

const SERVER_STORE = Symbol.for("iss.sold-listing-ids");

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

export function parseSoldListingIds(raw: string | null | undefined): string[] {
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

export function soldCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SOLD_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SOLD_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SOLD_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SOLD_CHANGED_EVENT)}));}}}catch(e){}`;

/** Inline stamp so checkout success writes the overlay before React hydrates. */
export function soldStampScript(listingIds: readonly string[]) {
  const add = uniqueListingIds(listingIds);
  if (add.length === 0) {
    return "";
  }
  return `try{var add=${JSON.stringify(add)};var cur=[];try{var raws=localStorage.getItem(${JSON.stringify(SOLD_STORAGE_KEY)});if(raws){cur=JSON.parse(raws)}}catch(e){}if(!Array.isArray(cur))cur=[];for(var i=0;i<add.length;i++){if(cur.indexOf(add[i])<0)cur.push(add[i])}var raw=JSON.stringify(cur);localStorage.setItem(${JSON.stringify(SOLD_STORAGE_KEY)},raw);document.cookie=${JSON.stringify(`${SOLD_COOKIE_NAME}=`)}+encodeURIComponent(raw)+"; Path=/; Max-Age=2592000; SameSite=Lax";window.dispatchEvent(new Event(${JSON.stringify(SOLD_CHANGED_EVENT)}))}catch(e){}`;
}

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SOLD_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSoldListingIds(raw);
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
  const prefix = `${SOLD_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function peekRequestSoldRaw(): string | undefined {
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

        const fromCookies = store.cookies?.get?.(SOLD_COOKIE_NAME)?.value;
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

export function readSoldListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SOLD_STORAGE_KEY);
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
          window.localStorage.setItem(SOLD_STORAGE_KEY, JSON.stringify(ids));
        } catch {
          // blocked storage
        }
        return ids;
      }
    }
    return snapshotFromRaw(fromStorage ?? null);
  }

  const peeked = parseSoldListingIds(peekRequestSoldRaw());
  const stored = serverStore();
  const merged = uniqueListingIds([...peeked, ...stored]);
  if (peeked.length > 0) {
    const g = globalThis as ServerGlobal;
    g[SERVER_STORE] = merged;
  }
  return merged;
}

export function writeSoldListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = soldCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SOLD_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SOLD_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SOLD_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSoldOverlay(
  listingId: string,
  listingIds = readSoldListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, and file-gone stay off the sticker set. */
export function canStampSold(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (!isPhysicalListing(listing)) {
    return false;
  }
  if (isGiftListing(listing)) {
    return false;
  }
  if (listing.status === "file-gone") {
    return false;
  }
  return true;
}

export function stampSoldListing(
  listing: Listing,
  soldIds: ReadonlySet<string>,
): Listing {
  if (!soldIds.has(listing.id)) {
    return listing;
  }
  if (listing.status === "sold" || listing.status === "file-gone") {
    return listing;
  }
  if (!canStampSold(listing)) {
    return listing;
  }
  return { ...listing, status: "sold", cartEligible: false };
}

export function stampSoldListings(
  rows: readonly Listing[],
  soldIds = readSoldListingIds(),
): Listing[] {
  if (soldIds.length === 0) {
    return rows as Listing[];
  }

  const sold = new Set(soldIds);
  let changed = false;
  const next = rows.map((listing) => {
    const stamped = stampSoldListing(listing, sold);
    if (stamped !== listing) {
      changed = true;
    }
    return stamped;
  });
  return changed ? next : (rows as Listing[]);
}

export type SoldWriteResult =
  | { ok: true; listingIds: string[] }
  | {
      ok: false;
      reason: "missing" | "digital" | "gift" | "file-gone";
      listingIds: string[];
    };

export function markListingSold(
  listing: Listing | undefined,
  listingIds: string[],
): SoldWriteResult {
  if (!listing) {
    return { ok: false, reason: "missing", listingIds };
  }
  if (listing.status === "file-gone") {
    return { ok: false, reason: "file-gone", listingIds };
  }
  if (isGiftListing(listing)) {
    return { ok: false, reason: "gift", listingIds };
  }
  if (!isPhysicalListing(listing)) {
    return { ok: false, reason: "digital", listingIds };
  }
  if (listingIds.includes(listing.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing.id] };
}

export function restockListing(
  listing: Listing | undefined,
  listingIds: string[],
): SoldWriteResult {
  if (!listing) {
    return { ok: false, reason: "missing", listingIds };
  }
  if (listing.status === "file-gone") {
    return { ok: false, reason: "file-gone", listingIds };
  }
  if (isGiftListing(listing)) {
    return { ok: false, reason: "gift", listingIds };
  }
  if (!isPhysicalListing(listing)) {
    return { ok: false, reason: "digital", listingIds };
  }
  if (!listingIds.includes(listing.id)) {
    return { ok: true, listingIds };
  }
  return {
    ok: true,
    listingIds: listingIds.filter((id) => id !== listing.id),
  };
}

export function addPhysicalIdsToSold(listingIds: readonly string[]) {
  const current = readSoldListingIds();
  const next = uniqueListingIds([...current, ...listingIds]);
  if (next === current || next.length === current.length) {
    const same = next.length === current.length && next.every((id, i) => id === current[i]);
    if (same) {
      return current;
    }
  }
  writeSoldListingIds(next);
  return next;
}

export function subscribeSold(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SOLD_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SOLD_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SOLD_CHANGED_EVENT, listener);
  };
}
