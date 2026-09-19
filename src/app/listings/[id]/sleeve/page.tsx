import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSleeveView,
  type SleeveViewKind,
  type SleeveViewSheet,
} from "@/components/listing-sleeve-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SLEEVE_COOKIE_NAME,
  SLEEVE_REFUSE_COPY,
  isListingSleeveOverlay,
  parseSleeveListingIds,
} from "@/lib/listing-sleeve";
import { listingSleevePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SleevePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SleeveViewKind {
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

function sleeveSheetForId(id: string, sleeveIds: string[]): SleeveViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSleeve: listing ? isListingSleeveOverlay(listing.id, sleeveIds) : false,
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
}: SleevePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const sleeveIds = parseSleeveListingIds(jar.get(SLEEVE_COOKIE_NAME)?.value);
  const sheet = sleeveSheetForId(id, sleeveIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SLEEVE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a grocery bag on.",
      path: listingSleevePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SLEEVE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not live in a grocery bag."
          : "A file is not a record. Grocery-bag sleeve is for an LP on the table.",
      path: listingSleevePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The grocery bag is the sleeve · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Skip is the scratch. Press is which pressing. This is the LP in a grocery bag. Still tote. Not skip. Not poly.`,
    path: listingSleevePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSleevePage({ params }: SleevePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const sleeveIds = parseSleeveListingIds(jar.get(SLEEVE_COOKIE_NAME)?.value);
  const sheet = sleeveSheetForId(id, sleeveIds);

  return <ListingSleeveView sheet={sheet} sleeveIds={sleeveIds} />;
}
