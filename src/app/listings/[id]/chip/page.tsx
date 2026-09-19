import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingChipView,
  type ChipViewKind,
  type ChipViewSheet,
} from "@/components/listing-chip-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CHIP_COOKIE_NAME,
  CHIP_REFUSE_COPY,
  isListingChipOverlay,
  parseChipListingIds,
} from "@/lib/listing-chip";
import { listingChipPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ChipPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ChipViewKind {
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

function chipSheetForId(id: string, chipIds: string[]): ChipViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isChip: listing ? isListingChipOverlay(listing.id, chipIds) : false,
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
}: ChipPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const chipIds = parseChipListingIds(jar.get(CHIP_COOKIE_NAME)?.value);
  const sheet = chipSheetForId(id, chipIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CHIP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a chip on.",
      path: listingChipPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: CHIP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not keep a chip."
          : "A file does not keep a chip. Chip honesty is for a diner mug on the table.",
      path: listingChipPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The chip stays · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The chip is on the rim. You can feel it. Still tote. Heat is don't microwave. This is the diner chip. Not heat. Not as-is.`,
    path: listingChipPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingChipPage({ params }: ChipPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const chipIds = parseChipListingIds(jar.get(CHIP_COOKIE_NAME)?.value);
  const sheet = chipSheetForId(id, chipIds);

  return <ListingChipView sheet={sheet} chipIds={chipIds} />;
}
