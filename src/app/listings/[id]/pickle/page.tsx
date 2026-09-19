import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPickleView,
  type PickleViewKind,
  type PickleViewSheet,
} from "@/components/listing-pickle-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  PICKLE_CHAIR_ID,
  PICKLE_COOKIE_NAME,
  PICKLE_LID_ID,
  PICKLE_REFUSE_COPY,
  PICKLE_WHISK_ID,
  canTapePickle,
  isListingPickleOverlay,
  parsePickleListingIds,
} from "@/lib/listing-pickle";
import { listingPicklePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PicklePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PickleViewKind {
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
    return listing.id === PICKLE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === PICKLE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === PICKLE_LID_ID) {
    return "lid";
  }
  if (listing.id === PICKLE_WHISK_ID) {
    return "whisk";
  }
  if (!canTapePickle(listing)) {
    return "owned";
  }
  return "physical";
}

function pickleSheetForId(id: string, pickleIds: string[]): PickleViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPickle: listing ? isListingPickleOverlay(listing.id, pickleIds) : false,
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
}: PicklePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const pickleIds = parsePickleListingIds(jar.get(PICKLE_COOKIE_NAME)?.value);
  const sheet = pickleSheetForId(id, pickleIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PICKLE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a pickle note on.",
      path: listingPicklePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: PICKLE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a pickle note."
          : sheet.kind === "lid"
            ? "A lid does not take a pickle note. Pickle is a mug craze."
            : sheet.kind === "whisk"
              ? "A whisk does not take a pickle note. Pickle is a mug craze."
              : sheet.kind === "chair"
                ? "A chair does not take a pickle note. Pickle is a mug craze."
                : sheet.kind === "owned"
                  ? "A pickle note is for the diner mug. Another overlay already owns that listing."
                  : "A file does not take a pickle note. A pickle note is for the mug on the table.",
      path: listingPicklePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not pickle it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not pickle it. Still chipped. Still a mug. Still tote. Not glaze. Not soap. Not chip.`,
    path: listingPicklePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPicklePage({ params }: PicklePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const pickleIds = parsePickleListingIds(jar.get(PICKLE_COOKIE_NAME)?.value);
  const sheet = pickleSheetForId(id, pickleIds);

  return <ListingPickleView sheet={sheet} pickleIds={pickleIds} />;
}
