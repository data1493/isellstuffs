import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGasketView,
  type GasketViewKind,
  type GasketViewSheet,
} from "@/components/listing-gasket-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GASKET_COOKIE_NAME,
  GASKET_REFUSE_COPY,
  isListingGasketOverlay,
  parseGasketListingIds,
} from "@/lib/listing-gasket";
import { listingGasketPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GasketPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GasketViewKind {
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

function gasketSheetForId(id: string, gasketIds: string[]): GasketViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGasket: listing ? isListingGasketOverlay(listing.id, gasketIds) : false,
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
}: GasketPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const gasketIds = parseGasketListingIds(jar.get(GASKET_COOKIE_NAME)?.value);
  const sheet = gasketSheetForId(id, gasketIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GASKET_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a gasket note on.",
      path: listingGasketPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: GASKET_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a gasket."
          : "A file does not take a gasket. A gasket note is for a lid on the table.",
      path: listingGasketPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not gasket · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not gasket. Knob wiggles. Still a lid. Still tote. Still for sale.`,
    path: listingGasketPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGasketPage({ params }: GasketPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const gasketIds = parseGasketListingIds(jar.get(GASKET_COOKIE_NAME)?.value);
  const sheet = gasketSheetForId(id, gasketIds);

  return <ListingGasketView sheet={sheet} gasketIds={gasketIds} />;
}
