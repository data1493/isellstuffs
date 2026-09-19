import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSkipView,
  type SkipViewKind,
  type SkipViewSheet,
} from "@/components/listing-skip-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SKIP_COOKIE_NAME,
  SKIP_REFUSE_COPY,
  isListingSkipOverlay,
  parseSkipListingIds,
} from "@/lib/listing-skip";
import { listingSkipPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SkipPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SkipViewKind {
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

function skipSheetForId(id: string, skipIds: string[]): SkipViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSkip: listing ? isListingSkipOverlay(listing.id, skipIds) : false,
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
}: SkipPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const skipIds = parseSkipListingIds(jar.get(SKIP_COOKIE_NAME)?.value);
  const sheet = skipSheetForId(id, skipIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SKIP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a skip on.",
      path: listingSkipPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SKIP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not skip."
          : "A file is not a record. The skip stays is for Side A on the table.",
      path: listingSkipPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The skip stays · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The skip stays. That's the record. Press is which pressing. Walkers still want a clean Side A. Still tote.`,
    path: listingSkipPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSkipPage({ params }: SkipPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const skipIds = parseSkipListingIds(jar.get(SKIP_COOKIE_NAME)?.value);
  const sheet = skipSheetForId(id, skipIds);

  return <ListingSkipView sheet={sheet} skipIds={skipIds} />;
}
