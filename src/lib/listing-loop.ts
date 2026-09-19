/**
 * I will not slice the loop — the leftover loop stays a loop. Still tote.
 *
 * Stems is twelve shots. BPM is a guess. Grade is no custom LUT.
 * Picky / swap-a-kick was killed. Walkers still want Beats to slice
 * the slap loop into a kit, one-shots, or “give me that loop chopped.”
 * I will not slice the loop. The loop stays a loop. Still for sale.
 * Not stems. Not a kit shop. Not bpm.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:loop-listing-ids` is the client loop set.
 * Cookie `iss-loop-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write stems, bpm, grade, stick, zip, folder, convert, picky,
 * slice, chop, project, look, ask, hands, van, firm, packed, sold,
 * file-gone, gift, buy, digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp is not a
 * loop. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const LOOP_STORAGE_KEY = "iss:loop-listing-ids";
export const LOOP_COOKIE_NAME = "iss-loop-listing-ids";
export const LOOP_CHANGED_EVENT = "iss:loop-changed";

export const LOOP_REFUSE_COPY = "That one does not take a loop.";
export const LOOP_TABLE_LINE = "I will not slice the loop.";
export const LOOP_STAYS_LINE = "The loop stays a loop.";
export const LOOP_NOTICE_TITLE =
  "I will not slice the loop. The loop stays a loop.";
export const LOOP_STEMS_LINE = "Stems is twelve shots. BPM is a guess.";
export const LOOP_STILL_LINE = "Still tote. Not stems. Not a kit shop. Not bpm.";
export const LOOP_TOTE_LINE = "Add to tote still works.";
export const LOOP_EMPTY_LINE = "Nobody taped the loop yet.";

const SERVER_STORE = Symbol.for("iss.loop-listing-ids");

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

export function parseLoopListingIds(
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

export function loopCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const LOOP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${LOOP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(LOOP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(LOOP_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${LOOP_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseLoopListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readLoopListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(LOOP_STORAGE_KEY);
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
          window.localStorage.setItem(LOOP_STORAGE_KEY, JSON.stringify(ids));
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

export function writeLoopListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = loopCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(LOOP_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${LOOP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(LOOP_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingLoopOverlay(
  listingId: string,
  listingIds = readLoopListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeLoop(listing: Listing | undefined): listing is Listing {
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

export type LoopWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type LoopWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: LoopWriteReason; listingIds: string[] };

function refuseLoop(
  listing: Listing | undefined,
  listingIds: string[],
): LoopWriteResult | null {
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

export function markListingLoop(
  listing: Listing | undefined,
  listingIds: string[],
): LoopWriteResult {
  const refused = refuseLoop(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingLoop(
  listing: Listing | undefined,
  listingIds: string[],
): LoopWriteResult {
  const refused = refuseLoop(listing, listingIds);
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

export function subscribeLoop(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === LOOP_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LOOP_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOOP_CHANGED_EVENT, listener);
  };
}
