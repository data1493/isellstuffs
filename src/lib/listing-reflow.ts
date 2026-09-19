/**
 * I will not reflow it — the Game Boy stays a line and fused. Still tote.
 *
 * Line is the screen crack. Cells walked. Recap is SRAM. Contrast is
 * the wheel. Tin is drawer copper. Walkers still want Half-Working to
 * reflow the cart, or “heat the joints so Tetris always boots.” I will
 * not reflow it. Still a line. Still fused. Still for sale. Not tin.
 * Not fix. Not a shop. Not speaker.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:reflow-listing-ids` is the client reflow set.
 * Cookie `iss-reflow-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write line, recap, contrast, dump, glue, glow, speaker,
 * membrane, tin, fix, gift, buy, digital eligibility, or tote keys.
 * Host is `gtk-game-boy` only. LUT, pack, gift, zine, drawer, lamp,
 * and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const REFLOW_STORAGE_KEY = "iss:reflow-listing-ids";
export const REFLOW_COOKIE_NAME = "iss-reflow-listing-ids";
export const REFLOW_CHANGED_EVENT = "iss:reflow-changed";

export const REFLOW_HOST_ID = "gtk-game-boy";
export const REFLOW_LUT_ID = "dl-camera-luts";
export const REFLOW_PACK_ID = "dl-sample-pack";
export const REFLOW_DRAWER_ID = "gtk-cable-drawer";
export const REFLOW_LAMP_ID = "ysk-wobbly-lamp";
export const REFLOW_ZINE_ID = "dl-stain-zine";
export const REFLOW_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const REFLOW_OWNED_IDS = [
  REFLOW_DRAWER_ID,
  REFLOW_LAMP_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "ysk-burned-cdr",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "kdr-bent-whisk",
  "dl-junk-pricing-pdf",
] as const;

export const REFLOW_REFUSE_COPY = "That one does not take a reflow note.";
export const REFLOW_TABLE_LINE = "I will not reflow it.";
export const REFLOW_LINE_LINE = "Still a line.";
export const REFLOW_FUSED_LINE = "Still fused.";
export const REFLOW_NOTICE_TITLE =
  "I will not reflow it. Still a line. Still fused.";
export const REFLOW_WALK_LINE =
  "Walkers still want Half-Working to reflow the cart, or heat the joints so Tetris always boots.";
export const REFLOW_STAYS_LINE =
  "This is the reflow note. I will not reflow it. Still a line. Still fused.";
export const REFLOW_STILL_LINE =
  "Still tote. Not tin. Not fix. Not a shop. Not speaker.";
export const REFLOW_TOTE_LINE = "Add to tote still works.";
export const REFLOW_EMPTY_LINE = "Nobody taped a reflow note yet.";
export const REFLOW_LEAVE_LINE = "Leave the joints";

const SERVER_STORE = Symbol.for("iss.reflow-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(REFLOW_OWNED_IDS);

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

export function parseReflowListingIds(
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

export function reflowCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const REFLOW_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${REFLOW_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(REFLOW_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(REFLOW_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${REFLOW_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseReflowListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readReflowListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(REFLOW_STORAGE_KEY);
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
          window.localStorage.setItem(
            REFLOW_STORAGE_KEY,
            JSON.stringify(ids),
          );
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

export function writeReflowListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = reflowCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(REFLOW_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${REFLOW_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(REFLOW_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingReflowOverlay(
  listingId: string,
  listingIds: readonly string[] = readReflowListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLutListing(listing: Listing) {
  return listing.id === REFLOW_LUT_ID;
}

function isPackListing(listing: Listing) {
  return listing.id === REFLOW_PACK_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host Game Boy only. LUT, pack, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeReflow(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== REFLOW_HOST_ID) {
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

export type ReflowWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lut"
  | "pack"
  | "owned";

function refuseReflow(
  listing: Listing | undefined,
): ReflowWriteReason | null {
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
  if (isLutListing(listing)) {
    return "lut";
  }
  if (isPackListing(listing)) {
    return "pack";
  }
  if (!isPhysicalListing(listing)) {
    return "digital";
  }
  if (isOwnedListing(listing) || listing.id !== REFLOW_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingReflow(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseReflow(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingReflow(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseReflow(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeReflow(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === REFLOW_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(REFLOW_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(REFLOW_CHANGED_EVENT, listener);
  };
}
