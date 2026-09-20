import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingRecaseView,
  type RecaseViewKind,
  type RecaseViewSheet,
} from "@/components/listing-recase-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  RECASE_CHAIR_ID,
  RECASE_COOKIE_NAME,
  RECASE_JEWELS_ID,
  RECASE_LP_ID,
  RECASE_REFUSE_COPY,
  canTapeRecase,
  isListingRecaseOverlay,
  parseRecaseListingIds,
} from "@/lib/listing-recase";
import { listingHubName } from "@/lib/listing-display";
import { listingRecasePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RecasePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): RecaseViewKind {
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
    return listing.id === RECASE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === RECASE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === RECASE_LP_ID) {
    return "lp";
  }
  if (listing.id === RECASE_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeRecase(listing)) {
    return "owned";
  }
  return "physical";
}

function recaseSheetForId(id: string, recaseIds: string[]): RecaseViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRecase: listing ? isListingRecaseOverlay(listing.id, recaseIds) : false,
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
}: RecasePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const recaseIds = parseRecaseListingIds(jar.get(RECASE_COOKIE_NAME)?.value);
  const sheet = recaseSheetForId(id, recaseIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: RECASE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a recase note on.",
      path: listingRecasePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: RECASE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a recase note."
          : sheet.kind === "lp"
            ? "A record does not take a recase note. Recase is a cassette shell."
            : sheet.kind === "jewels"
              ? "Empty jewel cases do not take a recase note. Recase is a cassette shell."
              : sheet.kind === "chair"
                ? "A chair does not take a recase note. Recase is a cassette shell."
                : sheet.kind === "owned"
                  ? "A recase note is for SUMMER 93. Another overlay already owns that listing."
                  : "A file does not take a recase note. A recase note is for the cassette on the table.",
      path: listingRecasePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not recase it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not recase it. Still fading. Still hiss. Still tote. Not pancake. Not Dolby. Not sleeve.`,
    path: listingRecasePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRecasePage({ params }: RecasePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const recaseIds = parseRecaseListingIds(jar.get(RECASE_COOKIE_NAME)?.value);
  const sheet = recaseSheetForId(id, recaseIds);

  return <ListingRecaseView sheet={sheet} recaseIds={recaseIds} />;
}
