import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingMasterView,
  type MasterViewKind,
  type MasterViewSheet,
} from "@/components/listing-master-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  MASTER_COOKIE_NAME,
  MASTER_REFUSE_COPY,
  isListingMasterOverlay,
  parseMasterListingIds,
} from "@/lib/listing-master";
import { listingMasterPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type MasterPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): MasterViewKind {
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

function masterSheetForId(id: string, masterIds: string[]): MasterViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isMaster: listing ? isListingMasterOverlay(listing.id, masterIds) : false,
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
}: MasterPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const masterIds = parseMasterListingIds(jar.get(MASTER_COOKIE_NAME)?.value);
  const sheet = masterSheetForId(id, masterIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: MASTER_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a master note on.",
      path: listingMasterPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: MASTER_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a master note."
          : "A file does not take a master note. A master note is for a burn on the table.",
      path: listingMasterPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I don't have the master · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I don't have the master. This burn. Still spins. Still tote. Still for sale.`,
    path: listingMasterPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingMasterPage({ params }: MasterPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const masterIds = parseMasterListingIds(jar.get(MASTER_COOKIE_NAME)?.value);
  const sheet = masterSheetForId(id, masterIds);

  return <ListingMasterView sheet={sheet} masterIds={masterIds} />;
}
