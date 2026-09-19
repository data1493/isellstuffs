/**
 * Not a foundry seat — one booth license on the mall-directory font.
 *
 * Stick is no email. This is the booth font honesty. Not a EULA
 * shop. Not stick. That's the file. Still for sale.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:foundry-listing-ids` is the client foundry set.
 * Cookie `iss-foundry-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write stick, grade, folder, vibe, workbook, scan, stems,
 * skip, stack, pile, remote, listing-cases, wash, plays, press,
 * film, look, ask, hands, van, firm, packed, sold, file-gone, gift,
 * buy, digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp does not
 * take a foundry seat. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "./commerce/types";

export const FOUNDRY_STORAGE_KEY = "iss:foundry-listing-ids";
export const FOUNDRY_COOKIE_NAME = "iss-foundry-listing-ids";
export const FOUNDRY_CHANGED_EVENT = "iss:foundry-changed";

export const FOUNDRY_REFUSE_COPY = "That one does not take a foundry seat.";
export const FOUNDRY_TABLE_LINE = "Not a foundry seat.";
export const FOUNDRY_LICENSE_LINE = "One booth license.";
export const FOUNDRY_STICK_LINE =
  "Stick is no email. This is the booth font honesty.";
export const FOUNDRY_EULA_LINE = "Not a EULA shop. Not stick.";
export const FOUNDRY_STILL_LINE = "Still tote. Not a fourth status.";
export const FOUNDRY_TOTE_LINE = "Add to tote still works.";
export const FOUNDRY_EMPTY_LINE = "Nobody taped the foundry seat yet.";

const SERVER_STORE = Symbol.for("iss.foundry-listing-ids");

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

export function parseFoundryListingIds(
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

export function foundryCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const FOUNDRY_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${FOUNDRY_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(FOUNDRY_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(FOUNDRY_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${FOUNDRY_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseFoundryListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readFoundryListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(FOUNDRY_STORAGE_KEY);
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
            FOUNDRY_STORAGE_KEY,
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

  return serverStore();
}

export function writeFoundryListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = foundryCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(FOUNDRY_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${FOUNDRY_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(FOUNDRY_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingFoundryOverlay(
  listingId: string,
  listingIds = readFoundryListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeFoundry(
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
  if (listing.status === "sold" || listing.status === "file-gone") {
    return false;
  }
  return true;
}

export type FoundryWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type FoundryWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: FoundryWriteReason; listingIds: string[] };

function refuseFoundry(
  listing: Listing | undefined,
  listingIds: string[],
): FoundryWriteResult | null {
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
  if (!isDigitalListing(listing)) {
    return { ok: false, reason: "physical", listingIds };
  }
  return null;
}

export function markListingFoundry(
  listing: Listing | undefined,
  listingIds: string[],
): FoundryWriteResult {
  const refused = refuseFoundry(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingFoundry(
  listing: Listing | undefined,
  listingIds: string[],
): FoundryWriteResult {
  const refused = refuseFoundry(listing, listingIds);
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

export function subscribeFoundry(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === FOUNDRY_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(FOUNDRY_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FOUNDRY_CHANGED_EVENT, listener);
  };
}
