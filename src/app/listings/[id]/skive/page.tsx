import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSkiveView,
  type SkiveViewKind,
  type SkiveViewSheet,
} from "@/components/listing-skive-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SKIVE_COOKIE_NAME,
  SKIVE_REFUSE_COPY,
  isListingSkiveOverlay,
  parseSkiveListingIds,
} from "@/lib/listing-skive";
import { listingSkivePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SkivePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SkiveViewKind {
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

function skiveSheetForId(id: string, skiveIds: string[]): SkiveViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSkive: listing ? isListingSkiveOverlay(listing.id, skiveIds) : false,
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
}: SkivePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const skiveIds = parseSkiveListingIds(jar.get(SKIVE_COOKIE_NAME)?.value);
  const sheet = skiveSheetForId(id, skiveIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SKIVE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a skive note on.",
      path: listingSkivePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SKIVE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a skive note."
          : "A file does not take a skive note. A skive note is for a pair on the table.",
      path: listingSkivePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not skive it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not skive it. Still peeling. Still a pair. Still tote. Not welt. Not stitch. Not burnish.`,
    path: listingSkivePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSkivePage({ params }: SkivePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const skiveIds = parseSkiveListingIds(jar.get(SKIVE_COOKIE_NAME)?.value);
  const sheet = skiveSheetForId(id, skiveIds);

  return <ListingSkiveView sheet={sheet} skiveIds={skiveIds} />;
}
