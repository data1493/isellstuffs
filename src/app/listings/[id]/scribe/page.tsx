import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingScribeView,
  type ScribeViewKind,
  type ScribeViewSheet,
} from "@/components/listing-scribe-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SCRIBE_CHAIR_ID,
  SCRIBE_COOKIE_NAME,
  SCRIBE_MUG_ID,
  SCRIBE_REFUSE_COPY,
  SCRIBE_WHISK_ID,
  canTapeScribe,
  isListingScribeOverlay,
  parseScribeListingIds,
} from "@/lib/listing-scribe";
import { listingScribePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ScribePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ScribeViewKind {
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
    return listing.id === SCRIBE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === SCRIBE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === SCRIBE_MUG_ID) {
    return "mug";
  }
  if (listing.id === SCRIBE_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeScribe(listing)) {
    return "owned";
  }
  return "physical";
}

function scribeSheetForId(id: string, scribeIds: string[]): ScribeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isScribe: listing ? isListingScribeOverlay(listing.id, scribeIds) : false,
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
}: ScribePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const scribeIds = parseScribeListingIds(jar.get(SCRIBE_COOKIE_NAME)?.value);
  const sheet = scribeSheetForId(id, scribeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SCRIBE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a scribe note on.",
      path: listingScribePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SCRIBE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a scribe note."
          : sheet.kind === "mug"
            ? "A mug does not take a scribe note. Scribe is a pot-lid scratch."
            : sheet.kind === "whisk"
              ? "A whisk does not take a scribe note. Scribe is a pot-lid scratch."
              : sheet.kind === "chair"
                ? "A chair does not take a scribe note. Scribe is a pot-lid scratch."
                : sheet.kind === "owned"
                  ? "A scribe note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a scribe note. A scribe note is for the lid on the table.",
      path: listingScribePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not scribe it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not scribe it. Still a lid. Still no pot. Still tote. Not knurl. Not saucepan. Not glass.`,
    path: listingScribePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingScribePage({ params }: ScribePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const scribeIds = parseScribeListingIds(jar.get(SCRIBE_COOKIE_NAME)?.value);
  const sheet = scribeSheetForId(id, scribeIds);

  return <ListingScribeView sheet={sheet} scribeIds={scribeIds} />;
}
