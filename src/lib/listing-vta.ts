/**
 * I will not vta it — the unnamed LP still skips. Still unnamed.
 *
 * Riaa is drop-the-curve (on main). Vacuum is clean-the-groove
 * (on main). Zenith is twist-the-cartridge (on main). Overhang
 * is set-Baerwald (on main). Retip is fit-a-nude (on main).
 * Walkers still want Crate to vta it, or “set shop VTA so the
 * unnamed LP tracks without a shop vacuum.” I will not vta it.
 * Still a skip. Still unnamed. Still for sale. Not riaa.
 * Not vacuum. Not a shop. Not overhang. Not retip. Not azimuth.
 * Not nabs. Not sral. Not vtf. Not sfa.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:vta-listing-ids` is the client vta set.
 * Cookie `iss-vta-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write riaa, vacuum, zenith, overhang, retip, azimuth, nabs,
 * flutter, torque, bias, sral, vtf, sfa, gift, buy, digital
 * eligibility, or tote keys.
 * Host is `mdb-scratched-lp` only. Mixtape, jewels, liner, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const VTA_STORAGE_KEY = "iss:vta-listing-ids";
export const VTA_COOKIE_NAME = "iss-vta-listing-ids";
export const VTA_CHANGED_EVENT = "iss:vta-changed";

export const VTA_HOST_ID = "mdb-scratched-lp";
export const VTA_MIXTAPE_ID = "mdb-mixtape-93";
export const VTA_JEWELS_ID = "mdb-jewel-stack";
export const VTA_LINER_ID = "dl-crate-side-a";
export const VTA_CHAIR_ID = "ysk-folding-chair";
export const VTA_GIFT_ID = "dl-mall-gift-card";
export const VTA_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const VTA_OWNED_IDS = [
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

const ownedSet = new Set<string>(VTA_OWNED_IDS);

export const VTA_REFUSE_COPY = "That one does not take a vta note.";
export const VTA_TABLE_LINE = "I will not vta it.";
export const VTA_SKIP_LINE = "Still a skip.";
export const VTA_UNNAMED_LINE = "Still unnamed.";
export const VTA_NOTICE_TITLE =
  "I will not vta it. Still a skip. Still unnamed.";
export const VTA_WALK_LINE =
  "Walkers still want Crate to vta it, or set shop VTA so the unnamed LP tracks without a shop vacuum.";
export const VTA_STAYS_LINE =
  "This is the vta note. I will not vta it. Still a skip. Still unnamed.";
export const VTA_STILL_LINE =
  "Still tote. Not riaa. Not vacuum. Not a shop. Not overhang.";
export const VTA_TOTE_LINE = "Add to tote still works.";
export const VTA_EMPTY_LINE = "Nobody taped a vta note yet.";
export const VTA_LEAVE_LINE = "Leave the skip";

const SERVER_STORE = Symbol.for("iss.vta-listing-ids");

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

export function parseVtaListingIds(
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

export function vtaCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const VTA_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${VTA_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(VTA_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(VTA_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${VTA_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseVtaListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readVtaListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(VTA_STORAGE_KEY);
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
          window.localStorage.setItem(VTA_STORAGE_KEY, JSON.stringify(ids));
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

export function writeVtaListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = vtaCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(VTA_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${VTA_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(VTA_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingVtaOverlay(
  listingId: string,
  listingIds: readonly string[] = readVtaListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === VTA_MIXTAPE_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === VTA_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === VTA_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LP only. Mixtape, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeVta(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== VTA_HOST_ID) {
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

export type VtaWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

function refuseVta(
  listing: Listing | undefined,
): VtaWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== VTA_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingVta(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseVta(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingVta(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseVta(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeVta(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === VTA_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(VTA_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(VTA_CHANGED_EVENT, listener);
  };
}
