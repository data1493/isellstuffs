import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingDoubleView,
  type DoubleViewKind,
  type DoubleViewSheet,
} from "@/components/listing-double-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  DOUBLE_COOKIE_NAME,
  DOUBLE_REFUSE_COPY,
  isListingDoubleOverlay,
  parseDoubleListingIds,
} from "@/lib/listing-double";
import { listingDoublePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DoublePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): DoubleViewKind {
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

function doubleSheetForId(id: string, doubleIds: string[]): DoubleViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isDouble: listing ? isListingDoubleOverlay(listing.id, doubleIds) : false,
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
}: DoublePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const doubleIds = parseDoubleListingIds(jar.get(DOUBLE_COOKIE_NAME)?.value);
  const sheet = doubleSheetForId(id, doubleIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: DOUBLE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape double honesty on.",
      path: listingDoublePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: DOUBLE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a recipe yield."
          : "A mug is not a recipe yield. Double honesty is for a scanned stack on the digital lot.",
      path: listingDoublePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not double it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not double it. Three cards. Vibes. Cards is I will not type them. Clip is the binder. Still tote. Not a cookbook desk.`,
    path: listingDoublePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingDoublePage({ params }: DoublePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const doubleIds = parseDoubleListingIds(jar.get(DOUBLE_COOKIE_NAME)?.value);
  const sheet = doubleSheetForId(id, doubleIds);

  return <ListingDoubleView sheet={sheet} doubleIds={doubleIds} />;
}
