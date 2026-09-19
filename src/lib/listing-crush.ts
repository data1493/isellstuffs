/**
 * I will not crush it — twelve shots. Still a zip. Still tote.
 *
 * Tune is no pitch. Loop is no slice. Norm is loudness. Rights is
 * no clear. Limit / compress were killed as norm twins. Walkers
 * still want Beats to crush the kicks, or “make them hit.”
 * I will not crush it. Twelve shots. Still a zip. Still for sale.
 * Not tune. Not a mix desk. Not norm.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:crush-listing-ids` is the client crush set.
 * Cookie `iss-crush-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write tune, loop, stems, norm, rights, bpm, booth-copy,
 * booth-player, gift, buy, digital eligibility, or tote keys.
 * Gift listings and physical rows are refused — a CD-R does not
 * crush. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const CRUSH_STORAGE_KEY = "iss:crush-listing-ids";
export const CRUSH_COOKIE_NAME = "iss-crush-listing-ids";
export const CRUSH_CHANGED_EVENT = "iss:crush-changed";

export const CRUSH_REFUSE_COPY = "That one does not take a crush note.";
export const CRUSH_TABLE_LINE = "I will not crush it.";
export const CRUSH_SHOTS_LINE = "Twelve shots.";
export const CRUSH_ZIP_LINE = "Still a zip.";
export const CRUSH_NOTICE_TITLE =
  "I will not crush it. Twelve shots. Still a zip.";
export const CRUSH_WALK_LINE =
  "Walkers still want Beats to crush the kicks, or make them hit.";
export const CRUSH_STAYS_LINE =
  "This is the crush note. I will not crush it. Twelve shots. Still a zip.";
export const CRUSH_STILL_LINE = "Still tote. Not tune. Not a mix desk. Not norm.";
export const CRUSH_TOTE_LINE = "Add to tote still works.";
export const CRUSH_EMPTY_LINE = "Nobody taped a crush note yet.";
export const CRUSH_LEAVE_LINE = "Leave the twelve shots";

const SERVER_STORE = Symbol.for("iss.crush-listing-ids");

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

export function parseCrushListingIds(raw: string | null | undefined): string[] {
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

export function crushCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const CRUSH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CRUSH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(CRUSH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(CRUSH_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CRUSH_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseCrushListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readCrushListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(CRUSH_STORAGE_KEY);
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
          window.localStorage.setItem(CRUSH_STORAGE_KEY, JSON.stringify(ids));
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

export function writeCrushListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = crushCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CRUSH_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${CRUSH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(CRUSH_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingCrushOverlay(
  listingId: string,
  listingIds: readonly string[] = readCrushListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeCrush(listing: Listing | undefined): listing is Listing {
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

export type CrushWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

function refuseCrush(
  listing: Listing | undefined,
  listingIds: string[],
): { ok: false; reason: CrushWriteReason; listingIds: string[] } | null {
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

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingCrush(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCrush(listing, listingIds)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingCrush(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCrush(listing, listingIds)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeCrush(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CRUSH_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CRUSH_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CRUSH_CHANGED_EVENT, listener);
  };
}
