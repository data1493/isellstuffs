/**
 * I will not torque it — SUMMER 93 stays a radio edit. Still hiss.
 *
 * Flutter is wow-the-transport. Bias is set-the-record. Pinch is
 * pinch-roller. Azimuth is head-align. Walkers still want Sunday
 * Crate to torque it, or “set capstan torque so SUMMER 93 sits
 * without a shop flutter.” I will not torque it. Still hiss. Still
 * a radio edit. Still for sale. Not flutter. Not bias. Not a shop.
 * Not pinch.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:torque-listing-ids` is the client torque set.
 * Cookie `iss-torque-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write flutter, bias, pinch, azimuth, dolby, erase, wow,
 * speed, capstan, gift, buy, digital eligibility, or tote keys.
 * Host is `mdb-mixtape-93` only. LP, jewels, liner PDF, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const TORQUE_STORAGE_KEY = "iss:torque-listing-ids";
export const TORQUE_COOKIE_NAME = "iss-torque-listing-ids";
export const TORQUE_CHANGED_EVENT = "iss:torque-changed";

export const TORQUE_HOST_ID = "mdb-mixtape-93";
export const TORQUE_LP_ID = "mdb-scratched-lp";
export const TORQUE_JEWELS_ID = "mdb-jewel-stack";
export const TORQUE_LINER_ID = "dl-crate-side-a";
export const TORQUE_CHAIR_ID = "ysk-folding-chair";
export const TORQUE_GIFT_ID = "dl-mall-gift-card";
export const TORQUE_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const TORQUE_OWNED_IDS = [
  TORQUE_LP_ID,
  TORQUE_JEWELS_ID,
  "ysk-burned-cdr",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-wobbly-lamp",
  "kdr-chipped-mug",
  "kdr-bent-whisk",
  "kdr-lid-no-pot",
  "dl-booth-font",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-camera-luts",
  "dl-drawer-recipes",
] as const;

const ownedSet = new Set<string>(TORQUE_OWNED_IDS);

export const TORQUE_REFUSE_COPY = "That one does not take a torque note.";
export const TORQUE_TABLE_LINE = "I will not torque it.";
export const TORQUE_HISS_LINE = "Still hiss.";
export const TORQUE_RADIO_LINE = "Still a radio edit.";
export const TORQUE_NOTICE_TITLE =
  "I will not torque it. Still hiss. Still a radio edit.";
export const TORQUE_WALK_LINE =
  "Walkers still want Crate to torque it, or set capstan torque so SUMMER 93 sits without a shop flutter.";
export const TORQUE_STAYS_LINE =
  "This is the torque note. I will not torque it. Still hiss. Still a radio edit.";
export const TORQUE_STILL_LINE =
  "Still tote. Not flutter. Not bias. Not a shop. Not pinch.";
export const TORQUE_TOTE_LINE = "Add to tote still works.";
export const TORQUE_EMPTY_LINE = "Nobody taped a torque note yet.";
export const TORQUE_LEAVE_LINE = "Leave the hiss";

const SERVER_STORE = Symbol.for("iss.torque-listing-ids");

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

export function parseTorqueListingIds(
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

export function torqueCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const TORQUE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${TORQUE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(TORQUE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(TORQUE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${TORQUE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseTorqueListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readTorqueListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(TORQUE_STORAGE_KEY);
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
          window.localStorage.setItem(TORQUE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeTorqueListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = torqueCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(TORQUE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${TORQUE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(TORQUE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingTorqueOverlay(
  listingId: string,
  listingIds: readonly string[] = readTorqueListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLpListing(listing: Listing) {
  return listing.id === TORQUE_LP_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === TORQUE_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === TORQUE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host mixtape only. LP, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeTorque(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== TORQUE_HOST_ID) {
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

export type TorqueWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lp"
  | "jewels"
  | "chair"
  | "owned";

function refuseTorque(
  listing: Listing | undefined,
): TorqueWriteReason | null {
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
  if (isLpListing(listing)) {
    return "lp";
  }
  if (isJewelsListing(listing)) {
    return "jewels";
  }
  if (isOwnedListing(listing) || listing.id !== TORQUE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingTorque(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTorque(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingTorque(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTorque(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeTorque(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === TORQUE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(TORQUE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TORQUE_CHANGED_EVENT, listener);
  };
}
