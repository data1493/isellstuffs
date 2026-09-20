import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBillboardView,
  type BillboardViewKind,
  type BillboardViewSheet,
} from "@/components/listing-billboard-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  BILLBOARD_COOKIE_NAME,
  BILLBOARD_DRAWER_ID,
  BILLBOARD_LID_ID,
  BILLBOARD_REFUSE_COPY,
  canTapeBillboard,
  isListingBillboardOverlay,
  parseBillboardListingIds,
} from "@/lib/listing-billboard";
import { listingBillboardPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BillboardPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BillboardViewKind {
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
  if (listing.id === BILLBOARD_DRAWER_ID) {
    return "drawer";
  }
  if (listing.id === BILLBOARD_LID_ID) {
    return "lid";
  }
  if (!canTapeBillboard(listing)) {
    return "owned";
  }
  return "physical";
}

function billboardSheetForId(id: string, billboardIds: string[]): BillboardViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBillboard: listing ? isListingBillboardOverlay(listing.id, billboardIds) : false,
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
}: BillboardPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const billboardIds = parseBillboardListingIds(
    jar.get(BILLBOARD_COOKIE_NAME)?.value,
  );
  const sheet = billboardSheetForId(id, billboardIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BILLBOARD_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a billboard note on.",
      path: listingBillboardPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: BILLBOARD_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a billboard note."
          : sheet.kind === "drawer"
            ? "A cable drawer does not take a billboard note. Billboard is Game Boy paper."
            : sheet.kind === "lid"
              ? "A pot lid does not take a billboard note. Billboard is Game Boy paper."
              : sheet.kind === "owned"
                ? "A billboard note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a billboard note. A billboard note is for the Game Boy on the table.",
      path: listingBillboardPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not billboard it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not billboard it. Still a crack. Still Tetris. Still tote. Not tombstone. Not squeegee. Not underfill.`,
    path: listingBillboardPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBillboardPage({ params }: BillboardPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const billboardIds = parseBillboardListingIds(
    jar.get(BILLBOARD_COOKIE_NAME)?.value,
  );
  const sheet = billboardSheetForId(id, billboardIds);

  return <ListingBillboardView sheet={sheet} billboardIds={billboardIds} />;
}
