import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingWhoseView,
  type WhoseViewKind,
  type WhoseViewSheet,
} from "@/components/listing-whose-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  WHOSE_COOKIE_NAME,
  WHOSE_REFUSE_COPY,
  isListingWhoseOverlay,
  parseWhoseListingIds,
} from "@/lib/listing-whose";
import { listingWhosePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type WhosePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): WhoseViewKind {
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

function whoseSheetForId(id: string, whoseIds: string[]): WhoseViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isWhose: listing ? isListingWhoseOverlay(listing.id, whoseIds) : false,
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
}: WhosePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const whoseIds = parseWhoseListingIds(jar.get(WHOSE_COOKIE_NAME)?.value);
  const sheet = whoseSheetForId(id, whoseIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: WHOSE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to refuse a grandma story on.",
      path: listingWhosePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: WHOSE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not have a grandma."
          : "A PDF does not have a grandma. Whose honesty is for a mug on the table.",
      path: listingWhosePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not say whose · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Chip is the diner rim. Heat is not for the microwave. Match is nothing matches. From three apartments. Still tote. Not chip. Not a family desk. Not match.`,
    path: listingWhosePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingWhosePage({ params }: WhosePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const whoseIds = parseWhoseListingIds(jar.get(WHOSE_COOKIE_NAME)?.value);
  const sheet = whoseSheetForId(id, whoseIds);

  return <ListingWhoseView sheet={sheet} whoseIds={whoseIds} />;
}
