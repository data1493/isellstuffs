/**
 * Weekend pack-up flag. A booth can leave Saturday without deleting SKUs.
 *
 * Shape: JSON array of `Stall.id` strings from `@/lib/commerce`.
 * localStorage key `iss:packed-stall-ids` is the client packed set.
 * Cookie `iss-packed-stall-ids` is the same JSON so stall pages and
 * explore SSR it.
 *
 * Packed is a stall flag, not a fourth listing status.
 * Never write `iss:sold-listing-ids`, `iss:file-gone-listing-ids`,
 * or the tote / later-pile keys.
 * Digital files and gift listings stay on the table — files do not go
 * in the car. Gift desk stays open.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
  type Stall,
} from "./commerce/types";

export const PACKED_STORAGE_KEY = "iss:packed-stall-ids";
export const PACKED_COOKIE_NAME = "iss-packed-stall-ids";
export const PACKED_CHANGED_EVENT = "iss:packed-changed";

const SERVER_STORE = Symbol.for("iss.packed-stall-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

let cachedRaw: string | null | undefined;
let cachedIds: string[] = emptyIds;

function canUseStorage() {
  return typeof window !== "undefined";
}

function uniqueStallIds(ids: readonly string[]): string[] {
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

export function parsePackedStallIds(raw: string | null | undefined): string[] {
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
    return uniqueStallIds(
      parsed.filter((id): id is string => typeof id === "string"),
    );
  } catch {
    return emptyIds;
  }
}

export function packedCookieValue(stallIds: readonly string[]): string {
  return JSON.stringify(uniqueStallIds(stallIds));
}

export const PACKED_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PACKED_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(PACKED_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PACKED_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${PACKED_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePackedStallIds(raw);
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
  const prefix = `${PACKED_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function peekRequestPackedRaw(): string | undefined {
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

        const fromCookies = store.cookies?.get?.(PACKED_COOKIE_NAME)?.value;
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

export function readPackedStallIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(PACKED_STORAGE_KEY);
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
          window.localStorage.setItem(PACKED_STORAGE_KEY, JSON.stringify(ids));
        } catch {
          // blocked storage
        }
        return ids;
      }
    }
    return snapshotFromRaw(fromStorage ?? null);
  }

  const peeked = parsePackedStallIds(peekRequestPackedRaw());
  const stored = serverStore();
  const merged = uniqueStallIds([...peeked, ...stored]);
  if (peeked.length > 0) {
    const g = globalThis as ServerGlobal;
    g[SERVER_STORE] = merged;
  }
  return merged;
}

export function writePackedStallIds(stallIds: string[]) {
  const next = uniqueStallIds(stallIds);
  const raw = packedCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PACKED_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PACKED_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(PACKED_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isStallPacked(
  stallId: string,
  stallIds = readPackedStallIds(),
) {
  return stallIds.includes(stallId);
}

/**
 * Physical unique goods only. Digital, gift, sold, and file-gone stay off
 * the pack stamp. Status is never rewritten — packed is not a SKU status.
 */
export function canStampPacked(
  listing: Listing | undefined,
): listing is Listing {
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

export function stampPackedListing(
  listing: Listing,
  packedStallIds: ReadonlySet<string>,
): Listing {
  if (!packedStallIds.has(listing.stallId)) {
    return listing;
  }
  if (listing.status === "sold" || listing.status === "file-gone") {
    return listing;
  }
  if (!canStampPacked(listing)) {
    return listing;
  }
  if (!listing.cartEligible) {
    return listing;
  }
  return { ...listing, cartEligible: false };
}

export function stampPackedListings(
  rows: readonly Listing[],
  packedIds = readPackedStallIds(),
): Listing[] {
  if (packedIds.length === 0) {
    return rows as Listing[];
  }

  const packed = new Set(packedIds);
  let changed = false;
  const next = rows.map((listing) => {
    const stamped = stampPackedListing(listing, packed);
    if (stamped !== listing) {
      changed = true;
    }
    return stamped;
  });
  return changed ? next : (rows as Listing[]);
}

export type PackedWriteResult =
  | { ok: true; stallIds: string[] }
  | { ok: false; reason: "missing"; stallIds: string[] };

export function packStall(
  stall: Stall | undefined,
  stallIds: string[],
): PackedWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", stallIds };
  }
  if (stallIds.includes(stall.id)) {
    return { ok: true, stallIds };
  }
  return { ok: true, stallIds: [...stallIds, stall.id] };
}

export function unpackStall(
  stall: Stall | undefined,
  stallIds: string[],
): PackedWriteResult {
  if (!stall) {
    return { ok: false, reason: "missing", stallIds };
  }
  if (!stallIds.includes(stall.id)) {
    return { ok: true, stallIds };
  }
  return {
    ok: true,
    stallIds: stallIds.filter((id) => id !== stall.id),
  };
}

export function subscribePacked(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PACKED_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PACKED_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PACKED_CHANGED_EVENT, listener);
  };
}
