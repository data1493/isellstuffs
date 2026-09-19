/**
 * I will not temper it — the whisk stays splayed and metal. Still tote.
 *
 * Anneal is heat-the-wires. Peen is hammer-the-collar. Tines is spare
 * wire. Bent is leave-it-bent. Rust is no chrome. Cage is queued.
 * Walkers still want Sink Drawer to temper it, or “set the spring so
 * the balloon holds.” I will not temper it. Still splayed. Still
 * metal. Still for sale. Not anneal. Not peen. Not tines.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:temper-listing-ids` is the client temper set.
 * Cookie `iss-temper-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write anneal, peen, tines, cage, bent, rust, oil, soap, gift,
 * buy, digital eligibility, or tote keys.
 * Host is `kdr-bent-whisk` only. Mug, lid, recipes, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const TEMPER_STORAGE_KEY = "iss:temper-listing-ids";
export const TEMPER_COOKIE_NAME = "iss-temper-listing-ids";
export const TEMPER_CHANGED_EVENT = "iss:temper-changed";

export const TEMPER_HOST_ID = "kdr-bent-whisk";
export const TEMPER_MUG_ID = "kdr-chipped-mug";
export const TEMPER_LID_ID = "kdr-lid-no-pot";
export const TEMPER_RECIPES_ID = "dl-drawer-recipes";
export const TEMPER_PACK_ID = "dl-sample-pack";
export const TEMPER_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const TEMPER_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "mdb-scratched-lp",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-camera-luts",
  "dl-drawer-recipes",
] as const;

export const TEMPER_REFUSE_COPY = "That one does not take a temper note.";
export const TEMPER_TABLE_LINE = "I will not temper it.";
export const TEMPER_SPLAYED_LINE = "Still splayed.";
export const TEMPER_METAL_LINE = "Still metal.";
export const TEMPER_NOTICE_TITLE =
  "I will not temper it. Still splayed. Still metal.";
export const TEMPER_WALK_LINE =
  "Walkers still want Sink Drawer to temper it, or set the spring so the balloon holds.";
export const TEMPER_STAYS_LINE =
  "This is the temper note. I will not temper it. Still splayed. Still metal.";
export const TEMPER_STILL_LINE =
  "Still tote. Not anneal. Not peen. Not a shop. Not tines.";
export const TEMPER_TOTE_LINE = "Add to tote still works.";
export const TEMPER_EMPTY_LINE = "Nobody taped a temper note yet.";
export const TEMPER_LEAVE_LINE = "Leave the splay";

const SERVER_STORE = Symbol.for("iss.temper-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(TEMPER_OWNED_IDS);

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

export function parseTemperListingIds(
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

export function temperCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const TEMPER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${TEMPER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(TEMPER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(TEMPER_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${TEMPER_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseTemperListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readTemperListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(TEMPER_STORAGE_KEY);
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
          window.localStorage.setItem(TEMPER_STORAGE_KEY, JSON.stringify(ids));
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

export function writeTemperListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = temperCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(TEMPER_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${TEMPER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(TEMPER_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingTemperOverlay(
  listingId: string,
  listingIds: readonly string[] = readTemperListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMugListing(listing: Listing) {
  return listing.id === TEMPER_MUG_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === TEMPER_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === TEMPER_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host whisk only. Mug, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeTemper(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== TEMPER_HOST_ID) {
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

export type TemperWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mug"
  | "lid"
  | "chair"
  | "owned";

function refuseTemper(
  listing: Listing | undefined,
): TemperWriteReason | null {
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
  if (isMugListing(listing)) {
    return "mug";
  }
  if (isLidListing(listing)) {
    return "lid";
  }
  if (isOwnedListing(listing) || listing.id !== TEMPER_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingTemper(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTemper(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingTemper(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTemper(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeTemper(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === TEMPER_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(TEMPER_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TEMPER_CHANGED_EVENT, listener);
  };
}
