import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingVgView,
  type VgViewKind,
  type VgViewSheet,
} from "@/components/listing-vg-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  VG_COOKIE_NAME,
  VG_REFUSE_COPY,
  isListingVgOverlay,
  parseVgListingIds,
} from "@/lib/listing-vg";
import { listingVgPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type VgPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): VgViewKind {
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

function vgSheetForId(id: string, vgIds: string[]): VgViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isVg: listing ? isListingVgOverlay(listing.id, vgIds) : false,
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
}: VgPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const vgIds = parseVgListingIds(jar.get(VG_COOKIE_NAME)?.value);
  const sheet = vgSheetForId(id, vgIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: VG_REFUSE_COPY,
      description: "No SKU with that id. Nothing to leave on the record.",
      path: listingVgPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: VG_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a record."
          : "A liner PDF is not a VG. VG honesty is for a record on the table.",
      path: listingVgPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not VG it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Plays. Skips the chorus. Still tote. Not skip. Not a Goldmine desk. Not press.`,
    path: listingVgPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingVgPage({ params }: VgPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const vgIds = parseVgListingIds(jar.get(VG_COOKIE_NAME)?.value);
  const sheet = vgSheetForId(id, vgIds);

  return <ListingVgView sheet={sheet} vgIds={vgIds} />;
}
