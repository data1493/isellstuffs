/**
 * I will not label them — the drawer stays an unlabeled pile. Still tote.
 *
 * Pile is won’t-split. Dongle is no USB-C. Phone is the forgotten brick.
 * Beep is no continuity. Ends / tangle were killed as pile twins.
 * Walkers still want Half-Working to label the drawer, or “write HDMI
 * on the tape.” I will not label them. Still a pile. Still untested.
 * Not pile. Not a shop. Not beep.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:label-listing-ids` is the client label set.
 * Cookie `iss-label-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write pile, dongle, phone, beep, recap, glow, meter, driver,
 * tag, caption, hdmi, look, ask, hands, van, firm, packed, sold,
 * file-gone, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a LUT pack does not
 * take a cable label. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const LABEL_STORAGE_KEY = "iss:label-listing-ids";
export const LABEL_COOKIE_NAME = "iss-label-listing-ids";
export const LABEL_CHANGED_EVENT = "iss:label-changed";

export const LABEL_REFUSE_COPY = "That one does not take a label note.";
export const LABEL_TABLE_LINE = "I will not label them.";
export const LABEL_PILE_LINE = "Still a pile.";
export const LABEL_UNTESTED_LINE = "Still untested.";
export const LABEL_NOTICE_TITLE =
  "I will not label them. Still a pile. Still untested.";
export const LABEL_WALK_LINE =
  "Walkers still want Half-Working to label the drawer, or write HDMI on the tape.";
export const LABEL_STAYS_LINE =
  "This is the label note. Still a pile. Still untested.";
export const LABEL_STILL_LINE = "Still tote. Not pile. Not a shop. Not beep.";
export const LABEL_TOTE_LINE = "Add to tote still works.";
export const LABEL_EMPTY_LINE = "Nobody taped a label note yet.";

const SERVER_STORE = Symbol.for("iss.label-listing-ids");

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

export function parseLabelListingIds(raw: string | null | undefined): string[] {
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

export function labelCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const LABEL_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${LABEL_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(LABEL_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(LABEL_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${LABEL_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseLabelListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readLabelListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(LABEL_STORAGE_KEY);
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
          window.localStorage.setItem(LABEL_STORAGE_KEY, JSON.stringify(ids));
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

export function writeLabelListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = labelCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(LABEL_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${LABEL_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(LABEL_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingLabelOverlay(
  listingId: string,
  listingIds: readonly string[] = readLabelListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeLabel(listing: Listing | undefined): listing is Listing {
  if (!listing) {
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

export type LabelWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type LabelWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: LabelWriteReason; listingIds: string[] };

function refuseLabel(
  listing: Listing | undefined,
  listingIds: string[],
): LabelWriteResult | null {
  if (!listing) {
    return { ok: false, reason: "missing", listingIds };
  }
  if (listing.status === "file-gone") {
    return { ok: false, reason: "file-gone", listingIds };
  }
  if (listing.status === "sold") {
    return { ok: false, reason: "sold", listingIds };
  }
  if (isGiftListing(listing)) {
    return { ok: false, reason: "gift", listingIds };
  }
  if (!isPhysicalListing(listing)) {
    return { ok: false, reason: "digital", listingIds };
  }
  return null;
}

export function markListingLabel(
  listing: Listing | undefined,
  listingIds: string[],
): LabelWriteResult {
  const refused = refuseLabel(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingLabel(
  listing: Listing | undefined,
  listingIds: string[],
): LabelWriteResult {
  const refused = refuseLabel(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return {
    ok: true,
    listingIds: listingIds.filter((id) => id !== taped.id),
  };
}

export function subscribeLabel(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === LABEL_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LABEL_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LABEL_CHANGED_EVENT, listener);
  };
}
