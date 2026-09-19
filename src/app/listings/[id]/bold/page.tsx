import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBoldView,
  type BoldViewKind,
  type BoldViewSheet,
} from "@/components/listing-bold-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  BOLD_COOKIE_NAME,
  BOLD_REFUSE_COPY,
  isListingBoldOverlay,
  parseBoldListingIds,
} from "@/lib/listing-bold";
import { listingBoldPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BoldPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BoldViewKind {
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

function boldSheetForId(id: string, boldIds: string[]): BoldViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBold: listing ? isListingBoldOverlay(listing.id, boldIds) : false,
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
}: BoldPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const boldIds = parseBoldListingIds(jar.get(BOLD_COOKIE_NAME)?.value);
  const sheet = boldSheetForId(id, boldIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BOLD_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a bold note on.",
      path: listingBoldPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: BOLD_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a third weight."
          : "A lamp is not a Bold. Bold honesty is for a file on the digital lot.",
      path: listingBoldPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not bold it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Two weights. Almost bold stays almost. Foundry is two weights. Still tote. Not a type shop.`,
    path: listingBoldPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBoldPage({ params }: BoldPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const boldIds = parseBoldListingIds(jar.get(BOLD_COOKIE_NAME)?.value);
  const sheet = boldSheetForId(id, boldIds);

  return <ListingBoldView sheet={sheet} boldIds={boldIds} />;
}
