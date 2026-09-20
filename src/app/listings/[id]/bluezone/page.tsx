import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBluezoneView,
  type BluezoneViewKind,
  type BluezoneViewSheet,
} from "@/components/listing-bluezone-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  BLUEZONE_CHAIR_ID,
  BLUEZONE_COOKIE_NAME,
  BLUEZONE_PACK_ID,
  BLUEZONE_PDF_ID,
  BLUEZONE_REFUSE_COPY,
  canTapeBluezone,
  isListingBluezoneOverlay,
  parseBluezoneListingIds,
} from "@/lib/listing-bluezone";
import { listingBluezonePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BluezonePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BluezoneViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === BLUEZONE_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === BLUEZONE_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === BLUEZONE_PACK_ID) {
    return "pack";
  }
  if (listing.id === BLUEZONE_PDF_ID) {
    return "pdf";
  }
  if (!canTapeBluezone(listing)) {
    return "owned";
  }
  return "digital";
}

function bluezoneSheetForId(id: string, bluezoneIds: string[]): BluezoneViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBluezone: listing ? isListingBluezoneOverlay(listing.id, bluezoneIds) : false,
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
}: BluezonePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const bluezoneIds = parseBluezoneListingIds(jar.get(BLUEZONE_COOKIE_NAME)?.value);
  const sheet = bluezoneSheetForId(id, bluezoneIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BLUEZONE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a bluezone note on.",
      path: listingBluezonePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: BLUEZONE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a bluezone note."
          : sheet.kind === "chair"
            ? "A chair does not take a bluezone note. Bluezone honesty is for the booth font."
            : sheet.kind === "pack"
              ? "A sample pack does not take a bluezone note. Bluezone honesty is for the booth font."
              : sheet.kind === "pdf"
                ? "A junk PDF does not take a bluezone note. Bluezone honesty is for the booth font."
                : sheet.kind === "owned"
                  ? "A bluezone note is for the booth font. Another overlay already owns that listing."
                  : "A Game Boy does not take a bluezone note. Bluezone honesty is for the booth font.",
      path: listingBluezonePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not bluezone it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not bluezone it. Still two weights. Still almost-bold. Still tote. Not raster. Not gasp. Not gridfit. Not an account.`,
    path: listingBluezonePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBluezonePage({ params }: BluezonePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const bluezoneIds = parseBluezoneListingIds(jar.get(BLUEZONE_COOKIE_NAME)?.value);
  const sheet = bluezoneSheetForId(id, bluezoneIds);

  return <ListingBluezoneView sheet={sheet} bluezoneIds={bluezoneIds} />;
}
