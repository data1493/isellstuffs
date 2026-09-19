/**
 * I will not shim it — the lamp stays wobbly. Still tote.
 *
 * Twist is the neck. Led is no cool bulb. Harp is no finial. Box is
 * shade in the carton. Cast is no recast. Kit is no assemble.
 * Walkers still want Tuesday to shim the lamp, or “make it sit flat.”
 * I will not shim it. Neck still twists. Still lights. Still for sale.
 * Not twist. Not a shop. Not kit.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:shim-listing-ids` is the client shim set.
 * Cookie `iss-shim-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write twist, led, box, cast, kit, etch, rights, driver, pad,
 * harp, level, wobble, film, look, ask, hands, van, firm, packed,
 * sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a junk PDF does not
 * take a shim. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SHIM_STORAGE_KEY = "iss:shim-listing-ids";
export const SHIM_COOKIE_NAME = "iss-shim-listing-ids";
export const SHIM_CHANGED_EVENT = "iss:shim-changed";

export const SHIM_REFUSE_COPY = "That one does not take a shim note.";
export const SHIM_TABLE_LINE = "I will not shim it.";
export const SHIM_NECK_LINE = "Neck still twists.";
export const SHIM_LIGHTS_LINE = "Still lights.";
export const SHIM_NOTICE_TITLE =
  "I will not shim it. Neck still twists. Still lights.";
export const SHIM_WALK_LINE =
  "Walkers still want Tuesday to shim the lamp, or make it sit flat.";
export const SHIM_STAYS_LINE =
  "This is the shim note. Neck still twists. Still lights.";
export const SHIM_STILL_LINE = "Still tote. Not twist. Not a shop. Not kit.";
export const SHIM_TOTE_LINE = "Add to tote still works.";
export const SHIM_EMPTY_LINE = "Nobody taped a shim note yet.";

const SERVER_STORE = Symbol.for("iss.shim-listing-ids");

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

export function parseShimListingIds(raw: string | null | undefined): string[] {
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

export function shimCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SHIM_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SHIM_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SHIM_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SHIM_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SHIM_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseShimListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readShimListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SHIM_STORAGE_KEY);
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
          window.localStorage.setItem(SHIM_STORAGE_KEY, JSON.stringify(ids));
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

export function writeShimListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = shimCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SHIM_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SHIM_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SHIM_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingShimOverlay(
  listingId: string,
  listingIds: readonly string[] = readShimListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeShim(listing: Listing | undefined): listing is Listing {
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

export type ShimWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type ShimWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: ShimWriteReason; listingIds: string[] };

function refuseShim(
  listing: Listing | undefined,
  listingIds: string[],
): ShimWriteResult | null {
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

export function markListingShim(
  listing: Listing | undefined,
  listingIds: string[],
): ShimWriteResult {
  const refused = refuseShim(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingShim(
  listing: Listing | undefined,
  listingIds: string[],
): ShimWriteResult {
  const refused = refuseShim(listing, listingIds);
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

export function subscribeShim(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SHIM_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SHIM_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SHIM_CHANGED_EVENT, listener);
  };
}
