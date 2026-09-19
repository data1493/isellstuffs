import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingToeView,
  type ToeViewKind,
  type ToeViewSheet,
} from "@/components/listing-toe-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  TOE_COOKIE_NAME,
  TOE_REFUSE_COPY,
  isListingToeOverlay,
  parseToeListingIds,
} from "@/lib/listing-toe";
import { listingToePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ToePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ToeViewKind {
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
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function toeSheetForId(id: string, toeIds: string[]): ToeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isToe: listing ? isListingToeOverlay(listing.id, toeIds) : false,
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
}: ToePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const toeIds = parseToeListingIds(jar.get(TOE_COOKIE_NAME)?.value);
  const sheet = toeSheetForId(id, toeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: TOE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a peel on.",
      path: listingToePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: TOE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not peel a sole."
          : "A file does not peel a sole. Peel honesty is for sneakers on the table.",
      path: listingToePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The peel stays · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The sole already peeled. Laces is the pair that stayed home. Still tote. Not laces. Not an offer peel.`,
    path: listingToePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingToePage({ params }: ToePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const toeIds = parseToeListingIds(jar.get(TOE_COOKIE_NAME)?.value);
  const sheet = toeSheetForId(id, toeIds);

  return <ListingToeView sheet={sheet} toeIds={toeIds} />;
}
