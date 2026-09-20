import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSineView,
  type SineViewKind,
  type SineViewSheet,
} from "@/components/listing-sine-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SINE_CHAIR_ID,
  SINE_COOKIE_NAME,
  SINE_MUG_ID,
  SINE_REFUSE_COPY,
  SINE_WHISK_ID,
  canTapeSine,
  isListingSineOverlay,
  parseSineListingIds,
} from "@/lib/listing-sine";
import { listingSinePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SinePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SineViewKind {
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
    return listing.id === SINE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === SINE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === SINE_MUG_ID) {
    return "mug";
  }
  if (listing.id === SINE_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeSine(listing)) {
    return "owned";
  }
  return "physical";
}

function sineSheetForId(
  id: string,
  sineIds: string[],
): SineViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSine: listing
      ? isListingSineOverlay(listing.id, sineIds)
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
}: SinePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const sineIds = parseSineListingIds(
    jar.get(SINE_COOKIE_NAME)?.value,
  );
  const sheet = sineSheetForId(id, sineIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SINE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a sine note on.",
      path: listingSinePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SINE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a sine note."
          : sheet.kind === "mug"
            ? "A mug does not take a sine note. Sine honesty is for the pot lid."
            : sheet.kind === "whisk"
              ? "A whisk does not take a sine note. Sine honesty is for the pot lid."
              : sheet.kind === "chair"
                ? "A chair does not take a sine note. Sine honesty is for the pot lid."
                : sheet.kind === "owned"
                  ? "A sine note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a sine note. A sine note is for the lid on the table.",
      path: listingSinePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not sine it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not sine it. Still a lid. Still no pot. Still tote. Not wring. Not blanchard. Not countersink.`,
    path: listingSinePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSinePage({
  params,
}: SinePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const sineIds = parseSineListingIds(
    jar.get(SINE_COOKIE_NAME)?.value,
  );
  const sheet = sineSheetForId(id, sineIds);

  return <ListingSineView sheet={sheet} sineIds={sineIds} />;
}
