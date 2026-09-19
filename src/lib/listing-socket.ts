/**
 * I will not socket it — the lamp stays as it is. Still tote.
 *
 * Twist is the neck. Led is no cool bulb. Box is shade in the carton.
 * Shim is sit-flat. Base / receptacle were killed as shim twins.
 * Walkers still want Tuesday to replace the socket, or “make the bulb
 * click in.” I will not socket it. Neck still twists. Still lights.
 * Still for sale. Not twist. Not a shop. Not shim.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:socket-listing-ids` is the client socket set.
 * Cookie `iss-socket-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write twist, led, box, shim, cast, harp, kit, bulb, sand,
 * player, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a junk PDF does not
 * take a socket. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SOCKET_STORAGE_KEY = "iss:socket-listing-ids";
export const SOCKET_COOKIE_NAME = "iss-socket-listing-ids";
export const SOCKET_CHANGED_EVENT = "iss:socket-changed";

export const SOCKET_REFUSE_COPY = "That one does not take a socket note.";
export const SOCKET_TABLE_LINE = "I will not socket it.";
export const SOCKET_NECK_LINE = "Neck still twists.";
export const SOCKET_LIGHTS_LINE = "Still lights.";
export const SOCKET_NOTICE_TITLE =
  "I will not socket it. Neck still twists. Still lights.";
export const SOCKET_WALK_LINE =
  "Walkers still want Tuesday to replace the socket, or make the bulb click in.";
export const SOCKET_STAYS_LINE =
  "This is the socket note. I will not socket it. Neck still twists. Still lights.";
export const SOCKET_STILL_LINE = "Still tote. Not twist. Not a shop. Not shim.";
export const SOCKET_TOTE_LINE = "Add to tote still works.";
export const SOCKET_EMPTY_LINE = "Nobody taped a socket note yet.";
export const SOCKET_LEAVE_LINE = "Leave the neck";

const SERVER_STORE = Symbol.for("iss.socket-listing-ids");

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

export function parseSocketListingIds(raw: string | null | undefined): string[] {
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

export function socketCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SOCKET_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SOCKET_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SOCKET_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SOCKET_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SOCKET_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSocketListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSocketListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SOCKET_STORAGE_KEY);
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
          window.localStorage.setItem(SOCKET_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSocketListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = socketCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SOCKET_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SOCKET_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SOCKET_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSocketOverlay(
  listingId: string,
  listingIds: readonly string[] = readSocketListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeSocket(listing: Listing | undefined): listing is Listing {
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

export type SocketWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

function refuseSocket(
  listing: Listing | undefined,
  listingIds: string[],
): { ok: false; reason: SocketWriteReason; listingIds: string[] } | null {
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

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingSocket(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSocket(listing, listingIds)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingSocket(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSocket(listing, listingIds)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeSocket(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SOCKET_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SOCKET_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SOCKET_CHANGED_EVENT, listener);
  };
}
