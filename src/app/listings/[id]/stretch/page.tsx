import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingStretchView,
  type StretchViewKind,
  type StretchViewSheet,
} from "@/components/listing-stretch-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  STRETCH_COOKIE_NAME,
  STRETCH_REFUSE_COPY,
  isListingStretchOverlay,
  parseStretchListingIds,
} from "@/lib/listing-stretch";
import { listingStretchPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StretchPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): StretchViewKind {
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

function stretchSheetForId(id: string, stretchIds: string[]): StretchViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isStretch: listing ? isListingStretchOverlay(listing.id, stretchIds) : false,
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
}: StretchPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const stretchIds = parseStretchListingIds(jar.get(STRETCH_COOKIE_NAME)?.value);
  const sheet = stretchSheetForId(id, stretchIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: STRETCH_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a stretch refusal on.",
      path: listingStretchPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: STRETCH_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a stretch."
          : "A file does not stretch. A stretch refusal is for sneakers on the table.",
      path: listingStretchPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not stretch · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Sole is no new sole. Toe is the peel. Laces stayed home. I will not stretch. Both still walk. Still tote. Not sole. Not a cobbler last. Not size.`,
    path: listingStretchPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingStretchPage({ params }: StretchPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const stretchIds = parseStretchListingIds(jar.get(STRETCH_COOKIE_NAME)?.value);
  const sheet = stretchSheetForId(id, stretchIds);

  return <ListingStretchView sheet={sheet} stretchIds={stretchIds} />;
}
