/**
 * I don't grade your lot — parking-lot LUTs stay as-shot. Still tote.
 *
 * Stick is no email. Walkers still ask Beats for a custom grade
 * on the digital lot. That's the file. Still for sale. Not stick.
 * Not scan. Not the folder.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:grade-listing-ids` is the client grade set.
 * Cookie `iss-grade-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write skip, stack, pile, remote, listing-cases, stick, scan,
 * folder, wash, plays, press, film, look, ask, hands, van, firm,
 * packed, sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp does not take
 * a color grade. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "./commerce/types";

export const GRADE_STORAGE_KEY = "iss:grade-listing-ids";
export const GRADE_COOKIE_NAME = "iss-grade-listing-ids";
export const GRADE_CHANGED_EVENT = "iss:grade-changed";

export const GRADE_REFUSE_COPY = "That one does not take a grade.";
export const GRADE_TABLE_LINE = "I don't grade your lot.";
export const GRADE_SHOT_LINE = "Parking-lot LUTs stay as-shot.";
export const GRADE_STICK_LINE =
  "Stick is no email. Walkers still ask Beats for a custom grade.";
export const GRADE_STILL_LINE = "Still tote. Not a fourth status.";
export const GRADE_TOTE_LINE = "Add to tote still works.";
export const GRADE_SCAN_LINE = "Not scan. Not the folder.";
export const GRADE_EMPTY_LINE = "Nobody taped the grade yet.";

const SERVER_STORE = Symbol.for("iss.grade-listing-ids");

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

export function parseGradeListingIds(raw: string | null | undefined): string[] {
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

export function gradeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GRADE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GRADE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GRADE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GRADE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GRADE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGradeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGradeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GRADE_STORAGE_KEY);
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
          window.localStorage.setItem(GRADE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGradeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = gradeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GRADE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GRADE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GRADE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGradeOverlay(
  listingId: string,
  listingIds = readGradeListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeGrade(listing: Listing | undefined): listing is Listing {
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

export type GradeWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type GradeWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: GradeWriteReason; listingIds: string[] };

function refuseGrade(
  listing: Listing | undefined,
  listingIds: string[],
): GradeWriteResult | null {
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

export function markListingGrade(
  listing: Listing | undefined,
  listingIds: string[],
): GradeWriteResult {
  const refused = refuseGrade(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingGrade(
  listing: Listing | undefined,
  listingIds: string[],
): GradeWriteResult {
  const refused = refuseGrade(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (!listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return {
    ok: true,
    listingIds: listingIds.filter((id) => id !== listing!.id),
  };
}

export function subscribeGrade(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GRADE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GRADE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GRADE_CHANGED_EVENT, listener);
  };
}
