import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPinkView,
  type PinkViewKind,
  type PinkViewSheet,
} from "@/components/listing-pink-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  PINK_CHAIR_ID,
  PINK_COOKIE_NAME,
  PINK_LAMP_ID,
  PINK_REFUSE_COPY,
  PINK_SNEAKER_ID,
  canTapePink,
  isListingPinkOverlay,
  parsePinkListingIds,
} from "@/lib/listing-pink";
import { listingHubName } from "@/lib/listing-display";
import { listingPinkPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PinkPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PinkViewKind {
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
    return listing.id === PINK_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === PINK_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === PINK_SNEAKER_ID) {
    return "sneakers";
  }
  if (listing.id === PINK_LAMP_ID) {
    return "lamp";
  }
  if (!canTapePink(listing)) {
    return "owned";
  }
  return "physical";
}

function pinkSheetForId(id: string, pinkIds: string[]): PinkViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPink: listing ? isListingPinkOverlay(listing.id, pinkIds) : false,
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
}: PinkPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const pinkIds = parsePinkListingIds(jar.get(PINK_COOKIE_NAME)?.value);
  const sheet = pinkSheetForId(id, pinkIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PINK_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a pink note on.",
      path: listingPinkPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: PINK_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a pink note."
          : sheet.kind === "sneakers"
            ? "Sneakers do not take a pink note. Pink is a jacket hem."
            : sheet.kind === "lamp"
              ? "A lamp does not take a pink note. Pink is a jacket hem."
              : sheet.kind === "chair"
                ? "A chair does not take a pink note. Pink is a jacket hem."
                : sheet.kind === "owned"
                  ? "A pink note is for the windbreaker. Another overlay already owns that listing."
                  : "A file does not take a pink note. A pink note is for the jacket on the table.",
      path: listingPinkPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not pink it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not pink it. Still mint. Still a car. Still tote. Not serge. Not dart. Not fell.`,
    path: listingPinkPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPinkPage({ params }: PinkPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const pinkIds = parsePinkListingIds(jar.get(PINK_COOKIE_NAME)?.value);
  const sheet = pinkSheetForId(id, pinkIds);

  return <ListingPinkView sheet={sheet} pinkIds={pinkIds} />;
}
