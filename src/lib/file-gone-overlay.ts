/**
 * Live file-gone pull. Digital twin of the sold sticker. No inventory service.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:file-gone-listing-ids` is the client pull set.
 * Cookie `iss-file-gone-listing-ids` is the same JSON so PDPs, explore, and
 * the folder SSR it.
 *
 * Never write `iss:cart-listing-ids`, `iss-cart-listing-ids`,
 * `iss:sold-listing-ids`, or `iss-sold-listing-ids`.
 * Gift listings and physical rows stay off this set.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Pay does not pull a file — desk does.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "./commerce/types";

export const FILE_GONE_STORAGE_KEY = "iss:file-gone-listing-ids";
export const FILE_GONE_COOKIE_NAME = "iss-file-gone-listing-ids";
export const FILE_GONE_CHANGED_EVENT = "iss:file-gone-changed";

const SERVER_STORE = Symbol.for("iss.file-gone-listing-ids");

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

export function parseFileGoneListingIds(
  raw: string | null | undefined,
): string[] {
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

export function fileGoneCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const FILE_GONE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${FILE_GONE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(FILE_GONE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(FILE_GONE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${FILE_GONE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseFileGoneListingIds(raw);
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
  const prefix = `${FILE_GONE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function peekRequestFileGoneRaw(): string | undefined {
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

        const fromCookies = store.cookies?.get?.(FILE_GONE_COOKIE_NAME)?.value;
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

export function readFileGoneListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(FILE_GONE_STORAGE_KEY);
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
          window.localStorage.setItem(
            FILE_GONE_STORAGE_KEY,
            JSON.stringify(ids),
          );
        } catch {
          // blocked storage
        }
        return ids;
      }
    }
    return snapshotFromRaw(fromStorage ?? null);
  }

  const peeked = parseFileGoneListingIds(peekRequestFileGoneRaw());
  const stored = serverStore();
  const merged = uniqueListingIds([...peeked, ...stored]);
  if (peeked.length > 0) {
    const g = globalThis as ServerGlobal;
    g[SERVER_STORE] = merged;
  }
  return merged;
}

export function writeFileGoneListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = fileGoneCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(FILE_GONE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${FILE_GONE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(FILE_GONE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingFileGoneOverlay(
  listingId: string,
  listingIds = readFileGoneListingIds(),
) {
  return listingIds.includes(listingId);
}

/**
 * Digital files only. Physical, gift, sold, and fixture file-gone stay off
 * the pull set. Overlay-stamped file-gone can still be put back.
 */
export function canStampFileGone(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (!isDigitalListing(listing)) {
    return false;
  }
  if (isGiftListing(listing)) {
    return false;
  }
  if (listing.status === "sold") {
    return false;
  }
  if (
    listing.status === "file-gone" &&
    !isListingFileGoneOverlay(listing.id)
  ) {
    return false;
  }
  return true;
}

export function stampFileGoneListing(
  listing: Listing,
  goneIds: ReadonlySet<string>,
): Listing {
  if (!goneIds.has(listing.id)) {
    return listing;
  }
  if (listing.status === "sold" || listing.status === "file-gone") {
    return listing;
  }
  if (!canStampFileGone(listing)) {
    return listing;
  }
  return { ...listing, status: "file-gone", cartEligible: false };
}

export function stampFileGoneListings(
  rows: readonly Listing[],
  goneIds = readFileGoneListingIds(),
): Listing[] {
  if (goneIds.length === 0) {
    return rows as Listing[];
  }

  const gone = new Set(goneIds);
  let changed = false;
  const next = rows.map((listing) => {
    const stamped = stampFileGoneListing(listing, gone);
    if (stamped !== listing) {
      changed = true;
    }
    return stamped;
  });
  return changed ? next : (rows as Listing[]);
}

export type FileGoneWriteResult =
  | { ok: true; listingIds: string[] }
  | {
      ok: false;
      reason: "missing" | "physical" | "gift" | "file-gone";
      listingIds: string[];
    };

function refuseFileGoneWrite(
  listing: Listing | undefined,
  listingIds: string[],
): FileGoneWriteResult | null {
  if (!listing) {
    return { ok: false, reason: "missing", listingIds };
  }
  if (isGiftListing(listing)) {
    return { ok: false, reason: "gift", listingIds };
  }
  if (!isDigitalListing(listing)) {
    return { ok: false, reason: "physical", listingIds };
  }
  if (listing.status === "sold") {
    return { ok: false, reason: "physical", listingIds };
  }
  if (
    listing.status === "file-gone" &&
    !listingIds.includes(listing.id)
  ) {
    return { ok: false, reason: "file-gone", listingIds };
  }
  return null;
}

export function markListingFileGone(
  listing: Listing | undefined,
  listingIds: string[],
): FileGoneWriteResult {
  const refused = refuseFileGoneWrite(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function restockFileListing(
  listing: Listing | undefined,
  listingIds: string[],
): FileGoneWriteResult {
  const refused = refuseFileGoneWrite(listing, listingIds);
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

export function subscribeFileGone(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === FILE_GONE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(FILE_GONE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FILE_GONE_CHANGED_EVENT, listener);
  };
}
