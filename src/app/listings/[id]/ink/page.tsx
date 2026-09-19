import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingInkView,
  type InkViewKind,
  type InkViewSheet,
} from "@/components/listing-ink-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  INK_COOKIE_NAME,
  INK_REFUSE_COPY,
  isListingInkOverlay,
  parseInkListingIds,
} from "@/lib/listing-ink";
import { listingInkPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type InkPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): InkViewKind {
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

function inkSheetForId(id: string, inkIds: string[]): InkViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isInk: listing ? isListingInkOverlay(listing.id, inkIds) : false,
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
}: InkPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const inkIds = parseInkListingIds(jar.get(INK_COOKIE_NAME)?.value);
  const sheet = inkSheetForId(id, inkIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: INK_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape the Sharpie on.",
      path: listingInkPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: INK_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not keep Sharpie."
          : "A file does not keep Sharpie. The handwriting stays on the CD-R.",
      path: listingInkPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The Sharpie stays · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Plays is I already spun it. This is the BEATS 07 CD-R handwriting. Still tote. Not plays. Not songs.`,
    path: listingInkPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingInkPage({ params }: InkPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const inkIds = parseInkListingIds(jar.get(INK_COOKIE_NAME)?.value);
  const sheet = inkSheetForId(id, inkIds);

  return <ListingInkView sheet={sheet} inkIds={inkIds} />;
}
