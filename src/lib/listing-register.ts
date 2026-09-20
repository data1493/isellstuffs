/**
 * I will not register it — the recipe scans stay three cards. Still tote.
 *
 * Proof is rise. Scale is rewrite-the-ratios. Cards is typed-cookbook.
 * Vibe is measurements. Bleed is copy-shop trim. Preflight is
 * print-ready. Walkers still want Sink Drawer to register it, or
 * “add bars so the copy-shop lines up the grease.” I will not
 * register it. Still three cards. Still vibes. Still for sale.
 * Not proof. Not scale. Not a shop. Not bleed. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:register-listing-ids` is the client register set.
 * Cookie `iss-register-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write proof, scale, vibe, cards, bleed, preflight, consult,
 * typeset, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-drawer-recipes` only. Junk PDF, font, lid, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Register is print fit-up, not a login. No auth.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const REGISTER_STORAGE_KEY = "iss:register-listing-ids";
export const REGISTER_COOKIE_NAME = "iss-register-listing-ids";
export const REGISTER_CHANGED_EVENT = "iss:register-changed";

export const REGISTER_HOST_ID = "dl-drawer-recipes";
export const REGISTER_PDF_ID = "dl-junk-pricing-pdf";
export const REGISTER_FONT_ID = "dl-booth-font";
export const REGISTER_LID_ID = "kdr-lid-no-pot";
export const REGISTER_GIFT_ID = "dl-mall-gift-card";
export const REGISTER_ZINE_ID = "dl-stain-zine";
export const REGISTER_CHAIR_ID = "ysk-folding-chair";
export const REGISTER_JACKET_ID = "clo-windbreaker";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const REGISTER_OWNED_IDS = [
  REGISTER_PDF_ID,
  REGISTER_FONT_ID,
  REGISTER_LID_ID,
  "dl-crate-side-a",
  "dl-sample-pack",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "kdr-chipped-mug",
  "kdr-bent-whisk",
] as const;

const ownedSet = new Set<string>(REGISTER_OWNED_IDS);

export const REGISTER_REFUSE_COPY = "That one does not take a register note.";
export const REGISTER_TABLE_LINE = "I will not register it.";
export const REGISTER_CARDS_LINE = "Still three cards.";
export const REGISTER_VIBE_LINE = "Still vibes.";
export const REGISTER_NOTICE_TITLE =
  "I will not register it. Still three cards. Still vibes.";
export const REGISTER_WALK_LINE =
  "Walkers still want Sink Drawer to register it, or add bars so the copy-shop lines up the grease.";
export const REGISTER_STAYS_LINE =
  "This is the register note. I will not register it. Still three cards. Still vibes.";
export const REGISTER_STILL_LINE =
  "Still tote. Not proof. Not scale. Not a shop. Not bleed. Not an account.";
export const REGISTER_TOTE_LINE = "Add to tote still works.";
export const REGISTER_EMPTY_LINE = "Nobody taped a register note yet.";
export const REGISTER_LEAVE_LINE = "Leave the scan";

const SERVER_STORE = Symbol.for("iss.register-listing-ids");

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

export function parseRegisterListingIds(
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

export function registerCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const REGISTER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${REGISTER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(REGISTER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(REGISTER_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${REGISTER_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseRegisterListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readRegisterListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(REGISTER_STORAGE_KEY);
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
          window.localStorage.setItem(REGISTER_STORAGE_KEY, JSON.stringify(ids));
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

export function writeRegisterListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = registerCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(REGISTER_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${REGISTER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(REGISTER_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingRegisterOverlay(
  listingId: string,
  listingIds: readonly string[] = readRegisterListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPdfListing(listing: Listing) {
  return listing.id === REGISTER_PDF_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === REGISTER_FONT_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === REGISTER_LID_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host recipes only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeRegister(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== REGISTER_HOST_ID) {
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

export type RegisterWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pdf"
  | "font"
  | "lid"
  | "owned";

function refuseRegister(
  listing: Listing | undefined,
): RegisterWriteReason | null {
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
  if (!isDigitalListing(listing)) {
    return isLidListing(listing) ? "lid" : "physical";
  }
  if (isPdfListing(listing)) {
    return "pdf";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (isOwnedListing(listing) || listing.id !== REGISTER_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingRegister(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseRegister(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingRegister(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseRegister(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeRegister(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === REGISTER_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(REGISTER_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(REGISTER_CHANGED_EVENT, listener);
  };
}
