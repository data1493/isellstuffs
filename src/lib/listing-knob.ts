/**
 * The knob stays loose — pot-lid knob honesty. Still tote.
 *
 * Fits is the 3-quart. Chip is the mug. This is the pot-lid knob.
 * Not fits. Not bent. Not a fourth status.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:knob-listing-ids` is the client knob set.
 * Cookie `iss-knob-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write fits, chip, bent, heat, wrap, match, vibe, workbook, deck,
 * hinge, key, remote, strap, lost, van, pile, grade, cells, parts, wash,
 * stick, cord, shell, cases, plays, press, film, look, ask, hands, scan,
 * heavy, with, firm, packed, sold, file-gone, gift, buy, digital
 * eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not wiggle.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const KNOB_STORAGE_KEY = "iss:knob-listing-ids";
export const KNOB_COOKIE_NAME = "iss-knob-listing-ids";
export const KNOB_CHANGED_EVENT = "iss:knob-changed";

export const KNOB_REFUSE_COPY = "That one does not keep a loose knob.";
export const KNOB_TABLE_LINE = "The knob stays loose.";
export const KNOB_TIGHTEN_LINE = "I will not tighten it.";
export const KNOB_FITS_LINE = "Fits is the 3-quart. Chip is the mug.";
export const KNOB_LID_LINE = "This is the pot-lid knob.";
export const KNOB_STILL_LINE = "Still tote. Not fits. Not bent.";
export const KNOB_TOTE_LINE = "Add to tote still works.";
export const KNOB_EMPTY_LINE = "Nobody taped the knob yet.";

const SERVER_STORE = Symbol.for("iss.knob-listing-ids");

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

export function parseKnobListingIds(raw: string | null | undefined): string[] {
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

export function knobCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const KNOB_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${KNOB_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(KNOB_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(KNOB_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${KNOB_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseKnobListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readKnobListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(KNOB_STORAGE_KEY);
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
          window.localStorage.setItem(KNOB_STORAGE_KEY, JSON.stringify(ids));
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

export function writeKnobListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = knobCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(KNOB_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${KNOB_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(KNOB_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingKnobOverlay(
  listingId: string,
  listingIds = readKnobListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeKnob(listing: Listing | undefined): listing is Listing {
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

export type KnobWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type KnobWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: KnobWriteReason; listingIds: string[] };

function refuseKnob(
  listing: Listing | undefined,
  listingIds: string[],
): KnobWriteResult | null {
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

export function markListingKnob(
  listing: Listing | undefined,
  listingIds: string[],
): KnobWriteResult {
  const refused = refuseKnob(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingKnob(
  listing: Listing | undefined,
  listingIds: string[],
): KnobWriteResult {
  const refused = refuseKnob(listing, listingIds);
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

export function subscribeKnob(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === KNOB_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(KNOB_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(KNOB_CHANGED_EVENT, listener);
  };
}
