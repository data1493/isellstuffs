import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingLineView,
  type LineViewKind,
  type LineViewSheet,
} from "@/components/listing-line-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  LINE_COOKIE_NAME,
  LINE_REFUSE_COPY,
  isListingLineOverlay,
  parseLineListingIds,
} from "@/lib/listing-line";
import { listingLinePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type LinePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): LineViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isPhysicalListing(listing)) {
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

function lineSheetForId(id: string, lineIds: string[]): LineViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isLine: listing ? isListingLineOverlay(listing.id, lineIds) : false,
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
  };
}

export async function generateMetadata({
  params,
}: LinePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const lineIds = parseLineListingIds(jar.get(LINE_COOKIE_NAME)?.value);
  const sheet = lineSheetForId(id, lineIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: LINE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a screen line on.",
      path: listingLinePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: LINE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not keep a screen line."
          : "A file does not keep a screen line. Screen-line honesty is for a handheld on the table.",
      path: listingLinePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The line stays · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Cells are out. Fix is I don't solder. Walkers still want a cleaner Game Boy screen. Press start. Still tote. Not cells. Not fix.`,
    path: listingLinePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingLinePage({ params }: LinePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const lineIds = parseLineListingIds(jar.get(LINE_COOKIE_NAME)?.value);
  const sheet = lineSheetForId(id, lineIds);

  return <ListingLineView sheet={sheet} lineIds={lineIds} />;
}
