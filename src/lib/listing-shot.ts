/**
 * I don't shoot — the camera half-works. Still tote.
 *
 * Convert is Rec.709. Grade is no custom LUT. Film is don't
 * photograph the tags. Strap is the camera strap walked.
 * Walkers still want Half-Working to film the lot, reshoot,
 * or bring the camera. I don't shoot. Three looks. Still
 * for sale. Not convert. Not a hire cam. Not film.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:shot-listing-ids` is the client shot set.
 * Cookie `iss-shot-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write convert, grade, strap, film, claim, dump, folder,
 * stems, vibe, foundry, cards, zip, name, cam, cube, packed,
 * sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp is not
 * a hire cam. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const SHOT_STORAGE_KEY = "iss:shot-listing-ids";
export const SHOT_COOKIE_NAME = "iss-shot-listing-ids";
export const SHOT_CHANGED_EVENT = "iss:shot-changed";

export const SHOT_REFUSE_COPY = "That one does not take a shot.";
export const SHOT_TABLE_LINE = "I don't shoot.";
export const SHOT_CAMERA_LINE = "The camera half-works.";
export const SHOT_NOTICE_TITLE = "I don't shoot. The camera half-works.";
export const SHOT_LOOKS_LINE = "Three looks. Still for sale.";
export const SHOT_CONVERT_LINE = "Convert is Rec.709. Grade is no custom LUT.";
export const SHOT_FILM_LINE =
  "Film is don't photograph the tags. Strap is the camera strap walked.";
export const SHOT_STILL_LINE = "Still tote. Not convert. Not a hire cam. Not film.";
export const SHOT_TOTE_LINE = "Add to tote still works.";
export const SHOT_EMPTY_LINE = "Nobody taped the shot yet.";

const SERVER_STORE = Symbol.for("iss.shot-listing-ids");

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

export function parseShotListingIds(raw: string | null | undefined): string[] {
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

export function shotCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SHOT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SHOT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SHOT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SHOT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SHOT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseShotListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readShotListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SHOT_STORAGE_KEY);
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
          window.localStorage.setItem(SHOT_STORAGE_KEY, JSON.stringify(ids));
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

export function writeShotListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = shotCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SHOT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SHOT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SHOT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingShotOverlay(
  listingId: string,
  listingIds = readShotListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeShot(listing: Listing | undefined): listing is Listing {
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

export type ShotWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type ShotWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: ShotWriteReason; listingIds: string[] };

function refuseShot(
  listing: Listing | undefined,
  listingIds: string[],
): ShotWriteResult | null {
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

export function markListingShot(
  listing: Listing | undefined,
  listingIds: string[],
): ShotWriteResult {
  const refused = refuseShot(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingShot(
  listing: Listing | undefined,
  listingIds: string[],
): ShotWriteResult {
  const refused = refuseShot(listing, listingIds);
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

export function subscribeShot(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SHOT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SHOT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SHOT_CHANGED_EVENT, listener);
  };
}
