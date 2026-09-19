/**
 * I don't have a backlight — Game Boy glow refusal. Still tote.
 *
 * Line is the screen crack. Cells pulled the AAs. Recap is
 * save-battery. Link is no cable. Walkers still want Half-Working
 * to put a light behind Tetris, or “make it glow.” I don't have a
 * backlight. Line stays. Still plays. Still a Game Boy. Still for
 * sale. Not line. Not a shop. Not recap.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:glow-listing-ids` is the client glow set.
 * Cookie `iss-glow-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write line, cells, link, glue, dump, recap, dim, bright,
 * lcd, screen, panel, backlight, film, look, ask, hands, van,
 * firm, packed, sold, file-gone, gift, buy, digital eligibility,
 * or tote keys.
 * Gift listings and digital files are refused — a LUT does not
 * take a backlight. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const GLOW_STORAGE_KEY = "iss:glow-listing-ids";
export const GLOW_COOKIE_NAME = "iss-glow-listing-ids";
export const GLOW_CHANGED_EVENT = "iss:glow-changed";

export const GLOW_REFUSE_COPY = "That one does not take a backlight.";
export const GLOW_TABLE_LINE = "I don't have a backlight.";
export const GLOW_LINE_LINE = "Line stays.";
export const GLOW_PLAYS_LINE = "Still plays.";
export const GLOW_NOTICE_TITLE =
  "I don't have a backlight. Line stays. Still plays.";
export const GLOW_WALK_LINE =
  "Walkers still want Half-Working to put a light behind Tetris, or make it glow.";
export const GLOW_STAYS_LINE =
  "This is the glow note. I don't have a backlight. Line stays. Still plays.";
export const GLOW_STILL_LINE = "Still tote. Not line. Not a shop. Not recap.";
export const GLOW_TOTE_LINE = "Add to tote still works.";
export const GLOW_EMPTY_LINE = "Nobody taped a backlight note yet.";

const SERVER_STORE = Symbol.for("iss.glow-listing-ids");

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

export function parseGlowListingIds(raw: string | null | undefined): string[] {
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

export function glowCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GLOW_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GLOW_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GLOW_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GLOW_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GLOW_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGlowListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGlowListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GLOW_STORAGE_KEY);
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
          window.localStorage.setItem(GLOW_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGlowListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = glowCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GLOW_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GLOW_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GLOW_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGlowOverlay(
  listingId: string,
  listingIds: readonly string[] = readGlowListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeGlow(listing: Listing | undefined): listing is Listing {
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

export type GlowWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type GlowWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: GlowWriteReason; listingIds: string[] };

function refuseGlow(
  listing: Listing | undefined,
  listingIds: string[],
): GlowWriteResult | null {
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

export function markListingGlow(
  listing: Listing | undefined,
  listingIds: string[],
): GlowWriteResult {
  const refused = refuseGlow(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingGlow(
  listing: Listing | undefined,
  listingIds: string[],
): GlowWriteResult {
  const refused = refuseGlow(listing, listingIds);
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

export function subscribeGlow(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GLOW_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GLOW_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GLOW_CHANGED_EVENT, listener);
  };
}
