import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingLogView,
  type LogViewKind,
  type LogViewSheet,
} from "@/components/listing-log-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  LOG_COOKIE_NAME,
  LOG_REFUSE_COPY,
  isListingLogOverlay,
  parseLogListingIds,
} from "@/lib/listing-log";
import { listingLogPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type LogPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): LogViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
    return listing.status === "file-gone" ? "file-gone" : "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function logSheetForId(id: string, logIds: string[]): LogViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isLog: listing ? isListingLogOverlay(listing.id, logIds) : false,
    title: listing?.title ?? null,
    priceLabel: listing ? formatMoney(listing.price) : null,
    fact: listing
      ? isDigitalListing(listing)
        ? listing.fileFormat
        : listing.condition
      : null,
    stallName: stall?.boothName ?? listing?.stallId ?? null,
    stallSlug: stall?.slug ?? null,
    hubName: listing ? listingHubName(listing) : null,
    listing: listing ?? null,
  };
}

export async function generateMetadata({
  params,
}: LogPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const logIds = parseLogListingIds(jar.get(LOG_COOKIE_NAME)?.value);
  const sheet = logSheetForId(id, logIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: LOG_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a log note on.",
      path: listingLogPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: LOG_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a LUT look."
          : "A lamp is not a LUT look. Log honesty is for a file on the digital lot.",
      path: listingLogPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not unlog · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not unlog. Parking-lot looks. Still three cubes. Convert is Rec.709. Warm stays warm. Grade is no custom LUT. Still tote.`,
    path: listingLogPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingLogPage({ params }: LogPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const logIds = parseLogListingIds(jar.get(LOG_COOKIE_NAME)?.value);
  const sheet = logSheetForId(id, logIds);

  return <ListingLogView sheet={sheet} logIds={logIds} />;
}
