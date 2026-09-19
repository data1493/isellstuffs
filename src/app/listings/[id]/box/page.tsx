import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBoxView,
  type BoxViewKind,
  type BoxViewSheet,
} from "@/components/listing-box-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  BOX_COOKIE_NAME,
  BOX_REFUSE_COPY,
  isListingBoxOverlay,
  parseBoxListingIds,
} from "@/lib/listing-box";
import { listingBoxPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BoxPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BoxViewKind {
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

function boxSheetForId(id: string, boxIds: string[]): BoxViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBox: listing ? isListingBoxOverlay(listing.id, boxIds) : false,
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
}: BoxPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const boxIds = parseBoxListingIds(jar.get(BOX_COOKIE_NAME)?.value);
  const sheet = boxSheetForId(id, boxIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BOX_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a shade box on.",
      path: listingBoxPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: BOX_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not pack a shade."
          : "A file does not pack a shade. Shade-in-the-box honesty is for a lamp on the table.",
      path: listingBoxPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The shade stays in the box · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Cord is rewired. Heavy is two people. This is the lamp shade packed separately. Still tote. Not wrap. Not cord.`,
    path: listingBoxPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBoxPage({ params }: BoxPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const boxIds = parseBoxListingIds(jar.get(BOX_COOKIE_NAME)?.value);
  const sheet = boxSheetForId(id, boxIds);

  return <ListingBoxView sheet={sheet} boxIds={boxIds} />;
}
