/**
 * I will not profile it — three looks. Still parking-lot. Still tote.
 *
 * Convert is no Rec.709. Warm is the night look. Grade is no custom LUT.
 * Log is no unlog. Cal / chart were killed as log twins.
 * Walkers still want Half-Working to profile the LUTs, or “make a
 * camera profile.” I will not profile it. Three looks. Still
 * parking-lot. Still for sale. Not convert. Not a grade shop. Not log.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:profile-listing-ids` is the client profile set.
 * Cookie `iss-profile-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write convert, warm, grade, log, norm, rights, cal, chart,
 * ccm, booth-copy, booth-wifi, look, ask, hands, van, firm, packed,
 * sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp does not
 * take a camera profile. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const PROFILE_STORAGE_KEY = "iss:profile-listing-ids";
export const PROFILE_COOKIE_NAME = "iss-profile-listing-ids";
export const PROFILE_CHANGED_EVENT = "iss:profile-changed";

export const PROFILE_REFUSE_COPY = "That one does not take a profile note.";
export const PROFILE_TABLE_LINE = "I will not profile it.";
export const PROFILE_LOOKS_LINE = "Three looks.";
export const PROFILE_PARK_LINE = "Still parking-lot.";
export const PROFILE_NOTICE_TITLE =
  "I will not profile it. Three looks. Still parking-lot.";
export const PROFILE_WALK_LINE =
  "Walkers still want Half-Working to profile the LUTs, or make a camera profile.";
export const PROFILE_STAYS_LINE =
  "This is the profile note. Three looks. Still parking-lot.";
export const PROFILE_STILL_LINE =
  "Still tote. Not convert. Not a grade shop. Not log.";
export const PROFILE_TOTE_LINE = "Add to tote still works.";
export const PROFILE_EMPTY_LINE = "Nobody taped the profile note yet.";

const SERVER_STORE = Symbol.for("iss.profile-listing-ids");

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

export function parseProfileListingIds(raw: string | null | undefined): string[] {
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

export function profileCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const PROFILE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PROFILE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(PROFILE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PROFILE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${PROFILE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseProfileListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readProfileListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(PROFILE_STORAGE_KEY);
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
          window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeProfileListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = profileCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PROFILE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingProfileOverlay(
  listingId: string,
  listingIds: readonly string[] = readProfileListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeProfile(listing: Listing | undefined): listing is Listing {
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

export type ProfileWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type ProfileWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: ProfileWriteReason; listingIds: string[] };

function refuseProfile(
  listing: Listing | undefined,
  listingIds: string[],
): ProfileWriteResult | null {
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

export function markListingProfile(
  listing: Listing | undefined,
  listingIds: string[],
): ProfileWriteResult {
  const refused = refuseProfile(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingProfile(
  listing: Listing | undefined,
  listingIds: string[],
): ProfileWriteResult {
  const refused = refuseProfile(listing, listingIds);
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

export function subscribeProfile(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PROFILE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PROFILE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PROFILE_CHANGED_EVENT, listener);
  };
}
