/**
 * I will not replace the glass — pot-lid pane refusal. Still tote.
 *
 * Knob is the wiggle. Fits is the 3-quart. Match is nothing
 * matches. The pot walked was killed. Wrap is newspaper on
 * breakables. Walkers still want Sink Drawer to replace the
 * lid glass, or “give me one that isn’t glass.” I will not
 * replace the glass. Lid only. Still for sale. Not knob.
 * Not a glass shop. Not wrap.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:glass-listing-ids` is the client glass set.
 * Cookie `iss-glass-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write knob, fits, wrap, match, whose, pour, chip, heat,
 * gasket, seal, pane, cloud, film, look, ask, hands, van, firm,
 * packed, sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not take glass.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const GLASS_STORAGE_KEY = "iss:glass-listing-ids";
export const GLASS_COOKIE_NAME = "iss-glass-listing-ids";
export const GLASS_CHANGED_EVENT = "iss:glass-changed";

export const GLASS_REFUSE_COPY = "That one does not take glass.";
export const GLASS_TABLE_LINE = "I will not replace the glass.";
export const GLASS_LID_LINE = "Lid only.";
export const GLASS_NOTICE_TITLE = "I will not replace the glass. Lid only.";
export const GLASS_KNOB_LINE = "Knob is the wiggle. Fits is the 3-quart.";
export const GLASS_WRAP_LINE = "Wrap is newspaper. Match is nothing matches.";
export const GLASS_WALK_LINE = "Walkers still want one that isn’t glass.";
export const GLASS_STAYS_LINE = "This is the glass refusal.";
export const GLASS_STILL_LINE = "Still tote. Not knob. Not a glass shop. Not wrap.";
export const GLASS_TOTE_LINE = "Add to tote still works.";
export const GLASS_EMPTY_LINE = "Nobody taped a glass refusal yet.";

const SERVER_STORE = Symbol.for("iss.glass-listing-ids");

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

export function parseGlassListingIds(raw: string | null | undefined): string[] {
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

export function glassCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GLASS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GLASS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GLASS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GLASS_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GLASS_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGlassListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGlassListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GLASS_STORAGE_KEY);
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
          window.localStorage.setItem(GLASS_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGlassListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = glassCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GLASS_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GLASS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GLASS_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGlassOverlay(
  listingId: string,
  listingIds = readGlassListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeGlass(listing: Listing | undefined): listing is Listing {
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

export type GlassWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type GlassWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: GlassWriteReason; listingIds: string[] };

function refuseGlass(
  listing: Listing | undefined,
  listingIds: string[],
): GlassWriteResult | null {
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

export function markListingGlass(
  listing: Listing | undefined,
  listingIds: string[],
): GlassWriteResult {
  const refused = refuseGlass(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingGlass(
  listing: Listing | undefined,
  listingIds: string[],
): GlassWriteResult {
  const refused = refuseGlass(listing, listingIds);
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

export function subscribeGlass(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GLASS_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GLASS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GLASS_CHANGED_EVENT, listener);
  };
}
