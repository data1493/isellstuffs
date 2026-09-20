/**
 * I will not resonance it — the unnamed LP still skips. Still unnamed.
 *
 * Pivot is seat-the-pivot (on main). Dashpot is fill-the-damper
 * (on main). Gimbal is set-the-bearings (on main). Antiskate is
 * set-the-pull (on main). Rumble is filter-the-rumble (on main).
 * Vta is set-the-arm-height (on main). Riaa is drop-the-curve
 * (on main). Vacuum is clean-the-groove (on main). Zenith is
 * twist-the-cartridge (on main). Overhang is set-Baerwald
 * (on main). Walkers still want Crate to resonance it, or
 * “tune shop arm resonance so the unnamed LP tracks without a
 * shop pivot.” I will not resonance it. Still a skip. Still
 * unnamed. Still for sale. Not pivot. Not dashpot. Not a shop.
 * Not vacuum. Not gimbal. Not antiskate. Not rumble. Not vta.
 * Not riaa. Not zenith. Not overhang. Not retip. Not azimuth.
 * Not nabs. Not stylus. Not cartridge. Not sra. Not loading.
 * Not stepup. Not skating. Not innergroove. Not antiweight.
 * Not counterweight. Not tonearm. Not fluid. Not silicone.
 * Not damper. Not compliance. Not offset. Not hum. Not
 * isolation. Not subsonic. Not wow. Not vtf. Not sral. Not
 * unipivot. Not yoke. Not knifeedge. Not cantilever.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:resonance-listing-ids` is the client set.
 * Cookie `iss-resonance-listing-ids` is the same JSON so PDPs SSR
 * the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write pivot, dashpot, gimbal, antiskate, rumble, vta, riaa,
 * vacuum, zenith, overhang, retip, azimuth, nabs, flutter, torque,
 * relap, bias, stylus, cartridge, sra, loading, stepup, skating,
 * innergroove, antiweight, counterweight, tonearm, fluid, silicone,
 * damper, compliance, offset, hum, isolation, subsonic, wow, vtf,
 * sral, unipivot, yoke, knifeedge, cantilever, frost, billboard,
 * hmtx, bsln, gift, buy, digital eligibility, or tote keys.
 * Host is `mdb-scratched-lp` only. Mixtape, jewels, liner, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const RESONANCE_STORAGE_KEY = "iss:resonance-listing-ids";
export const RESONANCE_COOKIE_NAME = "iss-resonance-listing-ids";
export const RESONANCE_CHANGED_EVENT = "iss:resonance-changed";

export const RESONANCE_HOST_ID = "mdb-scratched-lp";
export const RESONANCE_MIXTAPE_ID = "mdb-mixtape-93";
export const RESONANCE_JEWELS_ID = "mdb-jewel-stack";
export const RESONANCE_LINER_ID = "dl-crate-side-a";
export const RESONANCE_CHAIR_ID = "ysk-folding-chair";
export const RESONANCE_GIFT_ID = "dl-mall-gift-card";
export const RESONANCE_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const RESONANCE_OWNED_IDS = [
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

const ownedSet = new Set<string>(RESONANCE_OWNED_IDS);

export const RESONANCE_REFUSE_COPY = "That one does not take a resonance note.";
export const RESONANCE_TABLE_LINE = "I will not resonance it.";
export const RESONANCE_SKIP_LINE = "Still a skip.";
export const RESONANCE_UNNAMED_LINE = "Still unnamed.";
export const RESONANCE_NOTICE_TITLE =
  "I will not resonance it. Still a skip. Still unnamed.";
export const RESONANCE_WALK_LINE =
  "Walkers still want Crate to resonance it, or tune shop arm resonance so the unnamed LP tracks without a shop pivot.";
export const RESONANCE_STAYS_LINE =
  "This is the resonance note. I will not resonance it. Still a skip. Still unnamed.";
export const RESONANCE_STILL_LINE =
  "Still tote. Not pivot. Not dashpot. Not a shop. Not vacuum.";
export const RESONANCE_TOTE_LINE = "Add to tote still works.";
export const RESONANCE_EMPTY_LINE = "Nobody taped a resonance note yet.";
export const RESONANCE_LEAVE_LINE = "Leave the resonance";

const SERVER_STORE = Symbol.for("iss.resonance-listing-ids");

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

export function parseResonanceListingIds(
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

export function resonanceCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const RESONANCE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${RESONANCE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(RESONANCE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(RESONANCE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${RESONANCE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseResonanceListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readResonanceListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(RESONANCE_STORAGE_KEY);
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
          window.localStorage.setItem(RESONANCE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeResonanceListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = resonanceCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(RESONANCE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${RESONANCE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(RESONANCE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingResonanceOverlay(
  listingId: string,
  listingIds: readonly string[] = readResonanceListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === RESONANCE_MIXTAPE_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === RESONANCE_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === RESONANCE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LP only. Mixtape, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeResonance(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== RESONANCE_HOST_ID) {
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

export type ResonanceWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

function refuseResonance(
  listing: Listing | undefined,
): ResonanceWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== RESONANCE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingResonance(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseResonance(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingResonance(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseResonance(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeResonance(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === RESONANCE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(RESONANCE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RESONANCE_CHANGED_EVENT, listener);
  };
}
