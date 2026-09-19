import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingEvenView,
  type EvenViewKind,
  type EvenViewSheet,
} from "@/components/listing-even-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  EVEN_COOKIE_NAME,
  EVEN_REFUSE_COPY,
  isListingEvenOverlay,
  parseEvenListingIds,
} from "@/lib/listing-even";
import { listingEvenPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type EvenPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): EvenViewKind {
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

function evenSheetForId(id: string, evenIds: string[]): EvenViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isEven: listing ? isListingEvenOverlay(listing.id, evenIds) : false,
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
}: EvenPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const evenIds = parseEvenListingIds(jar.get(EVEN_COOKIE_NAME)?.value);
  const sheet = evenSheetForId(id, evenIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: EVEN_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an even note on.",
      path: listingEvenPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: EVEN_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an even note."
          : "A file does not take an even note. An even note is for a pair on the table.",
      path: listingEvenPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not even the wear · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not even the wear. Right toe is considering it. Still tote. Still a pair. Still for sale.`,
    path: listingEvenPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingEvenPage({ params }: EvenPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const evenIds = parseEvenListingIds(jar.get(EVEN_COOKIE_NAME)?.value);
  const sheet = evenSheetForId(id, evenIds);

  return <ListingEvenView sheet={sheet} evenIds={evenIds} />;
}
