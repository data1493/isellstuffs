/**
 * The remote walked — clicker is not in the box. Still tote.
 *
 * Cells are out of the Game Boy. This is the living-room clicker that walked.
 * Not parts. Not van. Not a fourth status.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:remote-listing-ids` is the client remote set.
 * Cookie `iss-remote-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write cells, parts, van, wash, stick, cord, bent, shell, heat,
 * cases, plays, fits, press, film, look, ask, hands, scan, heavy, with,
 * firm, packed, sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not take a clicker.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const REMOTE_STORAGE_KEY = "iss:remote-listing-ids";
export const REMOTE_COOKIE_NAME = "iss-remote-listing-ids";
export const REMOTE_CHANGED_EVENT = "iss:remote-changed";

export const REMOTE_REFUSE_COPY = "That one does not need a remote.";
export const REMOTE_TABLE_LINE = "The remote walked.";
export const REMOTE_CLICKER_LINE = "Clicker is not in the box.";
export const REMOTE_STILL_LINE = "Still tote. Not a fourth status.";
export const REMOTE_TOTE_LINE = "Add to tote still works.";
export const REMOTE_CELLS_LINE =
  "Cells are out of the Game Boy. This is the living-room clicker that walked.";
export const REMOTE_PARTS_LINE = "Not parts. Not van.";
export const REMOTE_EMPTY_LINE = "Nobody taped the remote yet.";

const SERVER_STORE = Symbol.for("iss.remote-listing-ids");

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

export function parseRemoteListingIds(raw: string | null | undefined): string[] {
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

export function remoteCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const REMOTE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${REMOTE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(REMOTE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(REMOTE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${REMOTE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseRemoteListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readRemoteListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(REMOTE_STORAGE_KEY);
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
          window.localStorage.setItem(REMOTE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeRemoteListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = remoteCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(REMOTE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${REMOTE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(REMOTE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingRemoteOverlay(
  listingId: string,
  listingIds = readRemoteListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeRemote(listing: Listing | undefined): listing is Listing {
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

export type RemoteWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type RemoteWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: RemoteWriteReason; listingIds: string[] };

function refuseRemote(
  listing: Listing | undefined,
  listingIds: string[],
): RemoteWriteResult | null {
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

export function markListingRemote(
  listing: Listing | undefined,
  listingIds: string[],
): RemoteWriteResult {
  const refused = refuseRemote(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingRemote(
  listing: Listing | undefined,
  listingIds: string[],
): RemoteWriteResult {
  const refused = refuseRemote(listing, listingIds);
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

export function subscribeRemote(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === REMOTE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(REMOTE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(REMOTE_CHANGED_EVENT, listener);
  };
}
