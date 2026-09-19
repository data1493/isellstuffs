/**
 * I will not VG it — vinyl Goldmine refusal. Still tote.
 *
 * Skip is the chorus. Dust is the wipe. Sleeve is the grocery bag.
 * Press is the reissue. Grade is a custom LUT, not vinyl.
 * Walkers still want Sunday Crate to Goldmine the scratched LP.
 * I will not VG it. Plays. Skips the chorus. Still for sale.
 * Not skip. Not a Goldmine desk. Not press.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:vg-listing-ids` is the client vg set.
 * Cookie `iss-vg-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write skip, dust, sleeve, press, grade, name, remember, rip,
 * gold, goldmine, rate, media, scratch, film, look, ask, hands, van,
 * firm, packed, sold, file-gone, gift, buy, digital eligibility, or
 * tote keys.
 * Gift listings and digital files are refused — a liner PDF is not a VG.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const VG_STORAGE_KEY = "iss:vg-listing-ids";
export const VG_COOKIE_NAME = "iss-vg-listing-ids";
export const VG_CHANGED_EVENT = "iss:vg-changed";

export const VG_REFUSE_COPY = "That one is not a VG.";
export const VG_TABLE_LINE = "I will not VG it.";
export const VG_NOTICE_TITLE = "I will not VG it. Plays. Skips the chorus.";
export const VG_PLAYS_LINE = "Plays.";
export const VG_SKIP_LINE = "Skips the chorus.";
export const VG_PRESS_LINE = "Press is the reissue.";
export const VG_DUST_LINE = "Dust is the wipe.";
export const VG_SLEEVE_LINE = "Sleeve is the grocery bag.";
export const VG_GRADE_LINE = "Grade is a custom LUT, not vinyl.";
export const VG_STILL_LINE = "Still tote. Not skip. Not a Goldmine desk. Not press.";
export const VG_TOTE_LINE = "Add to tote still works.";
export const VG_EMPTY_LINE = "Nobody taped the VG yet.";

const SERVER_STORE = Symbol.for("iss.vg-listing-ids");

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

export function parseVgListingIds(raw: string | null | undefined): string[] {
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

export function vgCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const VG_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${VG_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(VG_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(VG_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${VG_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseVgListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readVgListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(VG_STORAGE_KEY);
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
          window.localStorage.setItem(VG_STORAGE_KEY, JSON.stringify(ids));
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

export function writeVgListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = vgCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(VG_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${VG_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(VG_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingVgOverlay(
  listingId: string,
  listingIds = readVgListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeVg(listing: Listing | undefined): listing is Listing {
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

export type VgWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type VgWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: VgWriteReason; listingIds: string[] };

function refuseVg(
  listing: Listing | undefined,
  listingIds: string[],
): VgWriteResult | null {
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

export function markListingVg(
  listing: Listing | undefined,
  listingIds: string[],
): VgWriteResult {
  const refused = refuseVg(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingVg(
  listing: Listing | undefined,
  listingIds: string[],
): VgWriteResult {
  const refused = refuseVg(listing, listingIds);
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

export function subscribeVg(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === VG_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(VG_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(VG_CHANGED_EVENT, listener);
  };
}
