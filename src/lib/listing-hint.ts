/**
 * I will not hint it — two weights. Still a map. Still tote.
 *
 * Foundry is two weights. Slant is no italic. Icons is no glyphs.
 * Bold is no third weight. Kern / woff were killed as bold twins.
 * Walkers still want Beats to hint the OTF, or “make it a webfont.”
 * I will not hint it. Two weights. Still a map. Still for sale.
 * Not foundry. Not a foundry seat. Not bold.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:hint-listing-ids` is the client hint set.
 * Cookie `iss-hint-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write foundry, slant, icons, bold, rights, norm, kern, woff,
 * install, host, court, map, directory, look, ask, hands, van, firm,
 * packed, sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp does not
 * take a hint. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const HINT_STORAGE_KEY = "iss:hint-listing-ids";
export const HINT_COOKIE_NAME = "iss-hint-listing-ids";
export const HINT_CHANGED_EVENT = "iss:hint-changed";

export const HINT_REFUSE_COPY = "That one does not take a hint note.";
export const HINT_TABLE_LINE = "I will not hint it.";
export const HINT_WEIGHTS_LINE = "Two weights.";
export const HINT_MAP_LINE = "Still a map.";
export const HINT_NOTICE_TITLE =
  "I will not hint it. Two weights. Still a map.";
export const HINT_WALK_LINE =
  "Walkers still want Beats to hint the OTF, or make it a webfont.";
export const HINT_STAYS_LINE =
  "This is the hint note. Two weights. Still a map.";
export const HINT_STILL_LINE =
  "Still tote. Not foundry. Not a foundry seat. Not bold.";
export const HINT_TOTE_LINE = "Add to tote still works.";
export const HINT_EMPTY_LINE = "Nobody taped the hint note yet.";

const SERVER_STORE = Symbol.for("iss.hint-listing-ids");

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

export function parseHintListingIds(raw: string | null | undefined): string[] {
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

export function hintCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const HINT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${HINT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(HINT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(HINT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${HINT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseHintListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readHintListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(HINT_STORAGE_KEY);
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
          window.localStorage.setItem(HINT_STORAGE_KEY, JSON.stringify(ids));
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

export function writeHintListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = hintCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(HINT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${HINT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(HINT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingHintOverlay(
  listingId: string,
  listingIds: readonly string[] = readHintListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeHint(listing: Listing | undefined): listing is Listing {
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

export type HintWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type HintWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: HintWriteReason; listingIds: string[] };

function refuseHint(
  listing: Listing | undefined,
  listingIds: string[],
): HintWriteResult | null {
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

export function markListingHint(
  listing: Listing | undefined,
  listingIds: string[],
): HintWriteResult {
  const refused = refuseHint(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingHint(
  listing: Listing | undefined,
  listingIds: string[],
): HintWriteResult {
  const refused = refuseHint(listing, listingIds);
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

export function subscribeHint(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === HINT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(HINT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(HINT_CHANGED_EVENT, listener);
  };
}
