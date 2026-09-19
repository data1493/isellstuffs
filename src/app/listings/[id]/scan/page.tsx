import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingScanView,
  type ScanMateSheet,
  type ScanViewKind,
  type ScanViewSheet,
} from "@/components/listing-scan-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SCAN_COOKIE_NAME,
  parseScanPairs,
  sameStallScanMates,
  scanMateOf,
} from "@/lib/listing-scan";
import { listingScanPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ScanPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ScanViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return isPhysicalListing(listing) ? "paper" : "file";
}

function mateSheet(listing: ReturnType<typeof listingById>): ScanMateSheet | null {
  if (!listing) {
    return null;
  }
  return {
    id: listing.id,
    title: listing.title,
    priceLabel: formatMoney(listing.price),
    fact: isPhysicalListing(listing) ? listing.condition : listing.fileFormat,
    kind: isPhysicalListing(listing) ? "paper" : "file",
  };
}

function scanSheetForId(
  id: string,
  pairs: ReturnType<typeof parseScanPairs>,
): ScanViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;
  const mateId = listing ? scanMateOf(listing.id, pairs) : null;
  const mate = mateId ? listingById(mateId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    mateId: mate ? mate.id : null,
    title: listing?.title ?? null,
    priceLabel: listing ? formatMoney(listing.price) : null,
    fact: listing
      ? isPhysicalListing(listing)
        ? listing.condition
        : listing.fileFormat
      : null,
    stallName: stall?.boothName ?? listing?.stallId ?? null,
    stallSlug: stall?.slug ?? null,
    hubName: listing ? listingHubName(listing) : null,
    listing: listing ?? null,
    mate: mateSheet(mate),
    mates: listing ? sameStallScanMates(listing).map((item) => mateSheet(item)!) : [],
  };
}

export async function generateMetadata({
  params,
}: ScanPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const pairs = parseScanPairs(jar.get(SCAN_COOKIE_NAME)?.value);
  const sheet = scanSheetForId(id, pairs);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: "No scan for that listing",
      description: "No SKU with that id. Nothing scanned together.",
      path: listingScanPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "paper" && sheet.kind !== "file") {
    return shareMetadata({
      title:
        sheet.kind === "gift"
          ? "No scan on a gift card"
          : "No scan on that sticker",
      description:
        sheet.kind === "gift"
          ? "The gift card stays at the desk."
          : "Sold and empty folders do not get a liner scan.",
      path: listingScanPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: sheet.mate
      ? `Scan · ${sheet.title} + ${sheet.mate.title}`
      : `Scan the liner · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Scan is paper to a file. Not a bundle. Tote math stays put.`,
    path: listingScanPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingScanPage({ params }: ScanPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const pairs = parseScanPairs(jar.get(SCAN_COOKIE_NAME)?.value);
  const sheet = scanSheetForId(id, pairs);

  return <ListingScanView sheet={sheet} pairs={pairs} />;
}
