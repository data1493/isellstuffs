import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingWorkbookView,
  type WorkbookViewKind,
  type WorkbookViewSheet,
} from "@/components/listing-workbook-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  WORKBOOK_COOKIE_NAME,
  WORKBOOK_REFUSE_COPY,
  isListingWorkbookOverlay,
  parseWorkbookListingIds,
} from "@/lib/listing-workbook";
import { listingWorkbookPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type WorkbookPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): WorkbookViewKind {
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

function workbookSheetForId(
  id: string,
  workbookIds: string[],
): WorkbookViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isWorkbook: listing
      ? isListingWorkbookOverlay(listing.id, workbookIds)
      : false,
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
}: WorkbookPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const workbookIds = parseWorkbookListingIds(
    jar.get(WORKBOOK_COOKIE_NAME)?.value,
  );
  const sheet = workbookSheetForId(id, workbookIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: WORKBOOK_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a workbook on.",
      path: listingWorkbookPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: WORKBOOK_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a workbook."
          : "A lamp does not take a workbook. The PDF is the file. There is no companion book.",
      path: listingWorkbookPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `There is no workbook · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The PDF is the file. Grade is I don't grade. Still tote.`,
    path: listingWorkbookPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingWorkbookPage({
  params,
}: WorkbookPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const workbookIds = parseWorkbookListingIds(
    jar.get(WORKBOOK_COOKIE_NAME)?.value,
  );
  const sheet = workbookSheetForId(id, workbookIds);

  return <ListingWorkbookView sheet={sheet} workbookIds={workbookIds} />;
}
