/**
 * I will not bush it — the lamp stays wobbly and it still lights.
 * Still tote.
 *
 * Twist owns the neck. Rivet is pin-the-shade. Grommet is shade-hole.
 * Harp is the stall finial. Collar is the shade-ring. Shim is sit-flat.
 * Socket is the receptacle. Felt is padfoot. Kit is assemble.
 * Walkers still want Tuesday to bush the neck, or “sleeve the pipe
 * so it stops wobbling.” I will not bush it. Still wobbly. Still
 * lights. Still for sale. Not shim. Not rivet. Not a shop. Not socket.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:bush-listing-ids` is the client bush set.
 * Cookie `iss-bush-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write twist, rivet, grommet, collar, shim, socket, felt,
 * box, harp, kit, brush, gift, buy, digital eligibility, or tote keys.
 * Host is `ysk-wobbly-lamp` only. Chair, junk PDF, lid, gift, zine,
 * and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const BUSH_STORAGE_KEY = "iss:bush-listing-ids";
export const BUSH_COOKIE_NAME = "iss-bush-listing-ids";
export const BUSH_CHANGED_EVENT = "iss:bush-changed";

export const BUSH_HOST_ID = "ysk-wobbly-lamp";
export const BUSH_CHAIR_ID = "ysk-folding-chair";
export const BUSH_LID_ID = "kdr-lid-no-pot";
export const BUSH_JUNK_ID = "dl-junk-pricing-pdf";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const BUSH_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "mdb-scratched-lp",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "dl-drawer-recipes",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
] as const;

export const BUSH_REFUSE_COPY = "That one does not take a bush note.";
export const BUSH_TABLE_LINE = "I will not bush it.";
export const BUSH_WOBBLE_LINE = "Still wobbly.";
export const BUSH_LIGHTS_LINE = "Still lights.";
export const BUSH_NOTICE_TITLE =
  "I will not bush it. Still wobbly. Still lights.";
export const BUSH_WALK_LINE =
  "Walkers still want Tuesday to bush the neck, or sleeve the pipe so it stops wobbling.";
export const BUSH_STAYS_LINE =
  "This is the bush note. I will not bush it. Still wobbly. Still lights.";
export const BUSH_STILL_LINE =
  "Still tote. Not shim. Not rivet. Not a shop. Not socket.";
export const BUSH_TOTE_LINE = "Add to tote still works.";
export const BUSH_EMPTY_LINE = "Nobody taped a bush note yet.";
export const BUSH_LEAVE_LINE = "Leave the wobble";

const SERVER_STORE = Symbol.for("iss.bush-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(BUSH_OWNED_IDS);

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

export function parseBushListingIds(
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

export function bushCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BUSH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BUSH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BUSH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BUSH_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BUSH_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBushListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBushListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BUSH_STORAGE_KEY);
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
          window.localStorage.setItem(BUSH_STORAGE_KEY, JSON.stringify(ids));
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

export function writeBushListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = bushCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BUSH_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BUSH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BUSH_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBushOverlay(
  listingId: string,
  listingIds: readonly string[] = readBushListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isChairListing(listing: Listing) {
  return listing.id === BUSH_CHAIR_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === BUSH_LID_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host lamp only. Chair, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeBush(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== BUSH_HOST_ID) {
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

export type BushWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "chair"
  | "lid"
  | "owned";

function refuseBush(
  listing: Listing | undefined,
): BushWriteReason | null {
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
  if (isLidListing(listing)) {
    return "lid";
  }
  if (isOwnedListing(listing) || listing.id !== BUSH_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingBush(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBush(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingBush(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBush(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeBush(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BUSH_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BUSH_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BUSH_CHANGED_EVENT, listener);
  };
}
