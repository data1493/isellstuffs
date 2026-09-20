import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBlanchardView,
  type BlanchardViewKind,
  type BlanchardViewSheet,
} from "@/components/listing-blanchard-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  BLANCHARD_CHAIR_ID,
  BLANCHARD_COOKIE_NAME,
  BLANCHARD_MUG_ID,
  BLANCHARD_REFUSE_COPY,
  BLANCHARD_WHISK_ID,
  canTapeBlanchard,
  isListingBlanchardOverlay,
  parseBlanchardListingIds,
} from "@/lib/listing-blanchard";
import { listingBlanchardPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BlanchardPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BlanchardViewKind {
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
    return listing.id === BLANCHARD_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === BLANCHARD_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === BLANCHARD_MUG_ID) {
    return "mug";
  }
  if (listing.id === BLANCHARD_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeBlanchard(listing)) {
    return "owned";
  }
  return "physical";
}

function blanchardSheetForId(
  id: string,
  blanchardIds: string[],
): BlanchardViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBlanchard: listing
      ? isListingBlanchardOverlay(listing.id, blanchardIds)
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
}: BlanchardPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const blanchardIds = parseBlanchardListingIds(
    jar.get(BLANCHARD_COOKIE_NAME)?.value,
  );
  const sheet = blanchardSheetForId(id, blanchardIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BLANCHARD_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a blanchard note on.",
      path: listingBlanchardPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: BLANCHARD_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a blanchard note."
          : sheet.kind === "mug"
            ? "A mug does not take a blanchard note. Blanchard honesty is for the pot lid."
            : sheet.kind === "whisk"
              ? "A whisk does not take a blanchard note. Blanchard honesty is for the pot lid."
              : sheet.kind === "chair"
                ? "A chair does not take a blanchard note. Blanchard honesty is for the pot lid."
                : sheet.kind === "owned"
                  ? "A blanchard note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a blanchard note. A blanchard note is for the lid on the table.",
      path: listingBlanchardPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not blanchard it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not blanchard it. Still a lid. Still no pot. Still tote. Not dress. Not flycut. Not countersink.`,
    path: listingBlanchardPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBlanchardPage({
  params,
}: BlanchardPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const blanchardIds = parseBlanchardListingIds(
    jar.get(BLANCHARD_COOKIE_NAME)?.value,
  );
  const sheet = blanchardSheetForId(id, blanchardIds);

  return <ListingBlanchardView sheet={sheet} blanchardIds={blanchardIds} />;
}
