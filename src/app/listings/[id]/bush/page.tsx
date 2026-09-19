import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBushView,
  type BushViewKind,
  type BushViewSheet,
} from "@/components/listing-bush-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  BUSH_CHAIR_ID,
  BUSH_COOKIE_NAME,
  BUSH_LID_ID,
  BUSH_REFUSE_COPY,
  canTapeBush,
  isListingBushOverlay,
  parseBushListingIds,
} from "@/lib/listing-bush";
import { listingHubName } from "@/lib/listing-display";
import { listingBushPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BushPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BushViewKind {
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
    return listing.id === BUSH_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === BUSH_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === BUSH_LID_ID) {
    return "lid";
  }
  if (!canTapeBush(listing)) {
    return "owned";
  }
  return "physical";
}

function bushSheetForId(id: string, bushIds: string[]): BushViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBush: listing ? isListingBushOverlay(listing.id, bushIds) : false,
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
}: BushPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const bushIds = parseBushListingIds(jar.get(BUSH_COOKIE_NAME)?.value);
  const sheet = bushSheetForId(id, bushIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BUSH_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a bush note on.",
      path: listingBushPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: BUSH_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a bush note."
          : sheet.kind === "chair"
            ? "A chair does not take a bush note. Bush is a lamp neck."
            : sheet.kind === "lid"
              ? "A lid does not take a bush note. Bush is a lamp neck."
              : sheet.kind === "owned"
                ? "A bush note is for the wobbly lamp. Another overlay already owns that listing."
                : "A file does not take a bush note. A bush note is for the lamp on the table.",
      path: listingBushPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not bush it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not bush it. Still wobbly. Still lights. Still tote. Not shim. Not rivet. Not socket.`,
    path: listingBushPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBushPage({ params }: BushPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const bushIds = parseBushListingIds(jar.get(BUSH_COOKIE_NAME)?.value);
  const sheet = bushSheetForId(id, bushIds);

  return <ListingBushView sheet={sheet} bushIds={bushIds} />;
}
