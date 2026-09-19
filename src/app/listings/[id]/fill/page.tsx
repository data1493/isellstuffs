import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingFillView,
  type FillViewKind,
  type FillViewSheet,
} from "@/components/listing-fill-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  FILL_COOKIE_NAME,
  FILL_REFUSE_COPY,
  isListingFillOverlay,
  parseFillListingIds,
} from "@/lib/listing-fill";
import { listingFillPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FillPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): FillViewKind {
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

function fillSheetForId(id: string, fillIds: string[]): FillViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isFill: listing ? isListingFillOverlay(listing.id, fillIds) : false,
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
}: FillPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const fillIds = parseFillListingIds(jar.get(FILL_COOKIE_NAME)?.value);
  const sheet = fillSheetForId(id, fillIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: FILL_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a fill note on.",
      path: listingFillPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: FILL_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a fill note."
          : "A liner PDF does not take a fill. A fill note is for empties on the table.",
      path: listingFillPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not fill it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not fill it. You bring the disc. Still snap. Still tote. Not cases. Not a shop. Not gum.`,
    path: listingFillPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingFillPage({ params }: FillPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const fillIds = parseFillListingIds(jar.get(FILL_COOKIE_NAME)?.value);
  const sheet = fillSheetForId(id, fillIds);

  return <ListingFillView sheet={sheet} fillIds={fillIds} />;
}
