/**
 * BPM is a guess — the sample pack stays a loop, not a session. Still tote.
 *
 * Stems is twelve shots. Grade is I don't grade. Convert is no Rec.709.
 * Walkers still ask Beats for a tempo map, a 90-BPM stretch, or the
 * Ableton session. That's a guess. I will not tempo-map.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:bpm-listing-ids` is the client bpm set.
 * Cookie `iss-bpm-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write stems, grade, convert, foundry, folder, stick, scan,
 * skip, stack, pile, remote, listing-cases, wash, plays, press, film,
 * look, ask, hands, van, firm, packed, sold, file-gone, gift, buy,
 * digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a CD-R is not a loop.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const BPM_STORAGE_KEY = "iss:bpm-listing-ids";
export const BPM_COOKIE_NAME = "iss-bpm-listing-ids";
export const BPM_CHANGED_EVENT = "iss:bpm-changed";

export const BPM_REFUSE_COPY = "That one does not take a tempo map.";
export const BPM_TABLE_LINE = "BPM is a guess.";
export const BPM_MAP_LINE = "I will not tempo-map.";
export const BPM_NOTICE_TITLE = "BPM is a guess. I will not tempo-map.";
export const BPM_STEMS_LINE = "Stems is twelve shots. Grade is I don't grade.";
export const BPM_CONVERT_LINE =
  "Convert is no Rec.709. Walkers still ask Beats for a tempo map.";
export const BPM_STILL_LINE = "Still tote. Not stems. Not convert.";
export const BPM_TOTE_LINE = "Add to tote still works.";
export const BPM_EMPTY_LINE = "Nobody taped the BPM yet.";

const SERVER_STORE = Symbol.for("iss.bpm-listing-ids");

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

export function parseBpmListingIds(raw: string | null | undefined): string[] {
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

export function bpmCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BPM_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BPM_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BPM_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BPM_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BPM_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBpmListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBpmListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BPM_STORAGE_KEY);
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
          window.localStorage.setItem(BPM_STORAGE_KEY, JSON.stringify(ids));
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

export function writeBpmListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = bpmCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BPM_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BPM_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BPM_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBpmOverlay(
  listingId: string,
  listingIds = readBpmListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeBpm(listing: Listing | undefined): listing is Listing {
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

export type BpmWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type BpmWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: BpmWriteReason; listingIds: string[] };

function refuseBpm(
  listing: Listing | undefined,
  listingIds: string[],
): BpmWriteResult | null {
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

export function markListingBpm(
  listing: Listing | undefined,
  listingIds: string[],
): BpmWriteResult {
  const refused = refuseBpm(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingBpm(
  listing: Listing | undefined,
  listingIds: string[],
): BpmWriteResult {
  const refused = refuseBpm(listing, listingIds);
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

export function subscribeBpm(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BPM_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BPM_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BPM_CHANGED_EVENT, listener);
  };
}
