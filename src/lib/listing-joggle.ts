/**
 * I will not joggle it — the whisk stays bent and metal. Still tote.
 *
 * Quench is dunk-the-wires. Planish is hammer-smooth. Braze is
 * join-the-splay. Upset is thicken-the-ends. Walkers still want Sink
 * Drawer to joggle it, or “offset the tines so the balloon nests
 * without a shop quench.” I will not joggle it. Still bent. Still
 * metal. Still for sale. Not quench. Not planish. Not a shop. Not
 * braze. Not upset.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:joggle-listing-ids` is the client joggle set.
 * Cookie `iss-joggle-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write quench, planish, braze, upset, truss, peen, anneal,
 * step, kink, setover, gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-bent-whisk` only. Mug, lid, recipes, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const JOGGLE_STORAGE_KEY = "iss:joggle-listing-ids";
export const JOGGLE_COOKIE_NAME = "iss-joggle-listing-ids";
export const JOGGLE_CHANGED_EVENT = "iss:joggle-changed";

export const JOGGLE_HOST_ID = "kdr-bent-whisk";
export const JOGGLE_MUG_ID = "kdr-chipped-mug";
export const JOGGLE_LID_ID = "kdr-lid-no-pot";
export const JOGGLE_RECIPES_ID = "dl-drawer-recipes";
export const JOGGLE_ZINE_ID = "dl-stain-zine";
export const JOGGLE_CHAIR_ID = "ysk-folding-chair";
export const JOGGLE_GIFT_ID = "dl-mall-gift-card";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const JOGGLE_OWNED_IDS = [
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
  "dl-crate-side-a",
] as const;

export const JOGGLE_REFUSE_COPY = "That one does not take a joggle note.";
export const JOGGLE_TABLE_LINE = "I will not joggle it.";
export const JOGGLE_BENT_LINE = "Still bent.";
export const JOGGLE_METAL_LINE = "Still metal.";
export const JOGGLE_NOTICE_TITLE =
  "I will not joggle it. Still bent. Still metal.";
export const JOGGLE_WALK_LINE =
  "Walkers still want Sink Drawer to joggle it, or offset the tines so the balloon nests without a shop quench.";
export const JOGGLE_STAYS_LINE =
  "This is the joggle note. I will not joggle it. Still bent. Still metal.";
export const JOGGLE_STILL_LINE =
  "Still tote. Not quench. Not planish. Not a shop. Not braze. Not upset.";
export const JOGGLE_TOTE_LINE = "Add to tote still works.";
export const JOGGLE_EMPTY_LINE = "Nobody taped a joggle note yet.";
export const JOGGLE_LEAVE_LINE = "Leave the tines";

const SERVER_STORE = Symbol.for("iss.joggle-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(JOGGLE_OWNED_IDS);

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

export function parseJoggleListingIds(
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

export function joggleCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const JOGGLE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${JOGGLE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(JOGGLE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(JOGGLE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${JOGGLE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseJoggleListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readJoggleListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(JOGGLE_STORAGE_KEY);
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
          window.localStorage.setItem(JOGGLE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeJoggleListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = joggleCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(JOGGLE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${JOGGLE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(JOGGLE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingJoggleOverlay(
  listingId: string,
  listingIds: readonly string[] = readJoggleListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMugListing(listing: Listing) {
  return listing.id === JOGGLE_MUG_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === JOGGLE_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === JOGGLE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host whisk only. Mug, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeJoggle(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== JOGGLE_HOST_ID) {
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

export type JoggleWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mug"
  | "lid"
  | "chair"
  | "owned";

function refuseJoggle(
  listing: Listing | undefined,
): JoggleWriteReason | null {
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
  if (isChairListing(listing)) {
    return "chair";
  }
  if (!isPhysicalListing(listing)) {
    return "digital";
  }
  if (isMugListing(listing)) {
    return "mug";
  }
  if (isLidListing(listing)) {
    return "lid";
  }
  if (isOwnedListing(listing) || listing.id !== JOGGLE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingJoggle(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseJoggle(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingJoggle(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseJoggle(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeJoggle(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === JOGGLE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(JOGGLE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(JOGGLE_CHANGED_EVENT, listener);
  };
}
