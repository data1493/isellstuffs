import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingNeedleView,
  type NeedleViewKind,
  type NeedleViewSheet,
} from "@/components/listing-needle-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  NEEDLE_COOKIE_NAME,
  NEEDLE_REFUSE_COPY,
  isListingNeedleOverlay,
  parseNeedleListingIds,
} from "@/lib/listing-needle";
import { listingNeedlePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type NeedlePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): NeedleViewKind {
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

function needleSheetForId(id: string, needleIds: string[]): NeedleViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isNeedle: listing ? isListingNeedleOverlay(listing.id, needleIds) : false,
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
}: NeedlePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const needleIds = parseNeedleListingIds(jar.get(NEEDLE_COOKIE_NAME)?.value);
  const sheet = needleSheetForId(id, needleIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: NEEDLE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a needle on.",
      path: listingNeedlePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: NEEDLE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a stylus."
          : "A file does not take a stylus. Needle honesty is for a player on the table.",
      path: listingNeedlePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The needle walked · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The stylus is not in the box. Skip is the LP scratch. Still tote. Not parts. Not remote.`,
    path: listingNeedlePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingNeedlePage({ params }: NeedlePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const needleIds = parseNeedleListingIds(jar.get(NEEDLE_COOKIE_NAME)?.value);
  const sheet = needleSheetForId(id, needleIds);

  return <ListingNeedleView sheet={sheet} needleIds={needleIds} />;
}
