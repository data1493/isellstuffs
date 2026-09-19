import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingAzimuthView,
  type AzimuthViewKind,
  type AzimuthViewSheet,
} from "@/components/listing-azimuth-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  AZIMUTH_COOKIE_NAME,
  AZIMUTH_LP_ID,
  AZIMUTH_REFUSE_COPY,
  canTapeAzimuth,
  isListingAzimuthOverlay,
  parseAzimuthListingIds,
} from "@/lib/listing-azimuth";
import { listingHubName } from "@/lib/listing-display";
import { listingAzimuthPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type AzimuthPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): AzimuthViewKind {
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
  if (listing.id === AZIMUTH_LP_ID) {
    return "lp";
  }
  if (!canTapeAzimuth(listing)) {
    return "owned";
  }
  return "physical";
}

function azimuthSheetForId(id: string, azimuthIds: string[]): AzimuthViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isAzimuth: listing ? isListingAzimuthOverlay(listing.id, azimuthIds) : false,
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
}: AzimuthPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const azimuthIds = parseAzimuthListingIds(
    jar.get(AZIMUTH_COOKIE_NAME)?.value,
  );
  const sheet = azimuthSheetForId(id, azimuthIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: AZIMUTH_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an azimuth note on.",
      path: listingAzimuthPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: AZIMUTH_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an azimuth note."
          : sheet.kind === "lp"
            ? "A record does not take an azimuth note. Azimuth is a cassette heading."
            : sheet.kind === "owned"
              ? "An azimuth note is for SUMMER 93. Another overlay already owns that listing."
              : "A file does not take an azimuth note. An azimuth note is for the cassette on the table.",
      path: listingAzimuthPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not azimuth it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not azimuth it. Still hiss. Still 93. Still tote. Not hiss. Not splice. Not a deck.`,
    path: listingAzimuthPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingAzimuthPage({ params }: AzimuthPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const azimuthIds = parseAzimuthListingIds(
    jar.get(AZIMUTH_COOKIE_NAME)?.value,
  );
  const sheet = azimuthSheetForId(id, azimuthIds);

  return <ListingAzimuthView sheet={sheet} azimuthIds={azimuthIds} />;
}
