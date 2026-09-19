import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingClipView,
  type ClipViewKind,
  type ClipViewSheet,
} from "@/components/listing-clip-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CLIP_COOKIE_NAME,
  CLIP_REFUSE_COPY,
  isListingClipOverlay,
  parseClipListingIds,
} from "@/lib/listing-clip";
import { listingClipPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ClipPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ClipViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
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

function clipSheetForId(id: string, clipIds: string[]): ClipViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isClip: listing ? isListingClipOverlay(listing.id, clipIds) : false,
    title: listing?.title ?? null,
    priceLabel: listing ? formatMoney(listing.price) : null,
    fact: listing
      ? isDigitalListing(listing)
        ? listing.fileFormat
        : listing.condition
      : null,
    stallName: stall?.boothName ?? listing?.stallId ?? null,
    stallSlug: stall?.slug ?? null,
    hubName: listing ? listingHubName(listing) : null,
    listing: listing ?? null,
  };
}

export async function generateMetadata({
  params,
}: ClipPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const clipIds = parseClipListingIds(jar.get(CLIP_COOKIE_NAME)?.value);
  const sheet = clipSheetForId(id, clipIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CLIP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a missing clip on.",
      path: listingClipPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: CLIP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not miss a paper clip."
          : "A lamp does not miss a clip. Paper-clip honesty is for a scanned stack on the digital lot.",
      path: listingClipPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The clip walked · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The paper clip is gone. Remote is the clicker. Key is the cabinet key. This is a stack of paper missing its clip. Still tote. Not lost. Not remote.`,
    path: listingClipPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingClipPage({ params }: ClipPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const clipIds = parseClipListingIds(jar.get(CLIP_COOKIE_NAME)?.value);
  const sheet = clipSheetForId(id, clipIds);

  return <ListingClipView sheet={sheet} clipIds={clipIds} />;
}
