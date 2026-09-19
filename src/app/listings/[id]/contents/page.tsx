import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingContentsView,
  type ContentsViewKind,
  type ContentsViewSheet,
} from "@/components/listing-contents-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CONTENTS_COOKIE_NAME,
  CONTENTS_REFUSE_COPY,
  isListingContentsOverlay,
  parseContentsListingIds,
} from "@/lib/listing-contents";
import { listingContentsPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ContentsPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ContentsViewKind {
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

function contentsSheetForId(id: string, contentsIds: string[]): ContentsViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isContents: listing ? isListingContentsOverlay(listing.id, contentsIds) : false,
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
}: ContentsPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const contentsIds = parseContentsListingIds(
    jar.get(CONTENTS_COOKIE_NAME)?.value,
  );
  const sheet = contentsSheetForId(id, contentsIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CONTENTS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a contents note on.",
      path: listingContentsPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: CONTENTS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a contents note."
          : "A file does not take a contents note. A contents note is for a disc on the table.",
      path: listingContentsPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not list what’s on it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not list what’s on it. Still Sharpie. Still scratched. Still tote. Not ink. Not a rip. Not master.`,
    path: listingContentsPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingContentsPage({
  params,
}: ContentsPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const contentsIds = parseContentsListingIds(
    jar.get(CONTENTS_COOKIE_NAME)?.value,
  );
  const sheet = contentsSheetForId(id, contentsIds);

  return <ListingContentsView sheet={sheet} contentsIds={contentsIds} />;
}
