import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSergeView,
  type SergeViewKind,
  type SergeViewSheet,
} from "@/components/listing-serge-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  SERGE_CHAIR_ID,
  SERGE_COOKIE_NAME,
  SERGE_LAMP_ID,
  SERGE_REFUSE_COPY,
  SERGE_SNEAKER_ID,
  canTapeSerge,
  isListingSergeOverlay,
  parseSergeListingIds,
} from "@/lib/listing-serge";
import { listingHubName } from "@/lib/listing-display";
import { listingSergePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SergePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SergeViewKind {
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
    return listing.id === SERGE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === SERGE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === SERGE_SNEAKER_ID) {
    return "sneakers";
  }
  if (listing.id === SERGE_LAMP_ID) {
    return "lamp";
  }
  if (!canTapeSerge(listing)) {
    return "owned";
  }
  return "physical";
}

function sergeSheetForId(id: string, sergeIds: string[]): SergeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSerge: listing ? isListingSergeOverlay(listing.id, sergeIds) : false,
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
}: SergePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const sergeIds = parseSergeListingIds(jar.get(SERGE_COOKIE_NAME)?.value);
  const sheet = sergeSheetForId(id, sergeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SERGE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a serge note on.",
      path: listingSergePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SERGE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a serge note."
          : sheet.kind === "sneakers"
            ? "Sneakers do not take a serge note. Serge is a jacket edge."
            : sheet.kind === "lamp"
              ? "A lamp does not take a serge note. Serge is a jacket edge."
              : sheet.kind === "chair"
                ? "A chair does not take a serge note. Serge is a jacket edge."
                : sheet.kind === "owned"
                  ? "A serge note is for the windbreaker. Another overlay already owns that listing."
                  : "A file does not take a serge note. A serge note is for the jacket on the table.",
      path: listingSergePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not serge it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not serge it. Still worn twice. Still a car. Still tote. Not dart. Not sew. Not cinch.`,
    path: listingSergePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSergePage({ params }: SergePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const sergeIds = parseSergeListingIds(jar.get(SERGE_COOKIE_NAME)?.value);
  const sheet = sergeSheetForId(id, sergeIds);

  return <ListingSergeView sheet={sheet} sergeIds={sergeIds} />;
}
