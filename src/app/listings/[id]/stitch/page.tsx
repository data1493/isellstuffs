import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingStitchView,
  type StitchViewKind,
  type StitchViewSheet,
} from "@/components/listing-stitch-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  STITCH_COOKIE_NAME,
  STITCH_REFUSE_COPY,
  isListingStitchOverlay,
  parseStitchListingIds,
} from "@/lib/listing-stitch";
import { listingStitchPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StitchPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): StitchViewKind {
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

function stitchSheetForId(id: string, stitchIds: string[]): StitchViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isStitch: listing ? isListingStitchOverlay(listing.id, stitchIds) : false,
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
}: StitchPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const stitchIds = parseStitchListingIds(jar.get(STITCH_COOKIE_NAME)?.value);
  const sheet = stitchSheetForId(id, stitchIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: STITCH_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a stitch note on.",
      path: listingStitchPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: STITCH_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a stitch note."
          : "A file does not take a stitch note. A stitch note is for a pair on the table.",
      path: listingStitchPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not stitch them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not stitch them. Still a pair. Still peeling. Still tote. Not sew. Not toe. Not cement.`,
    path: listingStitchPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingStitchPage({ params }: StitchPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const stitchIds = parseStitchListingIds(jar.get(STITCH_COOKIE_NAME)?.value);
  const sheet = stitchSheetForId(id, stitchIds);

  return <ListingStitchView sheet={sheet} stitchIds={stitchIds} />;
}
