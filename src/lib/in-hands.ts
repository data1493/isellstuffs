/**
 * In someone's hands. Walking away with the lamp — not sold yet.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:hands-listing-ids` is the client hands set.
 * Cookie `iss-hands-listing-ids` is the same JSON so PDPs and explore SSR it.
 *
 * Physical `cartEligible: false` only. Never rewrite `status`.
 * Never write look, van, sold, packed, file-gone, gift, garage, or tote keys.
 * Gift listings and digital files are refused — a PDF is not a lamp.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const HANDS_STORAGE_KEY = "iss:hands-listing-ids";
export const HANDS_COOKIE_NAME = "iss-hands-listing-ids";
export const HANDS_CHANGED_EVENT = "iss:hands-changed";

export const HANDS_MISSING_COPY = "No hands for that listing.";
export const HANDS_FILE_COPY = "A file is not in anyone's hands.";
export const HANDS_GIFT_COPY = "The gift card stays at the desk.";
export const HANDS_SOLD_COPY =
  "It already walked. Hands is for what is still leaving.";
export const HANDS_GONE_COPY = "The folder is empty. Nothing to walk with.";
export const HANDS_WALK_LINE = "Walking away with it. Not sold yet.";
export const HANDS_TOTE_LINE =
  "Hands drops the tote. Put-back restores Add to cart.";
export const HANDS_LOOK_LINE =
  "Look sits on the table. Hands is leaving the aisle.";
export const HANDS_PDF_LINE = "The PDF is still for sale.";

const SERVER_STORE = Symbol.for("iss.hands-listing-ids");

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

export function parseHandsListingIds(raw: string | null | undefined): string[] {
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

export function handsCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const HANDS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${HANDS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(HANDS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(HANDS_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${HANDS_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseHandsListingIds(raw);
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
  const prefix = `${HANDS_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function peekRequestHandsRaw(): string | undefined {
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

        const fromCookies = store.cookies?.get?.(HANDS_COOKIE_NAME)?.value;
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

export function readHandsListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(HANDS_STORAGE_KEY);
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
          window.localStorage.setItem(HANDS_STORAGE_KEY, JSON.stringify(ids));
        } catch {
          // blocked storage
        }
        return ids;
      }
    }
    return snapshotFromRaw(fromStorage ?? null);
  }

  const peeked = parseHandsListingIds(peekRequestHandsRaw());
  const stored = serverStore();
  const merged = uniqueListingIds([...peeked, ...stored]);
  if (peeked.length > 0) {
    const g = globalThis as ServerGlobal;
    g[SERVER_STORE] = merged;
  }
  return merged;
}

export function writeHandsListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = handsCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(HANDS_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${HANDS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(HANDS_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingHandsOverlay(
  listingId: string,
  listingIds = readHandsListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canStampHands(listing: Listing | undefined): listing is Listing {
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

export function stampHandsListing(
  listing: Listing,
  handsIds: ReadonlySet<string>,
): Listing {
  if (!handsIds.has(listing.id)) {
    return listing;
  }
  if (listing.status === "sold" || listing.status === "file-gone") {
    return listing;
  }
  if (!canStampHands(listing)) {
    return listing;
  }
  if (!listing.cartEligible) {
    return listing;
  }
  return { ...listing, cartEligible: false };
}

export function stampHandsListings(
  rows: readonly Listing[],
  handsIds = readHandsListingIds(),
): Listing[] {
  if (handsIds.length === 0) {
    return rows as Listing[];
  }

  const walking = new Set(handsIds);
  let changed = false;
  const next = rows.map((listing) => {
    const stamped = stampHandsListing(listing, walking);
    if (stamped !== listing) {
      changed = true;
    }
    return stamped;
  });
  return changed ? next : (rows as Listing[]);
}

export type HandsWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type HandsWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: HandsWriteReason; listingIds: string[] };

function refuseHands(
  listing: Listing | undefined,
  listingIds: string[],
): HandsWriteResult | null {
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

export function markListingHands(
  listing: Listing | undefined,
  listingIds: string[],
): HandsWriteResult {
  const refused = refuseHands(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function putBackListingHands(
  listing: Listing | undefined,
  listingIds: string[],
): HandsWriteResult {
  const refused = refuseHands(listing, listingIds);
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

export function subscribeHands(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === HANDS_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(HANDS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(HANDS_CHANGED_EVENT, listener);
  };
}
