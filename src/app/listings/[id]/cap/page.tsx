import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCapView,
  type CapViewKind,
  type CapViewSheet,
} from "@/components/listing-cap-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CAP_COOKIE_NAME,
  CAP_REFUSE_COPY,
  isListingCapOverlay,
  parseCapListingIds,
} from "@/lib/listing-cap";
import { listingCapPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CapPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CapViewKind {
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

function capSheetForId(id: string, capIds: string[]): CapViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCap: listing ? isListingCapOverlay(listing.id, capIds) : false,
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
}: CapPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const capIds = parseCapListingIds(jar.get(CAP_COOKIE_NAME)?.value);
  const sheet = capSheetForId(id, capIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CAP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a cap note on.",
      path: listingCapPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: CAP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a cap note."
          : "A recipe PDF is not a mug. A cap note is for a diner mug on the table.",
      path: listingCapPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I don't have a cap · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I don't have a cap. Open mug. Still holds coffee. Still tote. Not a lid shop. Still for sale.`,
    path: listingCapPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCapPage({ params }: CapPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const capIds = parseCapListingIds(jar.get(CAP_COOKIE_NAME)?.value);
  const sheet = capSheetForId(id, capIds);

  return <ListingCapView sheet={sheet} capIds={capIds} />;
}
