/**
 * I will not gate it — twelve shots stay twelve shots. Still a loop.
 * Still tote.
 *
 * Stems is twelve shots. Tune is no pitch. Loop is no slice. Walkers
 * still want Beats to gate the tails, or “make the shots tight.”
 * I will not gate it. Still twelve shots. Still a loop. Still for sale.
 * Not stems. Not tune. Not a loop desk.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:gate-listing-ids` is the client gate set.
 * Cookie `iss-gate-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write stems, tune, loop, crush, bounce, norm, rights, bpm,
 * burn, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-sample-pack` only. Font, LUT, gift, zine, physical,
 * and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const GATE_STORAGE_KEY = "iss:gate-listing-ids";
export const GATE_COOKIE_NAME = "iss-gate-listing-ids";
export const GATE_CHANGED_EVENT = "iss:gate-changed";

export const GATE_HOST_ID = "dl-sample-pack";
export const GATE_FONT_ID = "dl-booth-font";
export const GATE_LUT_ID = "dl-camera-luts";
export const GATE_ZINE_ID = "dl-stain-zine";
export const GATE_LAMP_ID = "ysk-wobbly-lamp";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const GATE_OWNED_IDS = [
  GATE_FONT_ID,
  GATE_LUT_ID,
  GATE_ZINE_ID,
  GATE_LAMP_ID,
  "dl-junk-pricing-pdf",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "ysk-burned-cdr",
  "kdr-bent-whisk",
] as const;

const ownedSet = new Set<string>(GATE_OWNED_IDS);

export const GATE_REFUSE_COPY = "That one does not take a gate note.";
export const GATE_TABLE_LINE = "I will not gate it.";
export const GATE_SHOTS_LINE = "Still twelve shots.";
export const GATE_LOOP_LINE = "Still a loop.";
export const GATE_NOTICE_TITLE =
  "I will not gate it. Still twelve shots. Still a loop.";
export const GATE_WALK_LINE =
  "Walkers still want Beats to gate the shots, or make the tails disappear.";
export const GATE_STAYS_LINE =
  "This is the gate note. I will not gate it. Still twelve shots. Still a loop.";
export const GATE_STILL_LINE =
  "Still tote. Not stems. Not tune. Not a loop desk.";
export const GATE_TOTE_LINE = "Add to tote still works.";
export const GATE_EMPTY_LINE = "Nobody taped a gate note yet.";
export const GATE_LEAVE_LINE = "Leave the shots";

const SERVER_STORE = Symbol.for("iss.gate-listing-ids");

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

export function parseGateListingIds(
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

export function gateCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GATE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GATE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GATE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GATE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GATE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGateListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGateListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GATE_STORAGE_KEY);
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
          window.localStorage.setItem(GATE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGateListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = gateCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GATE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GATE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GATE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGateOverlay(
  listingId: string,
  listingIds: readonly string[] = readGateListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isFontListing(listing: Listing) {
  return listing.id === GATE_FONT_ID;
}

function isLutListing(listing: Listing) {
  return listing.id === GATE_LUT_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host sample pack only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeGate(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== GATE_HOST_ID) {
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

export type GateWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "font"
  | "lut"
  | "zine"
  | "owned";

function refuseGate(
  listing: Listing | undefined,
): GateWriteReason | null {
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
    return "physical";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (isLutListing(listing)) {
    return "lut";
  }
  if (listing.id === GATE_ZINE_ID) {
    return "zine";
  }
  if (isOwnedListing(listing) || listing.id !== GATE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingGate(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGate(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingGate(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGate(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeGate(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GATE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GATE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GATE_CHANGED_EVENT, listener);
  };
}
