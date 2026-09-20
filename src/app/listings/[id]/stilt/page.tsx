import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingStiltView,
  type StiltViewKind,
  type StiltViewSheet,
} from "@/components/listing-stilt-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  STILT_CHAIR_ID,
  STILT_COOKIE_NAME,
  STILT_LID_ID,
  STILT_REFUSE_COPY,
  STILT_WHISK_ID,
  canTapeStilt,
  isListingStiltOverlay,
  parseStiltListingIds,
} from "@/lib/listing-stilt";
import { listingStiltPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StiltPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): StiltViewKind {
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
    return listing.id === STILT_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === STILT_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === STILT_LID_ID) {
    return "lid";
  }
  if (listing.id === STILT_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeStilt(listing)) {
    return "owned";
  }
  return "physical";
}

function stiltSheetForId(id: string, stiltIds: string[]): StiltViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isStilt: listing ? isListingStiltOverlay(listing.id, stiltIds) : false,
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
}: StiltPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const stiltIds = parseStiltListingIds(jar.get(STILT_COOKIE_NAME)?.value);
  const sheet = stiltSheetForId(id, stiltIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: STILT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a stilt note on.",
      path: listingStiltPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: STILT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a stilt note."
          : sheet.kind === "lid"
            ? "A lid does not take a stilt note. Stilt is a mug kiln note."
            : sheet.kind === "whisk"
              ? "A whisk does not take a stilt note. Stilt is a mug kiln note."
              : sheet.kind === "chair"
                ? "A chair does not take a stilt note. Stilt is a mug kiln note."
                : sheet.kind === "owned"
                  ? "A stilt note is for the diner mug. Another overlay already owns that listing."
                  : "A file does not take a stilt note. A stilt note is for the mug on the table.",
      path: listingStiltPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not stilt it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not stilt it. Still a diner rim. Still holds coffee. Still tote. Not sprig. Not salt. Not jigger.`,
    path: listingStiltPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingStiltPage({ params }: StiltPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const stiltIds = parseStiltListingIds(jar.get(STILT_COOKIE_NAME)?.value);
  const sheet = stiltSheetForId(id, stiltIds);

  return <ListingStiltView sheet={sheet} stiltIds={stiltIds} />;
}
