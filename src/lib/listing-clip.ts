/**
 * The clip walked — paper clip / binder clip is gone. Still tote.
 *
 * Remote is the clicker. Key is the cabinet key.
 * This is a stack of paper missing its clip. Not lost. Not remote.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:clip-listing-ids` is the client clip set.
 * Cookie `iss-clip-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write remote, key, lost, vibe, workbook, grade, stems, wrong,
 * foundry, box, manual, sew, scan, size, fits, pile, cases, book,
 * strap, van, look, ask, hands, firm, packed, sold, file-gone, gift,
 * buy, digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp does not
 * miss a paper clip. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const CLIP_STORAGE_KEY = "iss:clip-listing-ids";
export const CLIP_COOKIE_NAME = "iss-clip-listing-ids";
export const CLIP_CHANGED_EVENT = "iss:clip-changed";

export const CLIP_REFUSE_COPY = "That one does not miss a clip.";
export const CLIP_TABLE_LINE = "The clip walked.";
export const CLIP_PAPER_LINE = "The paper clip is gone.";
export const CLIP_STACK_LINE = "This is a stack of paper missing its clip.";
export const CLIP_REMOTE_LINE = "Remote is the clicker. Key is the cabinet key.";
export const CLIP_STILL_LINE = "Still tote. Not lost. Not remote.";
export const CLIP_TOTE_LINE = "Add to tote still works.";
export const CLIP_EMPTY_LINE = "Nobody taped the clip yet.";

const SERVER_STORE = Symbol.for("iss.clip-listing-ids");

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

export function parseClipListingIds(raw: string | null | undefined): string[] {
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

export function clipCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const CLIP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CLIP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(CLIP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(CLIP_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CLIP_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseClipListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readClipListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(CLIP_STORAGE_KEY);
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
          window.localStorage.setItem(CLIP_STORAGE_KEY, JSON.stringify(ids));
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

export function writeClipListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = clipCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CLIP_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${CLIP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(CLIP_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingClipOverlay(
  listingId: string,
  listingIds = readClipListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeClip(listing: Listing | undefined): listing is Listing {
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

export type ClipWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type ClipWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: ClipWriteReason; listingIds: string[] };

function refuseClip(
  listing: Listing | undefined,
  listingIds: string[],
): ClipWriteResult | null {
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

export function markListingClip(
  listing: Listing | undefined,
  listingIds: string[],
): ClipWriteResult {
  const refused = refuseClip(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingClip(
  listing: Listing | undefined,
  listingIds: string[],
): ClipWriteResult {
  const refused = refuseClip(listing, listingIds);
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

export function subscribeClip(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CLIP_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CLIP_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CLIP_CHANGED_EVENT, listener);
  };
}
