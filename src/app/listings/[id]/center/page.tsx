import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCenterView,
  type CenterViewKind,
  type CenterViewSheet,
} from "@/components/listing-center-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CENTER_COOKIE_NAME,
  CENTER_REFUSE_COPY,
  isListingCenterOverlay,
  parseCenterListingIds,
} from "@/lib/listing-center";
import { listingCenterPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CenterPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CenterViewKind {
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

function centerSheetForId(id: string, centerIds: string[]): CenterViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCenter: listing ? isListingCenterOverlay(listing.id, centerIds) : false,
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
}: CenterPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const centerIds = parseCenterListingIds(jar.get(CENTER_COOKIE_NAME)?.value);
  const sheet = centerSheetForId(id, centerIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CENTER_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a center note on.",
      path: listingCenterPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: CENTER_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a center note."
          : "A file does not take a center note. A center note is for a record on the table.",
      path: listingCenterPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not center it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not center it. Off-center. Still plays. Still tote. Still for sale.`,
    path: listingCenterPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCenterPage({ params }: CenterPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const centerIds = parseCenterListingIds(jar.get(CENTER_COOKIE_NAME)?.value);
  const sheet = centerSheetForId(id, centerIds);

  return <ListingCenterView sheet={sheet} centerIds={centerIds} />;
}
