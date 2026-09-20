import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingRiaaView,
  type RiaaViewKind,
  type RiaaViewSheet,
} from "@/components/listing-riaa-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  RIAA_CHAIR_ID,
  RIAA_COOKIE_NAME,
  RIAA_JEWELS_ID,
  RIAA_MIXTAPE_ID,
  RIAA_REFUSE_COPY,
  canTapeRiaa,
  isListingRiaaOverlay,
  parseRiaaListingIds,
} from "@/lib/listing-riaa";
import { listingRiaaPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RiaaPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): RiaaViewKind {
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
    return listing.id === RIAA_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === RIAA_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === RIAA_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === RIAA_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeRiaa(listing)) {
    return "owned";
  }
  return "physical";
}

function riaaSheetForId(id: string, riaaIds: string[]): RiaaViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRiaa: listing ? isListingRiaaOverlay(listing.id, riaaIds) : false,
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
}: RiaaPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const riaaIds = parseRiaaListingIds(jar.get(RIAA_COOKIE_NAME)?.value);
  const sheet = riaaSheetForId(id, riaaIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: RIAA_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a riaa note on.",
      path: listingRiaaPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: RIAA_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a riaa note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take a riaa note. Riaa honesty is for the unnamed LP."
            : sheet.kind === "jewels"
              ? "Empty jewels do not take a riaa note. Riaa honesty is for the unnamed LP."
              : sheet.kind === "chair"
                ? "A chair does not take a riaa note. Riaa honesty is for the unnamed LP."
                : sheet.kind === "owned"
                  ? "A riaa note is for the unnamed LP. Another overlay already owns that listing."
                  : "A file does not take a riaa note. A riaa note is for the LP on the table.",
      path: listingRiaaPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not riaa it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not riaa it. Still a skip. Still unnamed. Still tote. Not vacuum. Not zenith. Not overhang.`,
    path: listingRiaaPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRiaaPage({ params }: RiaaPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const riaaIds = parseRiaaListingIds(jar.get(RIAA_COOKIE_NAME)?.value);
  const sheet = riaaSheetForId(id, riaaIds);

  return <ListingRiaaView sheet={sheet} riaaIds={riaaIds} />;
}
