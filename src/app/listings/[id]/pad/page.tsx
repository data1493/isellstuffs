import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPadView,
  type PadViewKind,
  type PadViewSheet,
} from "@/components/listing-pad-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  PAD_COOKIE_NAME,
  PAD_REFUSE_COPY,
  isListingPadOverlay,
  parsePadListingIds,
} from "@/lib/listing-pad";
import { listingPadPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PadPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PadViewKind {
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

function padSheetForId(id: string, padIds: string[]): PadViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPad: listing ? isListingPadOverlay(listing.id, padIds) : false,
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
}: PadPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const padIds = parsePadListingIds(jar.get(PAD_COOKIE_NAME)?.value);
  const sheet = padSheetForId(id, padIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PAD_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a pad note on.",
      path: listingPadPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: PAD_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a pad note."
          : "A recipe scan does not take a pad. A pad note is for a pair on the table.",
      path: listingPadPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not pad them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not pad them. Peel stays. Still a pair. Still tote. Not stretch. Not a cobbler. Not cement.`,
    path: listingPadPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPadPage({ params }: PadPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const padIds = parsePadListingIds(jar.get(PAD_COOKIE_NAME)?.value);
  const sheet = padSheetForId(id, padIds);

  return <ListingPadView sheet={sheet} padIds={padIds} />;
}
