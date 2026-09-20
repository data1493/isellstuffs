import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingFettleView,
  type FettleViewKind,
  type FettleViewSheet,
} from "@/components/listing-fettle-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  FETTLE_CHAIR_ID,
  FETTLE_COOKIE_NAME,
  FETTLE_LID_ID,
  FETTLE_REFUSE_COPY,
  FETTLE_WHISK_ID,
  canTapeFettle,
  isListingFettleOverlay,
  parseFettleListingIds,
} from "@/lib/listing-fettle";
import { listingHubName } from "@/lib/listing-display";
import { listingFettlePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FettlePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): FettleViewKind {
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
    return listing.id === FETTLE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === FETTLE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === FETTLE_LID_ID) {
    return "lid";
  }
  if (listing.id === FETTLE_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeFettle(listing)) {
    return "owned";
  }
  return "physical";
}

function fettleSheetForId(id: string, fettleIds: string[]): FettleViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isFettle: listing ? isListingFettleOverlay(listing.id, fettleIds) : false,
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
}: FettlePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const fettleIds = parseFettleListingIds(jar.get(FETTLE_COOKIE_NAME)?.value);
  const sheet = fettleSheetForId(id, fettleIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: FETTLE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a fettle note on.",
      path: listingFettlePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: FETTLE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a fettle note."
          : sheet.kind === "lid"
            ? "A lid does not take a fettle note. Fettle is a mug rim."
            : sheet.kind === "whisk"
              ? "A whisk does not take a fettle note. Fettle is a mug rim."
              : sheet.kind === "chair"
                ? "A chair does not take a fettle note. Fettle is a mug rim."
                : sheet.kind === "owned"
                  ? "A fettle note is for the diner mug. Another overlay already owns that listing."
                  : "A file does not take a fettle note. A fettle note is for the mug on the table.",
      path: listingFettlePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not fettle it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not fettle it. Still a chip. Still a mug. Still tote. Not glaze. Not pickle. Not chip.`,
    path: listingFettlePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingFettlePage({ params }: FettlePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const fettleIds = parseFettleListingIds(jar.get(FETTLE_COOKIE_NAME)?.value);
  const sheet = fettleSheetForId(id, fettleIds);

  return <ListingFettleView sheet={sheet} fettleIds={fettleIds} />;
}
