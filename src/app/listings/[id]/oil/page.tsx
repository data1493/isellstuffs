import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingOilView,
  type OilViewKind,
  type OilViewSheet,
} from "@/components/listing-oil-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  OIL_COOKIE_NAME,
  OIL_REFUSE_COPY,
  isListingOilOverlay,
  parseOilListingIds,
} from "@/lib/listing-oil";
import { listingOilPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type OilPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): OilViewKind {
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

function oilSheetForId(id: string, oilIds: string[]): OilViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isOil: listing ? isListingOilOverlay(listing.id, oilIds) : false,
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
}: OilPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const oilIds = parseOilListingIds(jar.get(OIL_COOKIE_NAME)?.value);
  const sheet = oilSheetForId(id, oilIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: OIL_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape oil on.",
      path: listingOilPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: OIL_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not squeak."
          : "A file does not squeak. Oil honesty is for a kitchen tool on the table.",
      path: listingOilPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Needs a drop of oil · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Hinge is the jewel snap. This is a kitchen tool that squeaks. Still tote. Not parts. Not hinge.`,
    path: listingOilPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingOilPage({ params }: OilPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const oilIds = parseOilListingIds(jar.get(OIL_COOKIE_NAME)?.value);
  const sheet = oilSheetForId(id, oilIds);

  return <ListingOilView sheet={sheet} oilIds={oilIds} />;
}
