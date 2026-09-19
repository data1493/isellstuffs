import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingDeoxView,
  type DeoxViewKind,
  type DeoxViewSheet,
} from "@/components/listing-deox-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  DEOX_COOKIE_NAME,
  DEOX_LUT_ID,
  DEOX_PACK_ID,
  DEOX_REFUSE_COPY,
  canTapeDeox,
  isListingDeoxOverlay,
  parseDeoxListingIds,
} from "@/lib/listing-deox";
import { listingDeoxPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DeoxPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): DeoxViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (listing.id === DEOX_LUT_ID) {
    return "lut";
  }
  if (listing.id === DEOX_PACK_ID) {
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
  if (!canTapeDeox(listing)) {
    return "owned";
  }
  return "physical";
}

function deoxSheetForId(id: string, deoxIds: string[]): DeoxViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isDeox: listing ? isListingDeoxOverlay(listing.id, deoxIds) : false,
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
}: DeoxPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const deoxIds = parseDeoxListingIds(jar.get(DEOX_COOKIE_NAME)?.value);
  const sheet = deoxSheetForId(id, deoxIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: DEOX_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a deox note on.",
      path: listingDeoxPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: DEOX_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a deox note."
          : sheet.kind === "lut"
            ? "A LUT pack does not take a deox note. Deox is a Game Boy cart."
            : sheet.kind === "pack"
              ? "A sample pack does not take a deox note. Deox is a Game Boy cart."
              : sheet.kind === "owned"
                ? "A deox note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a deox note. A deox note is for the Game Boy on the table.",
      path: listingDeoxPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not deox it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not deox it. Still a line. Still Tetris. Still tote. Not reflow. Not speaker. Not a shop. Not line.`,
    path: listingDeoxPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingDeoxPage({ params }: DeoxPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const deoxIds = parseDeoxListingIds(jar.get(DEOX_COOKIE_NAME)?.value);
  const sheet = deoxSheetForId(id, deoxIds);

  return <ListingDeoxView sheet={sheet} deoxIds={deoxIds} />;
}
