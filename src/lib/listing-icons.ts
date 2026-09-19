/**
 * I will not draw the icons — two weights. Still tote.
 *
 * Slant is I will not cut a slant. Foundry is two weights. Bold /
 * hint / host / court were killed. Tune is the pack. Walkers still
 * want Beats to draw the food-court icons, or “give me the restrooms
 * glyph.” I will not draw the icons. Two weights. Still for sale.
 * Not slant. Not a sign shop. Not foundry.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:icons-listing-ids` is the client icons set.
 * Cookie `iss-icons-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and physical rows are refused — a CD-R is not a
 * pictogram. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const ICONS_STORAGE_KEY = "iss:icons-listing-ids";
export const ICONS_COOKIE_NAME = "iss-icons-listing-ids";
export const ICONS_CHANGED_EVENT = "iss:icons-changed";

export const ICONS_REFUSE_COPY = "That one does not take an icons note.";
export const ICONS_TABLE_LINE = "I will not draw the icons.";
export const ICONS_WEIGHTS_LINE = "Two weights.";
export const ICONS_NOTICE_TITLE = "I will not draw the icons. Two weights.";
export const ICONS_WALK_LINE = "Walkers still want the restrooms glyph.";
export const ICONS_STILL_LINE = "Still tote. Not slant. Not a sign shop. Not foundry.";
export const ICONS_TOTE_LINE = "Add to tote still works.";
export const ICONS_EMPTY_LINE = "Nobody taped the icons note yet.";

const SERVER_STORE = Symbol.for("iss.icons-listing-ids");

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

export function parseIconsListingIds(raw: string | null | undefined): string[] {
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

export function iconsCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const ICONS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${ICONS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(ICONS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(ICONS_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${ICONS_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseIconsListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readIconsListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(ICONS_STORAGE_KEY);
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
          window.localStorage.setItem(ICONS_STORAGE_KEY, JSON.stringify(ids));
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

export function writeIconsListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = iconsCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(ICONS_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${ICONS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(ICONS_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingIconsOverlay(
  listingId: string,
  listingIds = readIconsListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeIcons(listing: Listing | undefined): listing is Listing {
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

export type IconsWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type IconsWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: IconsWriteReason; listingIds: string[] };

function refuseIcons(
  listing: Listing | undefined,
  listingIds: string[],
): IconsWriteResult | null {
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

export function markListingIcons(
  listing: Listing | undefined,
  listingIds: string[],
): IconsWriteResult {
  const refused = refuseIcons(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingIcons(
  listing: Listing | undefined,
  listingIds: string[],
): IconsWriteResult {
  const refused = refuseIcons(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return {
    ok: true,
    listingIds: listingIds.filter((id) => id !== taped.id),
  };
}

export function subscribeIcons(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === ICONS_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(ICONS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ICONS_CHANGED_EVENT, listener);
  };
}
