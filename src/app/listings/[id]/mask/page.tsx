import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingMaskView,
  type MaskViewKind,
  type MaskViewSheet,
} from "@/components/listing-mask-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  MASK_COOKIE_NAME,
  MASK_LUT_ID,
  MASK_PACK_ID,
  MASK_REFUSE_COPY,
  canTapeMask,
  isListingMaskOverlay,
  parseMaskListingIds,
} from "@/lib/listing-mask";
import { listingMaskPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type MaskPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): MaskViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (listing.id === MASK_LUT_ID) {
    return "lut";
  }
  if (listing.id === MASK_PACK_ID) {
    return "pack";
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
  if (!canTapeMask(listing)) {
    return "owned";
  }
  return "physical";
}

function maskSheetForId(id: string, maskIds: string[]): MaskViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isMask: listing ? isListingMaskOverlay(listing.id, maskIds) : false,
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
}: MaskPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const maskIds = parseMaskListingIds(jar.get(MASK_COOKIE_NAME)?.value);
  const sheet = maskSheetForId(id, maskIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: MASK_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a mask note on.",
      path: listingMaskPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: MASK_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a mask note."
          : sheet.kind === "lut"
            ? "A LUT pack does not take a mask note. Mask is a Game Boy board."
            : sheet.kind === "pack"
              ? "A sample pack does not take a mask note. Mask is a Game Boy board."
              : sheet.kind === "owned"
                ? "A mask note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a mask note. A mask note is for the Game Boy on the table.",
      path: listingMaskPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not mask it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not mask it. Still a board. Still fused. Still tote. Not deox. Not reflow. Not a shop. Not shield.`,
    path: listingMaskPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingMaskPage({ params }: MaskPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const maskIds = parseMaskListingIds(jar.get(MASK_COOKIE_NAME)?.value);
  const sheet = maskSheetForId(id, maskIds);

  return <ListingMaskView sheet={sheet} maskIds={maskIds} />;
}
