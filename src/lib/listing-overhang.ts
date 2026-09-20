/**
 * I will not overhang it — the unnamed LP still skips. Still unnamed.
 *
 * Vacuum is clean-the-groove. Azimuth is twist-the-headshell. Lathe
 * is resurface-the-disc. Hone is stone-the-stylus. Walkers still want
 * Crate to overhang it, or “set Baerwald so the unnamed LP tracks
 * like a shop cut without a shop vacuum.” I will not overhang it.
 * Still a skip. Still unnamed. Still for sale. Not vacuum. Not
 * azimuth. Not a shop. Not lathe.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:overhang-listing-ids` is the client overhang set.
 * Cookie `iss-overhang-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write vacuum, azimuth, lathe, hone, antistat, bias, ion,
 * baerwald, stevenson, gift, buy, digital eligibility, or tote keys.
 * Host is `mdb-scratched-lp` only. Mixtape, jewels, liner, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const OVERHANG_STORAGE_KEY = "iss:overhang-listing-ids";
export const OVERHANG_COOKIE_NAME = "iss-overhang-listing-ids";
export const OVERHANG_CHANGED_EVENT = "iss:overhang-changed";

export const OVERHANG_HOST_ID = "mdb-scratched-lp";
export const OVERHANG_MIXTAPE_ID = "mdb-mixtape-93";
export const OVERHANG_JEWELS_ID = "mdb-jewel-stack";
export const OVERHANG_LINER_ID = "dl-crate-side-a";
export const OVERHANG_CHAIR_ID = "ysk-folding-chair";
export const OVERHANG_GIFT_ID = "dl-mall-gift-card";
export const OVERHANG_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const OVERHANG_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "dl-booth-font",
  "kdr-chipped-mug",
  "kdr-bent-whisk",
  "kdr-lid-no-pot",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-drawer-recipes",
  "dl-camera-luts",
] as const;

const ownedSet = new Set<string>(OVERHANG_OWNED_IDS);

export const OVERHANG_REFUSE_COPY = "That one does not take an overhang note.";
export const OVERHANG_TABLE_LINE = "I will not overhang it.";
export const OVERHANG_SKIP_LINE = "Still a skip.";
export const OVERHANG_UNNAMED_LINE = "Still unnamed.";
export const OVERHANG_NOTICE_TITLE =
  "I will not overhang it. Still a skip. Still unnamed.";
export const OVERHANG_WALK_LINE =
  "Walkers still want Crate to overhang it, or set Baerwald so the unnamed LP tracks like a shop cut without a shop vacuum.";
export const OVERHANG_STAYS_LINE =
  "This is the overhang note. I will not overhang it. Still a skip. Still unnamed.";
export const OVERHANG_STILL_LINE =
  "Still tote. Not vacuum. Not azimuth. Not a shop. Not lathe.";
export const OVERHANG_TOTE_LINE = "Add to tote still works.";
export const OVERHANG_EMPTY_LINE = "Nobody taped an overhang note yet.";
export const OVERHANG_LEAVE_LINE = "Leave the skip";

const SERVER_STORE = Symbol.for("iss.overhang-listing-ids");

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

export function parseOverhangListingIds(
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

export function overhangCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const OVERHANG_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${OVERHANG_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(OVERHANG_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(OVERHANG_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${OVERHANG_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseOverhangListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readOverhangListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(OVERHANG_STORAGE_KEY);
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
          window.localStorage.setItem(OVERHANG_STORAGE_KEY, JSON.stringify(ids));
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

export function writeOverhangListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = overhangCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(OVERHANG_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${OVERHANG_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(OVERHANG_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingOverhangOverlay(
  listingId: string,
  listingIds: readonly string[] = readOverhangListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === OVERHANG_MIXTAPE_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === OVERHANG_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === OVERHANG_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LP only. Mixtape, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeOverhang(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== OVERHANG_HOST_ID) {
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

export type OverhangWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

function refuseOverhang(
  listing: Listing | undefined,
): OverhangWriteReason | null {
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
  if (isMixtapeListing(listing)) {
    return "mixtape";
  }
  if (isJewelsListing(listing)) {
    return "jewels";
  }
  if (isOwnedListing(listing) || listing.id !== OVERHANG_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingOverhang(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseOverhang(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingOverhang(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseOverhang(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeOverhang(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === OVERHANG_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(OVERHANG_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(OVERHANG_CHANGED_EVENT, listener);
  };
}
