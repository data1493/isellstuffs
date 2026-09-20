import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingTenterView,
  type TenterViewKind,
  type TenterViewSheet,
} from "@/components/listing-tenter-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  TENTER_CHAIR_ID,
  TENTER_COOKIE_NAME,
  TENTER_LID_ID,
  TENTER_REFUSE_COPY,
  TENTER_SOLES_ID,
  canTapeTenter,
  isListingTenterOverlay,
  parseTenterListingIds,
} from "@/lib/listing-tenter";
import { listingTenterPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type TenterPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): TenterViewKind {
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
    return listing.id === TENTER_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === TENTER_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === TENTER_SOLES_ID) {
    return "soles";
  }
  if (listing.id === TENTER_LID_ID) {
    return "lid";
  }
  if (!canTapeTenter(listing)) {
    return "owned";
  }
  return "physical";
}

function tenterSheetForId(id: string, tenterIds: string[]): TenterViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isTenter: listing ? isListingTenterOverlay(listing.id, tenterIds) : false,
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
}: TenterPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const tenterIds = parseTenterListingIds(jar.get(TENTER_COOKIE_NAME)?.value);
  const sheet = tenterSheetForId(id, tenterIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: TENTER_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a tenter note on.",
      path: listingTenterPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: TENTER_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a tenter note."
          : sheet.kind === "soles"
            ? "Split soles do not take a tenter note. Tenter honesty is for the windbreaker."
            : sheet.kind === "lid"
              ? "A lid does not take a tenter note. Tenter honesty is for the windbreaker."
              : sheet.kind === "chair"
                ? "A chair does not take a tenter note. Tenter honesty is for the windbreaker."
                : sheet.kind === "owned"
                  ? "A tenter note is for the windbreaker. Another overlay already owns that listing."
                  : "A file does not take a tenter note. A tenter note is for the jacket on the table.",
      path: listingTenterPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not tenter it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not tenter it. Still mint-green. Still smells like a car. Still tote. Not singe. Not nap. Not calender.`,
    path: listingTenterPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingTenterPage({ params }: TenterPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const tenterIds = parseTenterListingIds(jar.get(TENTER_COOKIE_NAME)?.value);
  const sheet = tenterSheetForId(id, tenterIds);

  return <ListingTenterView sheet={sheet} tenterIds={tenterIds} />;
}
