import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingManualView,
  type ManualViewKind,
  type ManualViewSheet,
} from "@/components/listing-manual-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  MANUAL_COOKIE_NAME,
  MANUAL_REFUSE_COPY,
  isListingManualOverlay,
  parseManualListingIds,
} from "@/lib/listing-manual";
import { listingManualPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ManualPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ManualViewKind {
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

function manualSheetForId(id: string, manualIds: string[]): ManualViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isManual: listing ? isListingManualOverlay(listing.id, manualIds) : false,
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
}: ManualPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const manualIds = parseManualListingIds(jar.get(MANUAL_COOKIE_NAME)?.value);
  const sheet = manualSheetForId(id, manualIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: MANUAL_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a missing manual on.",
      path: listingManualPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: MANUAL_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a paper manual."
          : "A file is a workbook, not a missing paper manual. Manual honesty is for a gadget on the table.",
      path: listingManualPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `There is no manual · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. No paper in the box. Figure it out. Still tote. Booklet is liner notes. Workbook is a companion PDF. This is a physical SKU with no paper manual. Not booklet. Not workbook.`,
    path: listingManualPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingManualPage({ params }: ManualPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const manualIds = parseManualListingIds(jar.get(MANUAL_COOKIE_NAME)?.value);
  const sheet = manualSheetForId(id, manualIds);

  return <ListingManualView sheet={sheet} manualIds={manualIds} />;
}
