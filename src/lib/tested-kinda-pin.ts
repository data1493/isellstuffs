/**
 * Overlay “tested, kinda” chip. No inventory service. No catalog rewrite.
 *
 * Shape: JSON array of overlay `Listing.id` strings.
 * localStorage key `iss:tested-kinda-ids` is the client pin set.
 * Cookie `iss-tested-kinda-ids` is the same JSON so PDPs and the rack SSR it.
 *
 * Catalog fixtures are refused. Cookie adds; it does not delete the Game Boy.
 * Never write sold / file-gone / packed / watched / wanted / tote keys.
 * Do not change Listing shape or cartEligible.
 */
import { listings } from "./commerce/catalog";
import { isGiftListing, type Listing } from "./commerce/types";

export const TESTED_KINDA_STORAGE_KEY = "iss:tested-kinda-ids";
export const TESTED_KINDA_COOKIE_NAME = "iss-tested-kinda-ids";
export const TESTED_KINDA_CHANGED_EVENT = "iss:tested-kinda-changed";

const SERVER_STORE = Symbol.for("iss.tested-kinda-ids");

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

export function parseTestedKindaIds(raw: string | null | undefined): string[] {
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

export function testedKindaCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const TESTED_KINDA_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${TESTED_KINDA_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(TESTED_KINDA_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(TESTED_KINDA_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${TESTED_KINDA_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseTestedKindaIds(raw);
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
  const prefix = `${TESTED_KINDA_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function peekRequestTestedRaw(): string | undefined {
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

        const fromCookies = store.cookies?.get?.(TESTED_KINDA_COOKIE_NAME)?.value;
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

export function readTestedKindaIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(TESTED_KINDA_STORAGE_KEY);
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
            TESTED_KINDA_STORAGE_KEY,
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

  const peeked = parseTestedKindaIds(peekRequestTestedRaw());
  const stored = serverStore();
  const merged = uniqueListingIds([...peeked, ...stored]);
  if (peeked.length > 0) {
    const g = globalThis as ServerGlobal;
    g[SERVER_STORE] = merged;
  }
  return merged;
}

export function writeTestedKindaIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = testedKindaCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(TESTED_KINDA_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${TESTED_KINDA_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(TESTED_KINDA_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isTestedKindaPinned(
  listingId: string,
  listingIds = readTestedKindaIds(),
) {
  return listingIds.includes(listingId);
}

export function isFixtureListingId(id: string) {
  return listings.some((row) => row.id === id);
}

/**
 * Overlay rows only. Fixtures, gift, sold, and file-gone stay off the pin set.
 * A pinned overlay that later sold can still drop.
 */
export function canPinTestedKinda(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (isFixtureListingId(listing.id)) {
    return false;
  }
  if (isGiftListing(listing)) {
    return false;
  }
  if (listing.status === "sold" || listing.status === "file-gone") {
    return isTestedKindaPinned(listing.id);
  }
  return listing.status === "available";
}

export type TestedKindaWriteResult =
  | { ok: true; listingIds: string[] }
  | {
      ok: false;
      reason: "missing" | "fixture" | "gift" | "sold" | "file-gone";
      listingIds: string[];
    };

function refuseTestedWrite(
  listing: Listing | undefined,
  listingIds: string[],
): TestedKindaWriteResult | null {
  if (!listing) {
    return { ok: false, reason: "missing", listingIds };
  }
  if (isFixtureListingId(listing.id)) {
    return { ok: false, reason: "fixture", listingIds };
  }
  if (isGiftListing(listing)) {
    return { ok: false, reason: "gift", listingIds };
  }
  if (listing.status === "sold") {
    return listingIds.includes(listing.id)
      ? null
      : { ok: false, reason: "sold", listingIds };
  }
  if (listing.status === "file-gone") {
    return listingIds.includes(listing.id)
      ? null
      : { ok: false, reason: "file-gone", listingIds };
  }
  return null;
}

export function pinTestedKinda(
  listing: Listing | undefined,
  listingIds: string[],
): TestedKindaWriteResult {
  const refused = refuseTestedWrite(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function dropTestedKinda(
  listing: Listing | undefined,
  listingIds: string[],
): TestedKindaWriteResult {
  const refused = refuseTestedWrite(listing, listingIds);
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

export function subscribeTestedKinda(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === TESTED_KINDA_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(TESTED_KINDA_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TESTED_KINDA_CHANGED_EVENT, listener);
  };
}
