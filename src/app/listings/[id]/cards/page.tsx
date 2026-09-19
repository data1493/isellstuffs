import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCardsView,
  type CardsViewKind,
  type CardsViewSheet,
} from "@/components/listing-cards-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CARDS_COOKIE_NAME,
  CARDS_REFUSE_COPY,
  isListingCardsOverlay,
  parseCardsListingIds,
} from "@/lib/listing-cards";
import { listingCardsPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CardsPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CardsViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
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

function cardsSheetForId(id: string, cardsIds: string[]): CardsViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCards: listing ? isListingCardsOverlay(listing.id, cardsIds) : false,
    title: listing?.title ?? null,
    priceLabel: listing ? formatMoney(listing.price) : null,
    fact: listing
      ? isDigitalListing(listing)
        ? listing.fileFormat
        : listing.condition
      : null,
    stallName: stall?.boothName ?? listing?.stallId ?? null,
    stallSlug: stall?.slug ?? null,
    hubName: listing ? listingHubName(listing) : null,
    listing: listing ?? null,
  };
}

export async function generateMetadata({
  params,
}: CardsPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const cardsIds = parseCardsListingIds(jar.get(CARDS_COOKIE_NAME)?.value);
  const sheet = cardsSheetForId(id, cardsIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CARDS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape typed-card honesty on.",
      path: listingCardsPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: CARDS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a scan stack."
          : "A mug is not a scan stack. Typed-card honesty is for a scanned stack on the digital lot.",
      path: listingCardsPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not type them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The cards stay scans. I will not type them. Vibe is cups. Clip is the binder. Still tote. Not a typist.`,
    path: listingCardsPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCardsPage({ params }: CardsPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const cardsIds = parseCardsListingIds(jar.get(CARDS_COOKIE_NAME)?.value);
  const sheet = cardsSheetForId(id, cardsIds);

  return <ListingCardsView sheet={sheet} cardsIds={cardsIds} />;
}
