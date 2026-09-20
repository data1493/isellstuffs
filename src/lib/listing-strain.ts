/**
 * I will not strain them — the drawer stays mystery USB. Still tote.
 *
 * Loom is sleeve-the-tangle. Braid is plait-the-tangle. Coil is the pile.
 * Tin is the ends. Jumper is bridge-the-break. Serve is wrap-the-ends.
 * Walkers still want Half-Working to strain them, or “boot the honest
 * ends so the forgotten charger holds without a shop jumper.”
 * I will not strain them. Still mystery USB. Still a forgotten charger.
 * Still for sale. Not loom. Not braid. Not jumper. Not a shop.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:strain-listing-ids` is the client strain set.
 * Cookie `iss-strain-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write loom, braid, jumper, serve, coil, crimp, tin, gift, buy,
 * digital eligibility, or tote keys.
 * Host is `gtk-cable-drawer` only. Game Boy, CD-R, LUT, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const STRAIN_STORAGE_KEY = "iss:strain-listing-ids";
export const STRAIN_COOKIE_NAME = "iss-strain-listing-ids";
export const STRAIN_CHANGED_EVENT = "iss:strain-changed";

export const STRAIN_HOST_ID = "gtk-cable-drawer";
export const STRAIN_BOY_ID = "gtk-game-boy";
export const STRAIN_CDR_ID = "ysk-burned-cdr";
export const STRAIN_LUT_ID = "dl-camera-luts";
export const STRAIN_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const STRAIN_OWNED_IDS = [
  STRAIN_BOY_ID,
  STRAIN_CDR_ID,
  STRAIN_LUT_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "mdb-scratched-lp",
  "dl-booth-font",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-drawer-recipes",
  "dl-crate-side-a",
] as const;

const ownedSet = new Set<string>(STRAIN_OWNED_IDS);

export const STRAIN_REFUSE_COPY = "That one does not take a strain note.";
export const STRAIN_TABLE_LINE = "I will not strain them.";
export const STRAIN_USB_LINE = "Still mystery USB.";
export const STRAIN_CHARGER_LINE = "Still a forgotten charger.";
export const STRAIN_NOTICE_TITLE =
  "I will not strain them. Still mystery USB. Still a forgotten charger.";
export const STRAIN_WALK_LINE =
  "Walkers still want Half-Working to strain them, or boot the honest ends so the forgotten charger holds without a shop jumper.";
export const STRAIN_STAYS_LINE =
  "This is the strain note. I will not strain them. Still mystery USB. Still a forgotten charger.";
export const STRAIN_STILL_LINE =
  "Still tote. Not loom. Not braid. Not jumper.";
export const STRAIN_TOTE_LINE = "Add to tote still works.";
export const STRAIN_EMPTY_LINE = "Nobody taped a strain note yet.";
export const STRAIN_LEAVE_LINE = "Leave the ends";

const SERVER_STORE = Symbol.for("iss.strain-listing-ids");

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

export function parseStrainListingIds(
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

export function strainCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const STRAIN_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${STRAIN_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(STRAIN_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(STRAIN_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${STRAIN_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseStrainListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readStrainListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(STRAIN_STORAGE_KEY);
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
          window.localStorage.setItem(STRAIN_STORAGE_KEY, JSON.stringify(ids));
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

export function writeStrainListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = strainCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STRAIN_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${STRAIN_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(STRAIN_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingStrainOverlay(
  listingId: string,
  listingIds: readonly string[] = readStrainListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isBoyListing(listing: Listing) {
  return listing.id === STRAIN_BOY_ID;
}

function isCdrListing(listing: Listing) {
  return listing.id === STRAIN_CDR_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === STRAIN_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host drawer only. Game Boy, CD-R, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeStrain(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== STRAIN_HOST_ID) {
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

export type StrainWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "boy"
  | "cdr"
  | "chair"
  | "owned";

function refuseStrain(
  listing: Listing | undefined,
): StrainWriteReason | null {
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
  if (isBoyListing(listing)) {
    return "boy";
  }
  if (isCdrListing(listing)) {
    return "cdr";
  }
  if (isOwnedListing(listing) || listing.id !== STRAIN_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingStrain(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseStrain(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingStrain(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseStrain(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeStrain(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === STRAIN_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(STRAIN_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STRAIN_CHANGED_EVENT, listener);
  };
}
