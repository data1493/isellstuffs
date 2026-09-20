import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingDarnView,
  type DarnViewKind,
  type DarnViewSheet,
} from "@/components/listing-darn-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  DARN_CHAIR_ID,
  DARN_COOKIE_NAME,
  DARN_LAMP_ID,
  DARN_REFUSE_COPY,
  DARN_SNEAKER_ID,
  canTapeDarn,
  isListingDarnOverlay,
  parseDarnListingIds,
} from "@/lib/listing-darn";
import { listingHubName } from "@/lib/listing-display";
import { listingDarnPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DarnPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): DarnViewKind {
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
    return listing.id === DARN_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === DARN_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === DARN_SNEAKER_ID) {
    return "sneakers";
  }
  if (listing.id === DARN_LAMP_ID) {
    return "lamp";
  }
  if (!canTapeDarn(listing)) {
    return "owned";
  }
  return "physical";
}

function darnSheetForId(id: string, darnIds: string[]): DarnViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isDarn: listing ? isListingDarnOverlay(listing.id, darnIds) : false,
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
}: DarnPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const darnIds = parseDarnListingIds(jar.get(DARN_COOKIE_NAME)?.value);
  const sheet = darnSheetForId(id, darnIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: DARN_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a darn note on.",
      path: listingDarnPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: DARN_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a darn note."
          : sheet.kind === "sneakers"
            ? "Sneakers do not take a darn note. Darn is a jacket hole."
            : sheet.kind === "lamp"
              ? "A lamp does not take a darn note. Darn is a jacket hole."
              : sheet.kind === "chair"
                ? "A chair does not take a darn note. Darn is a jacket hole."
                : sheet.kind === "owned"
                  ? "A darn note is for the windbreaker. Another overlay already owns that listing."
                  : "A file does not take a darn note. A darn note is for the jacket on the table.",
      path: listingDarnPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not darn it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not darn it. Still a jacket. Still a hole. Still tote. Not sew. Not pink. Not serge.`,
    path: listingDarnPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingDarnPage({ params }: DarnPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const darnIds = parseDarnListingIds(jar.get(DARN_COOKIE_NAME)?.value);
  const sheet = darnSheetForId(id, darnIds);

  return <ListingDarnView sheet={sheet} darnIds={darnIds} />;
}
