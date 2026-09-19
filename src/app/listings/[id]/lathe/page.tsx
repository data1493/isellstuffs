import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingLatheView,
  type LatheViewKind,
  type LatheViewSheet,
} from "@/components/listing-lathe-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  LATHE_COOKIE_NAME,
  LATHE_REFUSE_COPY,
  isListingLatheOverlay,
  parseLatheListingIds,
} from "@/lib/listing-lathe";
import { listingLathePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type LathePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): LatheViewKind {
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

function latheSheetForId(id: string, latheIds: string[]): LatheViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isLathe: listing ? isListingLatheOverlay(listing.id, latheIds) : false,
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
}: LathePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const latheIds = parseLatheListingIds(jar.get(LATHE_COOKIE_NAME)?.value);
  const sheet = latheSheetForId(id, latheIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: LATHE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a lathe note on.",
      path: listingLathePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: LATHE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a lathe note."
          : "A file does not take a lathe note. A lathe note is for a disc on the table.",
      path: listingLathePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not lathe it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not lathe it. Still scratched. Still Sharpie. Still tote. Not polish. Not ink. Not plays.`,
    path: listingLathePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingLathePage({ params }: LathePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const latheIds = parseLatheListingIds(jar.get(LATHE_COOKIE_NAME)?.value);
  const sheet = latheSheetForId(id, latheIds);

  return <ListingLatheView sheet={sheet} latheIds={latheIds} />;
}
