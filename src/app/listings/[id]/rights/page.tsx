import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingRightsView,
  type RightsViewKind,
  type RightsViewSheet,
} from "@/components/listing-rights-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  RIGHTS_COOKIE_NAME,
  RIGHTS_REFUSE_COPY,
  isListingRightsOverlay,
  parseRightsListingIds,
} from "@/lib/listing-rights";
import { listingRightsPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RightsPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): RightsViewKind {
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

function rightsSheetForId(id: string, rightsIds: string[]): RightsViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRights: listing ? isListingRightsOverlay(listing.id, rightsIds) : false,
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
}: RightsPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const rightsIds = parseRightsListingIds(jar.get(RIGHTS_COOKIE_NAME)?.value);
  const sheet = rightsSheetForId(id, rightsIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: RIGHTS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a rights note on.",
      path: listingRightsPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: RIGHTS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a rights note."
          : "A lamp is not a cleared pack. Rights honesty is for a file on the digital lot.",
      path: listingRightsPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not clear it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. As recorded. Still for sale. Walkers still want a license on the kicks. Still tote. Not a label.`,
    path: listingRightsPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRightsPage({ params }: RightsPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const rightsIds = parseRightsListingIds(jar.get(RIGHTS_COOKIE_NAME)?.value);
  const sheet = rightsSheetForId(id, rightsIds);

  return <ListingRightsView sheet={sheet} rightsIds={rightsIds} />;
}
