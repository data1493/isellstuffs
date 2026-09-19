import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingFoundryView,
  type FoundryViewKind,
  type FoundryViewSheet,
} from "@/components/listing-foundry-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  FOUNDRY_COOKIE_NAME,
  FOUNDRY_REFUSE_COPY,
  isListingFoundryOverlay,
  parseFoundryListingIds,
} from "@/lib/listing-foundry";
import { listingFoundryPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FoundryPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): FoundryViewKind {
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

function foundrySheetForId(
  id: string,
  foundryIds: string[],
): FoundryViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isFoundry: listing
      ? isListingFoundryOverlay(listing.id, foundryIds)
      : false,
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
}: FoundryPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const foundryIds = parseFoundryListingIds(
    jar.get(FOUNDRY_COOKIE_NAME)?.value,
  );
  const sheet = foundrySheetForId(id, foundryIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: FOUNDRY_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a foundry seat on.",
      path: listingFoundryPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: FOUNDRY_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a foundry seat."
          : "A lamp does not take a foundry seat. One booth license is for a file on the digital lot.",
      path: listingFoundryPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Not a foundry seat · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. One booth license. Stick is no email. Not a EULA shop. Still tote.`,
    path: listingFoundryPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingFoundryPage({
  params,
}: FoundryPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const foundryIds = parseFoundryListingIds(
    jar.get(FOUNDRY_COOKIE_NAME)?.value,
  );
  const sheet = foundrySheetForId(id, foundryIds);

  return <ListingFoundryView sheet={sheet} foundryIds={foundryIds} />;
}
