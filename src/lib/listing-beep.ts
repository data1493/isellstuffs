/**
 * I will not beep it — the drawer stays an untested tangle. Still tote.
 *
 * Walkers still want Half-Working to beep-test the drawer, or
 * “tell me what works.” I will not beep it. Untested tangle.
 * Still a pile. Still for sale. Not a meter. Not a dongle.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:beep-listing-ids` is the client beep set.
 * Cookie `iss-beep-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and digital files are refused — a LUT does not beep.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const BEEP_STORAGE_KEY = "iss:beep-listing-ids";
export const BEEP_COOKIE_NAME = "iss-beep-listing-ids";
export const BEEP_CHANGED_EVENT = "iss:beep-changed";

export const BEEP_REFUSE_COPY = "That one does not take a beep note.";
export const BEEP_TABLE_LINE = "I will not beep it.";
export const BEEP_TANGLE_LINE = "Untested tangle.";
export const BEEP_PILE_LINE = "Still a pile.";
export const BEEP_NOTICE_TITLE =
  "I will not beep it. Untested tangle. Still a pile.";
export const BEEP_WALK_LINE =
  "Walkers still want Half-Working to beep-test the drawer.";
export const BEEP_STAYS_LINE =
  "This is the beep note. Untested tangle. Still a pile.";
export const BEEP_STILL_LINE = "Still tote. Not a meter. Not a dongle. Still for sale.";
export const BEEP_TOTE_LINE = "Add to tote still works.";
export const BEEP_EMPTY_LINE = "Nobody taped a beep note yet.";

const SERVER_STORE = Symbol.for("iss.beep-listing-ids");

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

export function parseBeepListingIds(raw: string | null | undefined): string[] {
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

export function beepCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BEEP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BEEP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BEEP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BEEP_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BEEP_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBeepListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBeepListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BEEP_STORAGE_KEY);
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
          window.localStorage.setItem(BEEP_STORAGE_KEY, JSON.stringify(ids));
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

export function writeBeepListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = beepCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BEEP_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BEEP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BEEP_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBeepOverlay(
  listingId: string,
  listingIds = readBeepListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeBeep(listing: Listing | undefined): listing is Listing {
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

export type BeepWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type BeepWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: BeepWriteReason; listingIds: string[] };

function refuseBeep(
  listing: Listing | undefined,
  listingIds: string[],
): BeepWriteResult | null {
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

export function markListingBeep(
  listing: Listing | undefined,
  listingIds: string[],
): BeepWriteResult {
  const refused = refuseBeep(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingBeep(
  listing: Listing | undefined,
  listingIds: string[],
): BeepWriteResult {
  const refused = refuseBeep(listing, listingIds);
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

export function subscribeBeep(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BEEP_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BEEP_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BEEP_CHANGED_EVENT, listener);
  };
}
