/**
 * These twelve shots — the pack is a shot count, not a stem kit. Still tote.
 *
 * Grade is I don't grade. Walkers still ask Beats for a stem kit
 * on the $4 sample pack. That's twelve one-shots. Still for sale.
 * Not grade. Not the folder.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:stems-listing-ids` is the client shot-count set.
 * Cookie `iss-stems-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write grade, stick, folder, skip, stack, pile, remote,
 * listing-cases, scan, wash, plays, press, film, look, ask, hands,
 * van, firm, packed, sold, file-gone, gift, buy, digital eligibility,
 * or tote keys.
 * Physical listings and gift cards are refused — a lamp is not a
 * twelve-shot pack. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "./commerce/types";

export const STEMS_STORAGE_KEY = "iss:stems-listing-ids";
export const STEMS_COOKIE_NAME = "iss-stems-listing-ids";
export const STEMS_CHANGED_EVENT = "iss:stems-changed";

export const STEMS_REFUSE_COPY = "That one does not take a shot count.";
export const STEMS_TABLE_LINE = "These twelve shots.";
export const STEMS_PACK_LINE = "The pack is twelve shots, not a stem kit.";
export const STEMS_GRADE_LINE =
  "Grade is I don't grade. Walkers still ask Beats for a stem kit.";
export const STEMS_STILL_LINE = "Still tote. Not a fourth status.";
export const STEMS_TOTE_LINE = "Add to tote still works.";
export const STEMS_FOLDER_LINE = "Not grade. Not the folder.";
export const STEMS_EMPTY_LINE = "Nobody taped the twelve shots yet.";

const SERVER_STORE = Symbol.for("iss.stems-listing-ids");

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

export function parseStemsListingIds(raw: string | null | undefined): string[] {
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

export function stemsCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const STEMS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${STEMS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(STEMS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(STEMS_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${STEMS_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseStemsListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readStemsListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(STEMS_STORAGE_KEY);
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
          window.localStorage.setItem(STEMS_STORAGE_KEY, JSON.stringify(ids));
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

export function writeStemsListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = stemsCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STEMS_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${STEMS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(STEMS_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingStemsOverlay(
  listingId: string,
  listingIds = readStemsListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeStems(listing: Listing | undefined): listing is Listing {
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

export type StemsWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type StemsWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: StemsWriteReason; listingIds: string[] };

function refuseStems(
  listing: Listing | undefined,
  listingIds: string[],
): StemsWriteResult | null {
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

export function markListingStems(
  listing: Listing | undefined,
  listingIds: string[],
): StemsWriteResult {
  const refused = refuseStems(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingStems(
  listing: Listing | undefined,
  listingIds: string[],
): StemsWriteResult {
  const refused = refuseStems(listing, listingIds);
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

export function subscribeStems(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === STEMS_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(STEMS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STEMS_CHANGED_EVENT, listener);
  };
}
