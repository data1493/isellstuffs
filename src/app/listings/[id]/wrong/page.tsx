import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingWrongView,
  type WrongViewKind,
  type WrongViewSheet,
} from "@/components/listing-wrong-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  WRONG_COOKIE_NAME,
  WRONG_REFUSE_COPY,
  isListingWrongOverlay,
  parseWrongListingIds,
} from "@/lib/listing-wrong";
import { listingWrongPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type WrongPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): WrongViewKind {
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

function wrongSheetForId(id: string, wrongIds: string[]): WrongViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isWrong: listing ? isListingWrongOverlay(listing.id, wrongIds) : false,
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
}: WrongPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const wrongIds = parseWrongListingIds(jar.get(WRONG_COOKIE_NAME)?.value);
  const sheet = wrongSheetForId(id, wrongIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: WRONG_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a wrong liner on.",
      path: listingWrongPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: WRONG_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a wrong liner."
          : "A lamp does not take a wrong liner. Scan is paper to a file. Press is which pressing.",
      path: listingWrongPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Wrong on purpose · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The Side A liner PDF stays wrong. Scan is paper to a file. Press is which pressing. Still tote.`,
    path: listingWrongPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingWrongPage({ params }: WrongPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const wrongIds = parseWrongListingIds(jar.get(WRONG_COOKIE_NAME)?.value);
  const sheet = wrongSheetForId(id, wrongIds);

  return <ListingWrongView sheet={sheet} wrongIds={wrongIds} />;
}
