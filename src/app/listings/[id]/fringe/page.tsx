import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingFringeView,
  type FringeViewKind,
  type FringeViewSheet,
} from "@/components/listing-fringe-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  FRINGE_CHAIR_ID,
  FRINGE_COOKIE_NAME,
  FRINGE_MUG_ID,
  FRINGE_REFUSE_COPY,
  FRINGE_WHISK_ID,
  canTapeFringe,
  isListingFringeOverlay,
  parseFringeListingIds,
} from "@/lib/listing-fringe";
import { listingFringePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FringePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): FringeViewKind {
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
    return listing.id === FRINGE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === FRINGE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === FRINGE_MUG_ID) {
    return "mug";
  }
  if (listing.id === FRINGE_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeFringe(listing)) {
    return "owned";
  }
  return "physical";
}

function fringeSheetForId(
  id: string,
  fringeIds: string[],
): FringeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isFringe: listing
      ? isListingFringeOverlay(listing.id, fringeIds)
      : false,
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
}: FringePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const fringeIds = parseFringeListingIds(
    jar.get(FRINGE_COOKIE_NAME)?.value,
  );
  const sheet = fringeSheetForId(id, fringeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: FRINGE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a fringe note on.",
      path: listingFringePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: FRINGE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a fringe note."
          : sheet.kind === "mug"
            ? "A mug does not take a fringe note. Fringe honesty is for the pot lid."
            : sheet.kind === "whisk"
              ? "A whisk does not take a fringe note. Fringe honesty is for the pot lid."
              : sheet.kind === "chair"
                ? "A chair does not take a fringe note. Fringe honesty is for the pot lid."
                : sheet.kind === "owned"
                  ? "A fringe note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a fringe note. A fringe note is for the lid on the table.",
      path: listingFringePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not fringe it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not fringe it. Still a lid. Still no pot. Still tote. Not frost. Not prussian. Not countersink.`,
    path: listingFringePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingFringePage({
  params,
}: FringePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const fringeIds = parseFringeListingIds(
    jar.get(FRINGE_COOKIE_NAME)?.value,
  );
  const sheet = fringeSheetForId(id, fringeIds);

  return <ListingFringeView sheet={sheet} fringeIds={fringeIds} />;
}
