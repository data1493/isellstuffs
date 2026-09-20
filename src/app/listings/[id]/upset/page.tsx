import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingUpsetView,
  type UpsetViewKind,
  type UpsetViewSheet,
} from "@/components/listing-upset-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  UPSET_CHAIR_ID,
  UPSET_COOKIE_NAME,
  UPSET_LID_ID,
  UPSET_MUG_ID,
  UPSET_REFUSE_COPY,
  canTapeUpset,
  isListingUpsetOverlay,
  parseUpsetListingIds,
} from "@/lib/listing-upset";
import { listingUpsetPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type UpsetPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): UpsetViewKind {
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
    return listing.id === UPSET_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === UPSET_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === UPSET_MUG_ID) {
    return "mug";
  }
  if (listing.id === UPSET_LID_ID) {
    return "lid";
  }
  if (!canTapeUpset(listing)) {
    return "owned";
  }
  return "physical";
}

function upsetSheetForId(id: string, upsetIds: string[]): UpsetViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isUpset: listing ? isListingUpsetOverlay(listing.id, upsetIds) : false,
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
}: UpsetPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const upsetIds = parseUpsetListingIds(jar.get(UPSET_COOKIE_NAME)?.value);
  const sheet = upsetSheetForId(id, upsetIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: UPSET_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an upset note on.",
      path: listingUpsetPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: UPSET_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an upset note."
          : sheet.kind === "mug"
            ? "A mug does not take an upset note. Upset is a whisk thicken."
            : sheet.kind === "lid"
              ? "A lid does not take an upset note. Upset is a whisk thicken."
              : sheet.kind === "chair"
                ? "A chair does not take an upset note. Upset is a whisk thicken."
                : sheet.kind === "owned"
                  ? "An upset note is for the balloon whisk. Another overlay already owns that listing."
                  : "A file does not take an upset note. An upset note is for the whisk on the table.",
      path: listingUpsetPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not upset it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not upset it. Still bent. Still metal. Still tote. Not quench. Not planish. Not truss.`,
    path: listingUpsetPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingUpsetPage({ params }: UpsetPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const upsetIds = parseUpsetListingIds(jar.get(UPSET_COOKIE_NAME)?.value);
  const sheet = upsetSheetForId(id, upsetIds);

  return <ListingUpsetView sheet={sheet} upsetIds={upsetIds} />;
}
