import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCoilView,
  type CoilViewKind,
  type CoilViewSheet,
} from "@/components/listing-coil-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  COIL_COOKIE_NAME,
  COIL_REFUSE_COPY,
  isListingCoilOverlay,
  parseCoilListingIds,
} from "@/lib/listing-coil";
import { listingCoilPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CoilPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CoilViewKind {
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

function coilSheetForId(id: string, coilIds: string[]): CoilViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCoil: listing ? isListingCoilOverlay(listing.id, coilIds) : false,
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
}: CoilPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const coilIds = parseCoilListingIds(jar.get(COIL_COOKIE_NAME)?.value);
  const sheet = coilSheetForId(id, coilIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: COIL_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a coil note on.",
      path: listingCoilPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: COIL_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a coil note."
          : "A file does not take a coil note. A coil note is for a drawer on the table.",
      path: listingCoilPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not coil them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not coil them. Still a pile. Still mystery ends. Still tote. Not pile. Not a shop. Not label.`,
    path: listingCoilPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCoilPage({ params }: CoilPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const coilIds = parseCoilListingIds(jar.get(COIL_COOKIE_NAME)?.value);
  const sheet = coilSheetForId(id, coilIds);

  return <ListingCoilView sheet={sheet} coilIds={coilIds} />;
}
