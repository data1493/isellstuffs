/**
 * I will not bake — cassette bake refusal. Still tote.
 *
 * Hiss is the hiss. Rip is no WAV. Songs is no titles.
 * Radio / rewind was killed. Walkers still want Sunday Crate
 * to bake SUMMER 93, or “make the sticky-shed go.”
 * I will not bake. Rewound by hand. Still for sale.
 * Not hiss. Not a bake shop. Not rip.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:bake-listing-ids` is the client bake set.
 * Cookie `iss-bake-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write hiss, songs, rip, scan, vg, remember, name, oven,
 * sticky, shed, radio, film, look, ask, hands, van, firm,
 * packed, sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a liner PDF does not bake.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const BAKE_STORAGE_KEY = "iss:bake-listing-ids";
export const BAKE_COOKIE_NAME = "iss-bake-listing-ids";
export const BAKE_CHANGED_EVENT = "iss:bake-changed";

export const BAKE_REFUSE_COPY = "That one does not bake.";
export const BAKE_TABLE_LINE = "I will not bake.";
export const BAKE_REWIND_LINE = "Rewound by hand.";
export const BAKE_NOTICE_TITLE = "I will not bake. Rewound by hand.";
export const BAKE_HISS_LINE = "Hiss is the hiss.";
export const BAKE_RIP_LINE = "Rip is no WAV.";
export const BAKE_SONGS_LINE = "Songs is no titles.";
export const BAKE_WALK_LINE = "Walkers still want Sunday Crate to bake SUMMER 93.";
export const BAKE_STAYS_LINE = "This is the bake refusal.";
export const BAKE_STILL_LINE = "Still tote. Not hiss. Not a bake shop. Not rip.";
export const BAKE_TOTE_LINE = "Add to tote still works.";
export const BAKE_EMPTY_LINE = "Nobody taped a bake refusal yet.";

const SERVER_STORE = Symbol.for("iss.bake-listing-ids");

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

export function parseBakeListingIds(raw: string | null | undefined): string[] {
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

export function bakeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BAKE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BAKE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BAKE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BAKE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BAKE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBakeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBakeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BAKE_STORAGE_KEY);
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
          window.localStorage.setItem(BAKE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeBakeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = bakeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BAKE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BAKE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BAKE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBakeOverlay(
  listingId: string,
  listingIds = readBakeListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeBake(listing: Listing | undefined): listing is Listing {
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

export type BakeWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type BakeWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: BakeWriteReason; listingIds: string[] };

function refuseBake(
  listing: Listing | undefined,
  listingIds: string[],
): BakeWriteResult | null {
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

export function markListingBake(
  listing: Listing | undefined,
  listingIds: string[],
): BakeWriteResult {
  const refused = refuseBake(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingBake(
  listing: Listing | undefined,
  listingIds: string[],
): BakeWriteResult {
  const refused = refuseBake(listing, listingIds);
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

export function subscribeBake(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BAKE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BAKE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BAKE_CHANGED_EVENT, listener);
  };
}
