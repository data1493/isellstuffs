/**
 * I will not proof them — the recipe scans stay three cards. Still tote.
 *
 * Cards is typed-cookbook. Vibe is measurements. Double is yield.
 * Scale is rewrite-the-ratios. Metric is grams. Walkers still want
 * Sink Drawer to proof the scans, or “write a rise so the loaf
 * works.” I will not proof them. Still three cards. Still vibes.
 * Still for sale. Not scale. Not cards. Not a shop. Not metric.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:proof-listing-ids` is the client proof set.
 * Cookie `iss-proof-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write cards, vibe, double, mins, scale, grease, metric,
 * laminate, glaze, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-drawer-recipes` only. Junk PDF, font, lid, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const PROOF_STORAGE_KEY = "iss:proof-listing-ids";
export const PROOF_COOKIE_NAME = "iss-proof-listing-ids";
export const PROOF_CHANGED_EVENT = "iss:proof-changed";

export const PROOF_HOST_ID = "dl-drawer-recipes";
export const PROOF_PDF_ID = "dl-junk-pricing-pdf";
export const PROOF_FONT_ID = "dl-booth-font";
export const PROOF_LID_ID = "kdr-lid-no-pot";
export const PROOF_GIFT_ID = "dl-mall-gift-card";
export const PROOF_ZINE_ID = "dl-stain-zine";
export const PROOF_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const PROOF_OWNED_IDS = [
  PROOF_PDF_ID,
  PROOF_FONT_ID,
  PROOF_LID_ID,
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

const ownedSet = new Set<string>(PROOF_OWNED_IDS);

export const PROOF_REFUSE_COPY = "That one does not take a proof note.";
export const PROOF_TABLE_LINE = "I will not proof them.";
export const PROOF_CARDS_LINE = "Still three cards.";
export const PROOF_VIBE_LINE = "Still vibes.";
export const PROOF_NOTICE_TITLE =
  "I will not proof them. Still three cards. Still vibes.";
export const PROOF_WALK_LINE =
  "Walkers still want Sink Drawer to proof the scans, or write a rise so the loaf works.";
export const PROOF_STAYS_LINE =
  "This is the proof note. I will not proof them. Still three cards. Still vibes.";
export const PROOF_STILL_LINE =
  "Still tote. Not scale. Not cards. Not a shop. Not metric.";
export const PROOF_TOTE_LINE = "Add to tote still works.";
export const PROOF_EMPTY_LINE = "Nobody taped a proof note yet.";
export const PROOF_LEAVE_LINE = "Leave the vibes";

const SERVER_STORE = Symbol.for("iss.proof-listing-ids");

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

export function parseProofListingIds(
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

export function proofCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const PROOF_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PROOF_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(PROOF_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PROOF_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${PROOF_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseProofListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readProofListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(PROOF_STORAGE_KEY);
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
          window.localStorage.setItem(PROOF_STORAGE_KEY, JSON.stringify(ids));
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

export function writeProofListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = proofCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PROOF_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PROOF_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(PROOF_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingProofOverlay(
  listingId: string,
  listingIds: readonly string[] = readProofListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPdfListing(listing: Listing) {
  return listing.id === PROOF_PDF_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === PROOF_FONT_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === PROOF_LID_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host recipes only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeProof(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== PROOF_HOST_ID) {
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

export type ProofWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pdf"
  | "font"
  | "lid"
  | "owned";

function refuseProof(
  listing: Listing | undefined,
): ProofWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== PROOF_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingProof(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseProof(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingProof(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseProof(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeProof(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PROOF_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PROOF_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PROOF_CHANGED_EVENT, listener);
  };
}
