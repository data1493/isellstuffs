/**
 * I will not coil them — the drawer stays a tangle. Still tote.
 *
 * Pile is the tangle. Dongle is no USB-C. Beep is no continuity.
 * Label is HDMI tape. Untangle / ends were killed as pile twins.
 * Walkers still want Half-Working to coil the drawer, or “make
 * them shoppable.” I will not coil them. Still a pile. Still
 * mystery ends. Still for sale. Not pile. Not a shop. Not label.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:coil-listing-ids` is the client coil set.
 * Cookie `iss-coil-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write pile, dongle, beep, label, phone, speaker, flash,
 * driver, wind, wrap, spool, hank, tangle, gift, buy, digital
 * eligibility, or tote keys.
 * Gift listings and digital files are refused — a LUT does not
 * take a coil. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const COIL_STORAGE_KEY = "iss:coil-listing-ids";
export const COIL_COOKIE_NAME = "iss-coil-listing-ids";
export const COIL_CHANGED_EVENT = "iss:coil-changed";

export const COIL_REFUSE_COPY = "That one does not take a coil note.";
export const COIL_TABLE_LINE = "I will not coil them.";
export const COIL_PILE_LINE = "Still a pile.";
export const COIL_ENDS_LINE = "Still mystery ends.";
export const COIL_NOTICE_TITLE =
  "I will not coil them. Still a pile. Still mystery ends.";
export const COIL_WALK_LINE =
  "Walkers still want Half-Working to coil the drawer, or make them shoppable.";
export const COIL_STAYS_LINE =
  "This is the coil note. I will not coil them. Still a pile. Still mystery ends.";
export const COIL_STILL_LINE = "Still tote. Not pile. Not a shop. Not label.";
export const COIL_TOTE_LINE = "Add to tote still works.";
export const COIL_EMPTY_LINE = "Nobody taped a coil note yet.";
export const COIL_LEAVE_LINE = "Leave the tangle";

const SERVER_STORE = Symbol.for("iss.coil-listing-ids");

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

export function parseCoilListingIds(raw: string | null | undefined): string[] {
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

export function coilCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const COIL_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${COIL_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(COIL_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(COIL_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${COIL_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseCoilListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readCoilListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(COIL_STORAGE_KEY);
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
          window.localStorage.setItem(COIL_STORAGE_KEY, JSON.stringify(ids));
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

export function writeCoilListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = coilCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(COIL_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${COIL_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(COIL_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingCoilOverlay(
  listingId: string,
  listingIds: readonly string[] = readCoilListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeCoil(listing: Listing | undefined): listing is Listing {
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

export type CoilWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

function refuseCoil(
  listing: Listing | undefined,
): CoilWriteReason | null {
  if (!listing) {
    return "missing";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isPhysicalListing(listing)) {
    return "digital";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingCoil(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCoil(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingCoil(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCoil(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeCoil(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === COIL_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(COIL_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(COIL_CHANGED_EVENT, listener);
  };
}
