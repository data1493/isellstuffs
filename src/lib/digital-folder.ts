import { CHECKOUT_COOKIE, parseCheckoutSession } from "@/lib/checkout";
import { isDigitalListing, type DigitalListing, type Stall } from "@/lib/commerce";
import { liveListingById, liveStallById } from "@/lib/live-catalog";

export { CHECKOUT_COOKIE };

export type FolderLine = {
  listing: DigitalListing;
  stall: Stall;
  formatLabel: string;
  downloadName: string;
  downloadHref: string;
  publicFile: string;
  mimeType: string;
};

function slugFilename(listing: DigitalListing): string {
  const fromTitle = listing.title
    .toLowerCase()
    .trim()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return fromTitle || listing.id;
}

function formatKey(listing: DigitalListing): string {
  return listing.fileFormat.toUpperCase();
}

export function isPdfStandIn(listing: DigitalListing): boolean {
  return formatKey(listing).includes("PDF");
}

export function standInPublicFile(listing: DigitalListing): string {
  const format = formatKey(listing);
  if (format.includes("PDF")) {
    return "stand-in-files/stand-in.pdf";
  }
  if (format.includes("CUBE")) {
    return "stand-in-files/stand-in-cube.txt";
  }
  if (format.includes("ZIP") || format.includes("WAV")) {
    return "stand-in-files/stand-in-zip-wav.txt";
  }
  if (format.includes("OTF")) {
    return "stand-in-files/stand-in-otf.txt";
  }
  if (format.includes("GIFT")) {
    return "stand-in-files/stand-in-gift.txt";
  }
  return "stand-in-files/stand-in.txt";
}

export function standInMimeType(listing: DigitalListing): string {
  return isPdfStandIn(listing) ? "application/pdf" : "text/plain; charset=utf-8";
}

export function standInDownloadName(listing: DigitalListing): string {
  const base = slugFilename(listing);
  return isPdfStandIn(listing) ? `${base}.pdf` : `${base}.txt`;
}

export function folderDownloadHref(listingId: string): string {
  return `/api/folder/${encodeURIComponent(listingId)}`;
}

export function digitalLinesOnSlip(listingIds: string[]): FolderLine[] {
  const lines: FolderLine[] = [];
  const seen = new Set<string>();

  for (const id of listingIds) {
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);

    const listing = liveListingById(id);
    if (!listing || !isDigitalListing(listing)) {
      continue;
    }
    if (listing.status === "file-gone") {
      continue;
    }

    const stall = liveStallById(listing.stallId);
    if (!stall) {
      continue;
    }

    lines.push({
      listing,
      stall,
      formatLabel: listing.fileFormat,
      downloadName: standInDownloadName(listing),
      downloadHref: folderDownloadHref(listing.id),
      publicFile: standInPublicFile(listing),
      mimeType: standInMimeType(listing),
    });
  }

  return lines;
}

export type FolderSlipRef = {
  id: string;
  listingIds: string[];
};

/** Same cookie read checkout success uses. Optional slip must match the stored id. */
export function folderSlipFromCookie(
  cookieValue: string | undefined,
  slip?: string,
) {
  const stored = parseCheckoutSession(cookieValue);
  if (!stored) {
    return null;
  }
  if (slip && stored.id !== slip) {
    return null;
  }
  return stored;
}

/** One paid tote from `iss:orders`. Do not invent a second folder key. */
export function folderSlipFromOrders(
  orders: readonly FolderSlipRef[],
  slip: string,
): FolderSlipRef | null {
  if (!slip) {
    return null;
  }
  return orders.find((order) => order.id === slip) ?? null;
}

/**
 * Cookie first; `iss:orders` when the checkout cookie is a different tote
 * (last week's PDF after the 30-minute slip cookie dies).
 */
export function resolveFolderSlip(
  slip: string,
  cookie: FolderSlipRef | null,
  orders: readonly FolderSlipRef[],
): FolderSlipRef | null {
  if (cookie && cookie.id === slip) {
    return cookie;
  }
  return folderSlipFromOrders(orders, slip);
}

/**
 * `/folder` index: honor the current cookie even when it has no files.
 * If this tab has no cookie, offer the newest stored slip that still has files.
 */
export function resolveFolderIndex(
  cookie: FolderSlipRef | null,
  orders: readonly FolderSlipRef[],
): FolderSlipRef | null {
  if (cookie) {
    return cookie;
  }
  return (
    orders.find((order) => folderHasDigitalLines(order.listingIds)) ?? null
  );
}

export function folderHasDigitalLines(listingIds: string[]): boolean {
  return digitalLinesOnSlip(listingIds).length > 0;
}
