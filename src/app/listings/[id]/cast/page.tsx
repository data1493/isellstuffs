import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCastView,
  type CastViewKind,
  type CastViewSheet,
} from "@/components/listing-cast-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CAST_COOKIE_NAME,
  CAST_REFUSE_COPY,
  isListingCastOverlay,
  parseCastListingIds,
} from "@/lib/listing-cast";
import { listingCastPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CastPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CastViewKind {
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

function castSheetForId(id: string, castIds: string[]): CastViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCast: listing ? isListingCastOverlay(listing.id, castIds) : false,
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
}: CastPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const castIds = parseCastListingIds(jar.get(CAST_COOKIE_NAME)?.value);
  const sheet = castSheetForId(id, castIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CAST_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a cast note on.",
      path: listingCastPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: CAST_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not recast."
          : "A file does not recast. A cast note is for a lamp on the table.",
      path: listingCastPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not recast · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not recast. This clay. Still lights. Still tote. Not a pottery shop. Still for sale.`,
    path: listingCastPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCastPage({ params }: CastPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const castIds = parseCastListingIds(jar.get(CAST_COOKIE_NAME)?.value);
  const sheet = castSheetForId(id, castIds);

  return <ListingCastView sheet={sheet} castIds={castIds} />;
}
