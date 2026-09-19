/**
 * Scan the liner — paper and a file that sit together.
 *
 * Shape: JSON array of `[Listing.id, Listing.id]` pairs from `@/lib/commerce`.
 * localStorage key `iss:listing-scan-pairs` is the client pair set.
 * Cookie `iss-listing-scan-pairs` is the same JSON so both PDPs SSR the mate.
 *
 * The mixtape already has liner notes. Scan is the digital mate.
 * Not two physicals — that walk is `/listings/[id]/with`.
 * Never rewrite `status`, `cartEligible`, or tote / van / with / hands / firm keys.
 * Same-stall paper ↔ file only. Two LPs, two PDFs, and gift listings are refused.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  isPhysicalListing,
  listingsByStall,
  type Listing,
} from "@/lib/commerce";

export const SCAN_STORAGE_KEY = "iss:listing-scan-pairs";
export const SCAN_COOKIE_NAME = "iss-listing-scan-pairs";
export const SCAN_CHANGED_EVENT = "iss:listing-scan-changed";

export const SCAN_MISSING_COPY = "No scan for that listing.";
export const SCAN_GIFT_COPY = "The gift card stays at the desk.";
export const SCAN_SOLD_COPY =
  "It already walked. Scan the next tape, not this sticker.";
export const SCAN_GONE_COPY = "The folder is empty. Nothing to scan to.";
export const SCAN_PAPER_COPY = "Two LPs do not scan. That walk is with.";
export const SCAN_FILE_COPY = "Two files do not scan. Scan is paper to a file.";
export const SCAN_STALL_COPY = "The mate has to sit on the same table.";
export const SCAN_EMPTY_COPY = "Nobody else on this table to scan to.";
export const SCAN_TABLE_LINE = "The tape has liner notes.";
export const SCAN_TOTE_LINE = "Still two SKUs. Tote math stays put.";
export const SCAN_WITH_LINE = "With is two physicals. Scan is paper to a file.";
export const SCAN_MATE_LINE = "Scan is the digital mate. Not a bundle.";

export type ListingScanPair = readonly [string, string];

const SERVER_STORE = Symbol.for("iss.listing-scan-pairs");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: ListingScanPair[];
};

const emptyPairs: ListingScanPair[] = [];

let cachedRaw: string | null | undefined;
let cachedPairs: ListingScanPair[] = emptyPairs;

function canUseStorage() {
  return typeof window !== "undefined";
}

export function normalizeScanPair(
  a: string,
  b: string,
): ListingScanPair | null {
  if (typeof a !== "string" || typeof b !== "string") {
    return null;
  }
  const left = a.trim();
  const right = b.trim();
  if (!left || !right || left === right) {
    return null;
  }
  return left < right ? [left, right] : [right, left];
}

export function uniqueScanPairs(
  pairs: readonly ListingScanPair[],
): ListingScanPair[] {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const next: ListingScanPair[] = [];

  for (const pair of pairs) {
    const normalized = normalizeScanPair(pair[0], pair[1]);
    if (!normalized) {
      continue;
    }
    const key = `${normalized[0]}\0${normalized[1]}`;
    if (seenKeys.has(key)) {
      continue;
    }
    if (seenIds.has(normalized[0]) || seenIds.has(normalized[1])) {
      continue;
    }
    seenKeys.add(key);
    seenIds.add(normalized[0]);
    seenIds.add(normalized[1]);
    next.push(normalized);
  }

  return next.length === 0 ? emptyPairs : next;
}

function asPair(value: unknown): ListingScanPair | null {
  if (!Array.isArray(value) || value.length !== 2) {
    return null;
  }
  if (typeof value[0] !== "string" || typeof value[1] !== "string") {
    return null;
  }
  return normalizeScanPair(value[0], value[1]);
}

export function parseScanPairs(
  raw: string | null | undefined,
): ListingScanPair[] {
  if (!raw) {
    return emptyPairs;
  }

  try {
    let value = raw;
    try {
      value = decodeURIComponent(raw);
    } catch {
      value = raw;
    }
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return emptyPairs;
    }
    return uniqueScanPairs(
      parsed
        .map((entry) => asPair(entry))
        .filter((pair): pair is ListingScanPair => pair !== null),
    );
  } catch {
    return emptyPairs;
  }
}

export function scanCookieValue(pairs: readonly ListingScanPair[]): string {
  return JSON.stringify(uniqueScanPairs(pairs));
}

export const SCAN_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SCAN_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SCAN_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SCAN_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SCAN_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedPairs;
  }
  cachedRaw = raw;
  cachedPairs = parseScanPairs(raw);
  return cachedPairs;
}

function serverStore(): ListingScanPair[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyPairs;
}

export function readScanPairs(): ListingScanPair[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SCAN_STORAGE_KEY);
    if (fromStorage) {
      const stored = snapshotFromRaw(fromStorage);
      if (stored.length > 0) {
        return stored;
      }
    }
    const fromCookie = readCookieRaw();
    if (fromCookie) {
      const pairs = snapshotFromRaw(fromCookie);
      if (pairs.length > 0) {
        try {
          window.localStorage.setItem(
            SCAN_STORAGE_KEY,
            JSON.stringify(pairs),
          );
        } catch {
          // blocked storage
        }
        return pairs;
      }
    }
    return snapshotFromRaw(fromStorage ?? null);
  }

  return serverStore();
}

export function writeScanPairs(pairs: ListingScanPair[]) {
  const next = uniqueScanPairs(pairs);
  const raw = scanCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SCAN_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SCAN_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedPairs = next;
    window.dispatchEvent(new Event(SCAN_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedPairs = next;
}

export function scanMateOf(
  listingId: string,
  pairs: readonly ListingScanPair[] = readScanPairs(),
): string | null {
  for (const pair of pairs) {
    if (pair[0] === listingId) {
      return pair[1];
    }
    if (pair[1] === listingId) {
      return pair[0];
    }
  }
  return null;
}

export function isListingScanOverlay(
  listingId: string,
  pairs: readonly ListingScanPair[] = readScanPairs(),
) {
  return scanMateOf(listingId, pairs) !== null;
}

/** Paper or a file on the table. Gift, sold, file-gone stay off. */
export function canStampScan(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (isGiftListing(listing)) {
    return false;
  }
  if (listing.status === "sold" || listing.status === "file-gone") {
    return false;
  }
  return isPhysicalListing(listing) || isDigitalListing(listing);
}

export function isPaperToFile(
  listing: Listing | undefined,
  mate: Listing | undefined,
): mate is Listing {
  if (!canStampScan(listing) || !canStampScan(mate)) {
    return false;
  }
  if (listing.id === mate.id) {
    return false;
  }
  if (listing.stallId !== mate.stallId) {
    return false;
  }
  return isPhysicalListing(listing) !== isPhysicalListing(mate);
}

export function sameStallScanMates(listing: Listing): Listing[] {
  if (!canStampScan(listing)) {
    return [];
  }
  return listingsByStall(listing.stallId).filter((item) =>
    isPaperToFile(listing, item),
  );
}

export type ScanWriteReason =
  | "missing"
  | "missing-mate"
  | "gift"
  | "sold"
  | "file-gone"
  | "paper"
  | "file"
  | "stall"
  | "self";

export type ScanWriteResult =
  | { ok: true; pairs: ListingScanPair[] }
  | { ok: false; reason: ScanWriteReason; pairs: ListingScanPair[] };

function refuseHost(
  listing: Listing | undefined,
  pairs: ListingScanPair[],
): ScanWriteResult | null {
  if (!listing) {
    return { ok: false, reason: "missing", pairs };
  }
  if (listing.status === "file-gone") {
    return { ok: false, reason: "file-gone", pairs };
  }
  if (listing.status === "sold") {
    return { ok: false, reason: "sold", pairs };
  }
  if (isGiftListing(listing)) {
    return { ok: false, reason: "gift", pairs };
  }
  return null;
}

function refuseMate(
  listing: Listing,
  mate: Listing | undefined,
  pairs: ListingScanPair[],
): ScanWriteResult | null {
  if (!mate) {
    return { ok: false, reason: "missing-mate", pairs };
  }
  if (mate.id === listing.id) {
    return { ok: false, reason: "self", pairs };
  }
  if (mate.status === "file-gone") {
    return { ok: false, reason: "file-gone", pairs };
  }
  if (mate.status === "sold") {
    return { ok: false, reason: "sold", pairs };
  }
  if (isGiftListing(mate)) {
    return { ok: false, reason: "gift", pairs };
  }
  if (mate.stallId !== listing.stallId) {
    return { ok: false, reason: "stall", pairs };
  }
  if (isPhysicalListing(listing) && isPhysicalListing(mate)) {
    return { ok: false, reason: "paper", pairs };
  }
  if (isDigitalListing(listing) && isDigitalListing(mate)) {
    return { ok: false, reason: "file", pairs };
  }
  return null;
}

function dropListing(pairs: ListingScanPair[], listingId: string) {
  return pairs.filter(
    (pair) => pair[0] !== listingId && pair[1] !== listingId,
  );
}

export function pairScanListings(
  listing: Listing | undefined,
  mate: Listing | undefined,
  pairs: ListingScanPair[],
): ScanWriteResult {
  const refusedHost = refuseHost(listing, pairs);
  if (refusedHost) {
    return refusedHost;
  }
  const refusedMate = refuseMate(listing!, mate, pairs);
  if (refusedMate) {
    return refusedMate;
  }

  const nextPair = normalizeScanPair(listing!.id, mate!.id);
  if (!nextPair) {
    return { ok: false, reason: "self", pairs };
  }

  const current = scanMateOf(listing!.id, pairs);
  if (current === mate!.id) {
    return { ok: true, pairs };
  }

  const cleared = dropListing(dropListing(pairs, listing!.id), mate!.id);
  return { ok: true, pairs: [...cleared, nextPair] };
}

export function unpairScanListing(
  listing: Listing | undefined,
  pairs: ListingScanPair[],
): ScanWriteResult {
  const refused = refuseHost(listing, pairs);
  if (refused) {
    return refused;
  }
  if (!scanMateOf(listing!.id, pairs)) {
    return { ok: true, pairs };
  }
  return { ok: true, pairs: dropListing(pairs, listing!.id) };
}

export function subscribeScan(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SCAN_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SCAN_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SCAN_CHANGED_EVENT, listener);
  };
}
