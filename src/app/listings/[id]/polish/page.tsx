import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPolishView,
  type PolishViewKind,
  type PolishViewSheet,
} from "@/components/listing-polish-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  POLISH_COOKIE_NAME,
  POLISH_REFUSE_COPY,
  isListingPolishOverlay,
  parsePolishListingIds,
} from "@/lib/listing-polish";
import { listingPolishPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PolishPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PolishViewKind {
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

function polishSheetForId(id: string, polishIds: string[]): PolishViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPolish: listing ? isListingPolishOverlay(listing.id, polishIds) : false,
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
}: PolishPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const polishIds = parsePolishListingIds(jar.get(POLISH_COOKIE_NAME)?.value);
  const sheet = polishSheetForId(id, polishIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: POLISH_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a polish refusal on.",
      path: listingPolishPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: POLISH_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take polish."
          : "A file does not take polish. A polish refusal is for a scratched CD-R on the table.",
      path: listingPolishPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not polish · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Zip is the leftover jewel. Ink is the Sharpie. Plays is I spun it once. I will not polish. Scratched, plays. Still tote. Not ink. Not a polish shop. Not zip.`,
    path: listingPolishPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPolishPage({ params }: PolishPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const polishIds = parsePolishListingIds(jar.get(POLISH_COOKIE_NAME)?.value);
  const sheet = polishSheetForId(id, polishIds);

  return <ListingPolishView sheet={sheet} polishIds={polishIds} />;
}
