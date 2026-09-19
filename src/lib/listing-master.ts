/**
 * I don't have the master — this burn. Still spins. Still tote.
 *
 * Tray is this jewel. Polish is no Brasso. Ink is the Sharpie.
 * Zip is no leftover zip. Burn is no burn shop. Session / studio
 * were killed. Walkers still want Beats to hand the session folder,
 * or “give me the clean master.” I don't have the master. This
 * burn. Still spins. Not zip. Not a studio. Not tray.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:master-listing-ids` is the client master set.
 * Cookie `iss-master-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write tray, polish, ink, zip, plays, burn, wifi, or norm.
 * Gift listings and digital files are refused — a sample-pack zip
 * is not a master. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const MASTER_STORAGE_KEY = "iss:master-listing-ids";
export const MASTER_COOKIE_NAME = "iss-master-listing-ids";
export const MASTER_CHANGED_EVENT = "iss:master-changed";

export const MASTER_REFUSE_COPY = "That one does not take a master note.";
export const MASTER_TABLE_LINE = "I don't have the master.";
export const MASTER_BURN_LINE = "This burn. Still spins.";
export const MASTER_NOTICE_TITLE =
  "I don't have the master. This burn. Still spins.";
export const MASTER_WALK_LINE =
  "Walkers still want Beats to hand the session folder, or give me the clean master.";
export const MASTER_STAYS_LINE =
  "This is the master note. This burn. Still spins.";
export const MASTER_STILL_LINE =
  "Still tote. Still spins. Still for sale. Not zip. Not a studio. Not tray.";
export const MASTER_TOTE_LINE = "Add to tote still works.";
export const MASTER_EMPTY_LINE = "Nobody taped a master note yet.";

const SERVER_STORE = Symbol.for("iss.master-listing-ids");

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

export function parseMasterListingIds(raw: string | null | undefined): string[] {
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

export function masterCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const MASTER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${MASTER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(MASTER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(MASTER_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${MASTER_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseMasterListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readMasterListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(MASTER_STORAGE_KEY);
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
          window.localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(ids));
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

export function writeMasterListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = masterCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(MASTER_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${MASTER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(MASTER_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingMasterOverlay(
  listingId: string,
  listingIds: readonly string[] = readMasterListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeMaster(listing: Listing | undefined): listing is Listing {
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

export type MasterWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type MasterWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: MasterWriteReason; listingIds: string[] };

function refuseMaster(
  listing: Listing | undefined,
  listingIds: string[],
): MasterWriteResult | null {
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

export function markListingMaster(
  listing: Listing | undefined,
  listingIds: string[],
): MasterWriteResult {
  const refused = refuseMaster(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingMaster(
  listing: Listing | undefined,
  listingIds: string[],
): MasterWriteResult {
  const refused = refuseMaster(listing, listingIds);
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

export function subscribeMaster(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === MASTER_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(MASTER_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(MASTER_CHANGED_EVENT, listener);
  };
}
