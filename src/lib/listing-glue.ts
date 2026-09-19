/**
 * I will not glue — Game Boy plastic refusal. Still tote.
 *
 * Line is the screen. Dump is no ROM. Cells are the AAs.
 * Crack is the ceramic lamp glaze. Fix is I don't solder.
 * Shell is don't open the blister. Walkers still want
 * Half-Working to glue the cracked Game Boy, or “make the
 * plastic one piece.” I will not glue. Press start.
 * Still a Game Boy. Still for sale. Not line. Not a glue
 * shop. Not dump.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:glue-listing-ids` is the client glue set.
 * Cookie `iss-glue-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write dump, line, cells, crack, fix, claim, shell, toe,
 * plastic, epoxy, split, film, look, ask, hands, van, firm,
 * packed, sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not glue.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const GLUE_STORAGE_KEY = "iss:glue-listing-ids";
export const GLUE_COOKIE_NAME = "iss-glue-listing-ids";
export const GLUE_CHANGED_EVENT = "iss:glue-changed";

export const GLUE_REFUSE_COPY = "That one does not take glue.";
export const GLUE_TABLE_LINE = "I will not glue.";
export const GLUE_PRESS_LINE = "Press start.";
export const GLUE_NOTICE_TITLE = "I will not glue. Press start.";
export const GLUE_LINE_LINE = "Line is the screen. Dump is no ROM.";
export const GLUE_CELLS_LINE = "Cells are the AAs. Crack is the lamp glaze.";
export const GLUE_WALK_LINE = "Walkers still want the plastic one piece.";
export const GLUE_STAYS_LINE = "This is the glue refusal.";
export const GLUE_STILL_LINE = "Still tote. Not line. Not a glue shop. Not dump.";
export const GLUE_TOTE_LINE = "Add to tote still works.";
export const GLUE_EMPTY_LINE = "Nobody taped a glue refusal yet.";

const SERVER_STORE = Symbol.for("iss.glue-listing-ids");

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

export function parseGlueListingIds(raw: string | null | undefined): string[] {
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

export function glueCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GLUE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GLUE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GLUE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GLUE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GLUE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGlueListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGlueListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GLUE_STORAGE_KEY);
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
          window.localStorage.setItem(GLUE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGlueListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = glueCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GLUE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GLUE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GLUE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGlueOverlay(
  listingId: string,
  listingIds = readGlueListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeGlue(listing: Listing | undefined): listing is Listing {
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

export type GlueWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type GlueWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: GlueWriteReason; listingIds: string[] };

function refuseGlue(
  listing: Listing | undefined,
  listingIds: string[],
): GlueWriteResult | null {
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

export function markListingGlue(
  listing: Listing | undefined,
  listingIds: string[],
): GlueWriteResult {
  const refused = refuseGlue(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingGlue(
  listing: Listing | undefined,
  listingIds: string[],
): GlueWriteResult {
  const refused = refuseGlue(listing, listingIds);
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

export function subscribeGlue(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GLUE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GLUE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GLUE_CHANGED_EVENT, listener);
  };
}
