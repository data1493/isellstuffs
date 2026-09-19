/**
 * I will not speaker it — Game Boy speaker refusal. Still tote.
 *
 * Line is the screen. Cells pulled. Recap is SRAM. Glow is backlight.
 * Sound / tin were killed as recap twins. Walkers still want
 * Half-Working to fix the speaker, or “make Tetris have sound.”
 * I will not speaker it. Still a line. Still fused.
 * Still a Game Boy. Still for sale. Not line. Not a shop. Not glow.
 * Not recap.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:speaker-listing-ids` is the client speaker set.
 * Cookie `iss-speaker-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write line, cells, dump, recap, glow, link, flash, driver,
 * label, sound, tin, amp, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a LUT does not take
 * a speaker. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SPEAKER_STORAGE_KEY = "iss:speaker-listing-ids";
export const SPEAKER_COOKIE_NAME = "iss-speaker-listing-ids";
export const SPEAKER_CHANGED_EVENT = "iss:speaker-changed";

export const SPEAKER_REFUSE_COPY = "That one does not take a speaker note.";
export const SPEAKER_TABLE_LINE = "I will not speaker it.";
export const SPEAKER_LINE_LINE = "Still a line.";
export const SPEAKER_FUSED_LINE = "Still fused.";
export const SPEAKER_NOTICE_TITLE =
  "I will not speaker it. Still a line. Still fused.";
export const SPEAKER_WALK_LINE =
  "Walkers still want Half-Working to fix the speaker, or make Tetris have sound.";
export const SPEAKER_STAYS_LINE =
  "This is the speaker note. I will not speaker it. Still a line. Still fused.";
export const SPEAKER_STILL_LINE =
  "Still tote. Not line. Not a shop. Not glow. Not recap.";
export const SPEAKER_TOTE_LINE = "Add to tote still works.";
export const SPEAKER_EMPTY_LINE = "Nobody taped a speaker note yet.";
export const SPEAKER_LEAVE_LINE = "Leave the line";

const SERVER_STORE = Symbol.for("iss.speaker-listing-ids");

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

export function parseSpeakerListingIds(raw: string | null | undefined): string[] {
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

export function speakerCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SPEAKER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SPEAKER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SPEAKER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SPEAKER_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SPEAKER_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSpeakerListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSpeakerListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SPEAKER_STORAGE_KEY);
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
          window.localStorage.setItem(SPEAKER_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSpeakerListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = speakerCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SPEAKER_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SPEAKER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SPEAKER_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSpeakerOverlay(
  listingId: string,
  listingIds: readonly string[] = readSpeakerListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeSpeaker(listing: Listing | undefined): listing is Listing {
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

export type SpeakerWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

function refuseSpeaker(
  listing: Listing | undefined,
  listingIds: string[],
): { ok: false; reason: SpeakerWriteReason; listingIds: string[] } | null {
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

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingSpeaker(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSpeaker(listing, listingIds)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingSpeaker(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSpeaker(listing, listingIds)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeSpeaker(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SPEAKER_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SPEAKER_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SPEAKER_CHANGED_EVENT, listener);
  };
}
