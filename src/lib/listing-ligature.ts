/**
 * I will not ligature it — still two weights. Still a food court.
 * Still tote.
 *
 * Foundry is two weights. Slant is no italic. Bold is no third
 * weight. Variable is two weights, still almost-bold. Walkers still
 * want Beats to ligature the food-court map, or “make the pairs
 * join.” I will not ligature it. Still two weights. Still a food
 * court. Still for sale. Not foundry. Not slant. Not bold.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:ligature-listing-ids` is the client ligature set.
 * Cookie `iss-ligature-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write foundry, slant, bold, variable, specimen, hint, icons,
 * paginate, print, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-booth-font` only. Pack, LUT, gift, zine, physical,
 * and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const LIGATURE_STORAGE_KEY = "iss:ligature-listing-ids";
export const LIGATURE_COOKIE_NAME = "iss-ligature-listing-ids";
export const LIGATURE_CHANGED_EVENT = "iss:ligature-changed";

export const LIGATURE_HOST_ID = "dl-booth-font";
export const LIGATURE_PACK_ID = "dl-sample-pack";
export const LIGATURE_LUT_ID = "dl-camera-luts";
export const LIGATURE_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const LIGATURE_OWNED_IDS = [
  LIGATURE_PACK_ID,
  LIGATURE_LUT_ID,
  LIGATURE_ZINE_ID,
  "dl-junk-pricing-pdf",
  "dl-crate-side-a",
  "gtk-game-boy",
  "clo-windbreaker",
  "clo-split-soles",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "gtk-cable-drawer",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "ysk-burned-cdr",
  "kdr-chipped-mug",
] as const;

const ownedSet = new Set<string>(LIGATURE_OWNED_IDS);

export const LIGATURE_REFUSE_COPY = "That one does not take a ligature note.";
export const LIGATURE_TABLE_LINE = "I will not ligature it.";
export const LIGATURE_WEIGHTS_LINE = "Still two weights.";
export const LIGATURE_COURT_LINE = "Still a food court.";
export const LIGATURE_NOTICE_TITLE =
  "I will not ligature it. Still two weights. Still a food court.";
export const LIGATURE_WALK_LINE =
  "Walkers still want Beats to ligature the food-court map, or make the pairs join.";
export const LIGATURE_STAYS_LINE =
  "This is the ligature note. I will not ligature it. Still two weights. Still a food court.";
export const LIGATURE_STILL_LINE =
  "Still tote. Not foundry. Not slant. Not bold.";
export const LIGATURE_TOTE_LINE = "Add to tote still works.";
export const LIGATURE_EMPTY_LINE = "Nobody taped a ligature note yet.";
export const LIGATURE_LEAVE_LINE = "Leave the food court";

const SERVER_STORE = Symbol.for("iss.ligature-listing-ids");

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

export function parseLigatureListingIds(
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

export function ligatureCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const LIGATURE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${LIGATURE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(LIGATURE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(LIGATURE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${LIGATURE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseLigatureListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readLigatureListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(LIGATURE_STORAGE_KEY);
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
            LIGATURE_STORAGE_KEY,
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

export function writeLigatureListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = ligatureCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(LIGATURE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${LIGATURE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(LIGATURE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingLigatureOverlay(
  listingId: string,
  listingIds: readonly string[] = readLigatureListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === LIGATURE_PACK_ID;
}

function isLutListing(listing: Listing) {
  return listing.id === LIGATURE_LUT_ID;
}

function isZineListing(listing: Listing) {
  return listing.id === LIGATURE_ZINE_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host booth font only. Pack, LUT, overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeLigature(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== LIGATURE_HOST_ID) {
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

export type LigatureWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "lut"
  | "zine"
  | "owned";

function refuseLigature(
  listing: Listing | undefined,
): LigatureWriteReason | null {
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
    return "physical";
  }
  if (isPackListing(listing)) {
    return "pack";
  }
  if (isLutListing(listing)) {
    return "lut";
  }
  if (isZineListing(listing)) {
    return "zine";
  }
  if (isOwnedListing(listing) || listing.id !== LIGATURE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingLigature(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseLigature(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingLigature(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseLigature(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeLigature(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === LIGATURE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LIGATURE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LIGATURE_CHANGED_EVENT, listener);
  };
}
