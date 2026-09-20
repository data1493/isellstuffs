/**
 * I will not trap it — the junk PDF stays a driveway print. Still tote.
 *
 * Preflight is print-ready. Collate is gather-the-pages. Bleed is
 * trim. Typeset is folding-table type. Impose is 2-up. Walkers
 * still want Tuesday to trap How to price your junk, or “choke the
 * knockout so the driveway print does not fill.” I will not trap
 * it. Still a junk PDF. Still a driveway print. Still for sale.
 * Not preflight. Not collate. Not a shop. Not bleed. Print
 * knockout / choke, not a login.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:trap-listing-ids` is the client trap set.
 * Cookie `iss-trap-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write preflight, collate, bleed, typeset, impose, consult,
 * paginate, knockout, overprint, choke, gift, buy, digital
 * eligibility, or tote keys.
 * Host is `dl-junk-pricing-pdf` only. Font, LUT, pack, liner PDF,
 * lamp, gift, zine, and listings already owned by another overlay
 * stay off. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const TRAP_STORAGE_KEY = "iss:trap-listing-ids";
export const TRAP_COOKIE_NAME = "iss-trap-listing-ids";
export const TRAP_CHANGED_EVENT = "iss:trap-changed";

export const TRAP_HOST_ID = "dl-junk-pricing-pdf";
export const TRAP_LINER_ID = "dl-crate-side-a";
export const TRAP_FONT_ID = "dl-booth-font";
export const TRAP_PACK_ID = "dl-sample-pack";
export const TRAP_LUT_ID = "dl-camera-luts";
export const TRAP_LAMP_ID = "ysk-wobbly-lamp";
export const TRAP_ZINE_ID = "dl-stain-zine";
export const TRAP_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const TRAP_OWNED_IDS = [
  TRAP_LINER_ID,
  TRAP_FONT_ID,
  TRAP_PACK_ID,
  TRAP_LUT_ID,
  TRAP_LAMP_ID,
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "ysk-burned-cdr",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "kdr-bent-whisk",
] as const;

const ownedSet = new Set<string>(TRAP_OWNED_IDS);

export const TRAP_REFUSE_COPY = "That one does not take a trap note.";
export const TRAP_TABLE_LINE = "I will not trap it.";
export const TRAP_PDF_LINE = "Still a junk PDF.";
export const TRAP_PRINT_LINE = "Still a driveway print.";
export const TRAP_NOTICE_TITLE =
  "I will not trap it. Still a junk PDF. Still a driveway print.";
export const TRAP_WALK_LINE =
  "Walkers still want Tuesday to trap it, or choke the knockout so the driveway print does not fill.";
export const TRAP_STAYS_LINE =
  "This is the trap note. I will not trap it. Still a junk PDF. Still a driveway print.";
export const TRAP_STILL_LINE =
  "Still tote. Not preflight. Not collate. Not a shop. Not bleed.";
export const TRAP_TOTE_LINE = "Add to tote still works.";
export const TRAP_EMPTY_LINE = "Nobody taped a trap note yet.";
export const TRAP_LEAVE_LINE = "Leave the knockout";

const SERVER_STORE = Symbol.for("iss.trap-listing-ids");

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

export function parseTrapListingIds(
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

export function trapCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const TRAP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${TRAP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(TRAP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(TRAP_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${TRAP_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseTrapListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readTrapListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(TRAP_STORAGE_KEY);
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
          window.localStorage.setItem(TRAP_STORAGE_KEY, JSON.stringify(ids));
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

export function writeTrapListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = trapCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(TRAP_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${TRAP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(TRAP_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingTrapOverlay(
  listingId: string,
  listingIds: readonly string[] = readTrapListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLinerListing(listing: Listing) {
  return listing.id === TRAP_LINER_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === TRAP_FONT_ID;
}

function isPackListing(listing: Listing) {
  return listing.id === TRAP_PACK_ID;
}

function isLutListing(listing: Listing) {
  return listing.id === TRAP_LUT_ID;
}

function isLampListing(listing: Listing) {
  return listing.id === TRAP_LAMP_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host junk PDF only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeTrap(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== TRAP_HOST_ID) {
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

export type TrapWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "liner"
  | "font"
  | "pack"
  | "lut"
  | "lamp"
  | "owned";

function refuseTrap(
  listing: Listing | undefined,
): TrapWriteReason | null {
  if (!listing) {
    return "missing";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    return isLampListing(listing) ? "lamp" : "physical";
  }
  if (isLinerListing(listing)) {
    return "liner";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (isPackListing(listing)) {
    return "pack";
  }
  if (isLutListing(listing)) {
    return "lut";
  }
  if (isOwnedListing(listing) || listing.id !== TRAP_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingTrap(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTrap(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingTrap(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTrap(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeTrap(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === TRAP_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(TRAP_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TRAP_CHANGED_EVENT, listener);
  };
}
