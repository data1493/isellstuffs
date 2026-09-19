/**
 * The shade stays in the box — lamp-shade packing honesty. Still tote.
 *
 * Cord is rewired. Heavy is two people. This is the lamp shade
 * packed separately. Not wrap. Not cord.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:box-listing-ids` is the client box set.
 * Cookie `iss-box-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write cord, heavy, wrap, foundry, knob, wrong, chip, fits, bent,
 * heat, vibe, workbook, deck, hinge, key, remote, strap, lost, van, pile,
 * grade, cells, parts, wash, stick, shell, cases, plays, press, film, look,
 * ask, hands, scan, with, firm, packed, sold, file-gone, gift, buy, digital
 * eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not pack a shade.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const BOX_STORAGE_KEY = "iss:box-listing-ids";
export const BOX_COOKIE_NAME = "iss-box-listing-ids";
export const BOX_CHANGED_EVENT = "iss:box-changed";

export const BOX_REFUSE_COPY = "That one does not keep a shade in the box.";
export const BOX_TABLE_LINE = "The shade stays in the box.";
export const BOX_CORD_LINE = "Cord is rewired. Heavy is two people.";
export const BOX_SHADE_LINE = "This is the lamp shade packed separately.";
export const BOX_STILL_LINE = "Still tote. Not wrap. Not cord.";
export const BOX_TOTE_LINE = "Add to tote still works.";
export const BOX_EMPTY_LINE = "Nobody taped the shade box yet.";

const SERVER_STORE = Symbol.for("iss.box-listing-ids");

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

export function parseBoxListingIds(raw: string | null | undefined): string[] {
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

export function boxCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BOX_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOX_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BOX_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOX_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BOX_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBoxListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBoxListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BOX_STORAGE_KEY);
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
          window.localStorage.setItem(BOX_STORAGE_KEY, JSON.stringify(ids));
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

export function writeBoxListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = boxCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BOX_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BOX_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BOX_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBoxOverlay(
  listingId: string,
  listingIds = readBoxListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeBox(listing: Listing | undefined): listing is Listing {
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

export type BoxWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type BoxWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: BoxWriteReason; listingIds: string[] };

function refuseBox(
  listing: Listing | undefined,
  listingIds: string[],
): BoxWriteResult | null {
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

export function markListingBox(
  listing: Listing | undefined,
  listingIds: string[],
): BoxWriteResult {
  const refused = refuseBox(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingBox(
  listing: Listing | undefined,
  listingIds: string[],
): BoxWriteResult {
  const refused = refuseBox(listing, listingIds);
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

export function subscribeBox(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BOX_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BOX_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOX_CHANGED_EVENT, listener);
  };
}
