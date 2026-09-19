/**
 * I will not list what’s on it — the CD-R stays Sharpie. Still tote.
 *
 * Ink is the Sharpie. Plays is once. Zip is no leftover zip.
 * Master is the session folder. Toc / tracks were killed as ink twins.
 * Walkers still want Beats to write what’s on BEATS 07, or “make a
 * tracklist.” I will not list what’s on it. Still Sharpie. Still
 * scratched. Still for sale. Not ink. Not a rip. Not master.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:contents-listing-ids` is the client contents set.
 * Cookie `iss-contents-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write ink, plays, zip, master, polish, tray, songs, burn,
 * player, toc, tracks, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a sample pack does
 * not take a contents card. Fixture `sold` / `file-gone` rows stay
 * as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const CONTENTS_STORAGE_KEY = "iss:contents-listing-ids";
export const CONTENTS_COOKIE_NAME = "iss-contents-listing-ids";
export const CONTENTS_CHANGED_EVENT = "iss:contents-changed";

export const CONTENTS_REFUSE_COPY = "That one does not take a contents note.";
export const CONTENTS_TABLE_LINE = "I will not list what’s on it.";
export const CONTENTS_SHARPIE_LINE = "Still Sharpie.";
export const CONTENTS_SCRATCHED_LINE = "Still scratched.";
export const CONTENTS_NOTICE_TITLE =
  "I will not list what’s on it. Still Sharpie. Still scratched.";
export const CONTENTS_WALK_LINE =
  "Walkers still want Beats to write what’s on BEATS 07, or make a tracklist.";
export const CONTENTS_STAYS_LINE =
  "This is the contents note. I will not list what’s on it. Still Sharpie. Still scratched.";
export const CONTENTS_STILL_LINE = "Still tote. Not ink. Not a rip. Not master.";
export const CONTENTS_TOTE_LINE = "Add to tote still works.";
export const CONTENTS_EMPTY_LINE = "Nobody taped a contents note yet.";
export const CONTENTS_LEAVE_LINE = "Leave the Sharpie";

const SERVER_STORE = Symbol.for("iss.contents-listing-ids");

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

export function parseContentsListingIds(
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

export function contentsCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const CONTENTS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CONTENTS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(CONTENTS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(CONTENTS_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CONTENTS_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseContentsListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readContentsListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(CONTENTS_STORAGE_KEY);
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
            CONTENTS_STORAGE_KEY,
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

export function writeContentsListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = contentsCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CONTENTS_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${CONTENTS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(CONTENTS_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingContentsOverlay(
  listingId: string,
  listingIds: readonly string[] = readContentsListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeContents(
  listing: Listing | undefined,
): listing is Listing {
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

export type ContentsWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

function refuseContents(
  listing: Listing | undefined,
  listingIds: string[],
): { ok: false; reason: ContentsWriteReason; listingIds: string[] } | null {
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
export function markListingContents(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseContents(listing, listingIds)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingContents(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseContents(listing, listingIds)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeContents(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CONTENTS_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CONTENTS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CONTENTS_CHANGED_EVENT, listener);
  };
}
