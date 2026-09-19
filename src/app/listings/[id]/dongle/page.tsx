import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingDongleView,
  type DongleViewKind,
  type DongleViewSheet,
} from "@/components/listing-dongle-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  DONGLE_COOKIE_NAME,
  DONGLE_REFUSE_COPY,
  isListingDongleOverlay,
  parseDongleListingIds,
} from "@/lib/listing-dongle";
import { listingDonglePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DonglePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): DongleViewKind {
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

function dongleSheetForId(id: string, dongleIds: string[]): DongleViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isDongle: listing ? isListingDongleOverlay(listing.id, dongleIds) : false,
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
}: DonglePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const dongleIds = parseDongleListingIds(jar.get(DONGLE_COOKIE_NAME)?.value);
  const sheet = dongleSheetForId(id, dongleIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: DONGLE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a dongle note on.",
      path: listingDonglePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: DONGLE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a dongle note."
          : "A file does not take a dongle note. A dongle note is for a drawer on the table.",
      path: listingDonglePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I don't have a dongle · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I don't have a dongle. Sold as a pile. Still tote. Not a cable counter. Still for sale.`,
    path: listingDonglePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingDonglePage({ params }: DonglePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const dongleIds = parseDongleListingIds(jar.get(DONGLE_COOKIE_NAME)?.value);
  const sheet = dongleSheetForId(id, dongleIds);

  return <ListingDongleView sheet={sheet} dongleIds={dongleIds} />;
}
