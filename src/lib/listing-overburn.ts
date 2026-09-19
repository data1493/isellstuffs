/**
 * I will not overburn it — the CD-R stays Sharpie. Still tote.
 *
 * Bevel is the outer. Lathe is resurface. Finalize is disc-close.
 * Polish is the scratch. Ink is Sharpie. Face is hub-print. Burn
 * stays queued. Walkers still want Beats to overburn the CD-R, or
 * squeeze extra minutes past the lead-out. I will not overburn it.
 * Still Sharpie. Still scratched. Still for sale. Not bevel. Not
 * lathe. Not finalize. Not polish.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:overburn-listing-ids` is the client overburn set.
 * Cookie `iss-overburn-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write bevel, lathe, finalize, face, burn, fell, polish, ink,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `ysk-burned-cdr` only. Pack, font, gift, zine, Game Boy,
 * scratched LP, junk PDF, and listings already owned by another
 * overlay stay off. Fixture `sold` / `file-gone` rows stay as they
 * are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const OVERBURN_STORAGE_KEY = "iss:overburn-listing-ids";
export const OVERBURN_COOKIE_NAME = "iss-overburn-listing-ids";
export const OVERBURN_CHANGED_EVENT = "iss:overburn-changed";

export const OVERBURN_HOST_ID = "ysk-burned-cdr";
export const OVERBURN_PACK_ID = "dl-sample-pack";
export const OVERBURN_FONT_ID = "dl-booth-font";
export const OVERBURN_ZINE_ID = "dl-stain-zine";
export const OVERBURN_CHAIR_ID = "ysk-folding-chair";
export const OVERBURN_BOY_ID = "gtk-game-boy";
export const OVERBURN_LP_ID = "mdb-scratched-lp";
export const OVERBURN_JUNK_ID = "dl-junk-pricing-pdf";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const OVERBURN_OWNED_IDS = [
  OVERBURN_BOY_ID,
  OVERBURN_LP_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "gtk-cable-drawer",
  "dl-booth-font",
  "dl-sample-pack",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  OVERBURN_JUNK_ID,
] as const;

const ownedSet = new Set<string>(OVERBURN_OWNED_IDS);

export const OVERBURN_REFUSE_COPY = "That one does not take an overburn note.";
export const OVERBURN_TABLE_LINE = "I will not overburn it.";
export const OVERBURN_SHARPIE_LINE = "Still Sharpie.";
export const OVERBURN_SCRATCHED_LINE = "Still scratched.";
export const OVERBURN_NOTICE_TITLE =
  "I will not overburn it. Still Sharpie. Still scratched.";
export const OVERBURN_WALK_LINE =
  "Walkers still want Beats to overburn the disc, or squeeze extra minutes past the lead-out.";
export const OVERBURN_STAYS_LINE =
  "This is the overburn note. I will not overburn it. Still Sharpie. Still scratched.";
export const OVERBURN_STILL_LINE =
  "Still tote. Not bevel. Not lathe. Not finalize.";
export const OVERBURN_TOTE_LINE = "Add to tote still works.";
export const OVERBURN_EMPTY_LINE = "Nobody taped an overburn note yet.";
export const OVERBURN_LEAVE_LINE = "Leave the extra";

const SERVER_STORE = Symbol.for("iss.overburn-listing-ids");

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

export function parseOverburnListingIds(
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

export function overburnCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const OVERBURN_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${OVERBURN_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(OVERBURN_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(OVERBURN_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${OVERBURN_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseOverburnListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readOverburnListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(OVERBURN_STORAGE_KEY);
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
          window.localStorage.setItem(OVERBURN_STORAGE_KEY, JSON.stringify(ids));
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

export function writeOverburnListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = overburnCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(OVERBURN_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${OVERBURN_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(OVERBURN_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingOverburnOverlay(
  listingId: string,
  listingIds: readonly string[] = readOverburnListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === OVERBURN_PACK_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === OVERBURN_FONT_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === OVERBURN_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host disc only. Pack, font, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeOverburn(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== OVERBURN_HOST_ID) {
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

export type OverburnWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "font"
  | "chair"
  | "owned";

function refuseOverburn(
  listing: Listing | undefined,
): OverburnWriteReason | null {
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
  if (!isPhysicalListing(listing)) {
    return "digital";
  }
  if (isChairListing(listing)) {
    return "chair";
  }
  if (isPackListing(listing)) {
    return "pack";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (isOwnedListing(listing) || listing.id !== OVERBURN_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingOverburn(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseOverburn(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingOverburn(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseOverburn(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeOverburn(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === OVERBURN_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(OVERBURN_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(OVERBURN_CHANGED_EVENT, listener);
  };
}
