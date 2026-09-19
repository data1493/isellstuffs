import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingDubView,
  type DubViewKind,
  type DubViewSheet,
} from "@/components/listing-dub-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  DUB_COOKIE_NAME,
  DUB_REFUSE_COPY,
  isListingDubOverlay,
  parseDubListingIds,
} from "@/lib/listing-dub";
import { listingDubPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DubPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): DubViewKind {
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

function dubSheetForId(id: string, dubIds: string[]): DubViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isDub: listing ? isListingDubOverlay(listing.id, dubIds) : false,
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
}: DubPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const dubIds = parseDubListingIds(jar.get(DUB_COOKIE_NAME)?.value);
  const sheet = dubSheetForId(id, dubIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: DUB_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a dub note on.",
      path: listingDubPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: DUB_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a cassette."
          : "A liner PDF is not a tape. Dub honesty is for a cassette on the table.",
      path: listingDubPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not dub it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not dub it. Still hiss. Still a radio edit. Still tote. Not rip. Not a shop. Not wind.`,
    path: listingDubPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingDubPage({ params }: DubPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const dubIds = parseDubListingIds(jar.get(DUB_COOKIE_NAME)?.value);
  const sheet = dubSheetForId(id, dubIds);

  return <ListingDubView sheet={sheet} dubIds={dubIds} />;
}
