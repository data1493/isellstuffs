import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingFilletView,
  type FilletViewKind,
  type FilletViewSheet,
} from "@/components/listing-fillet-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  FILLET_COOKIE_NAME,
  FILLET_DRAWER_ID,
  FILLET_LID_ID,
  FILLET_REFUSE_COPY,
  canTapeFillet,
  isListingFilletOverlay,
  parseFilletListingIds,
} from "@/lib/listing-fillet";
import { listingFilletPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FilletPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): FilletViewKind {
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
  if (listing.id === FILLET_DRAWER_ID) {
    return "drawer";
  }
  if (listing.id === FILLET_LID_ID) {
    return "lid";
  }
  if (!canTapeFillet(listing)) {
    return "owned";
  }
  return "physical";
}

function filletSheetForId(id: string, filletIds: string[]): FilletViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isFillet: listing ? isListingFilletOverlay(listing.id, filletIds) : false,
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
}: FilletPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const filletIds = parseFilletListingIds(jar.get(FILLET_COOKIE_NAME)?.value);
  const sheet = filletSheetForId(id, filletIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: FILLET_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a fillet note on.",
      path: listingFilletPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: FILLET_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a fillet note."
          : sheet.kind === "drawer"
            ? "A cable drawer does not take a fillet note. Fillet is a Game Boy solder note."
            : sheet.kind === "lid"
              ? "A pot lid does not take a fillet note. Fillet is a Game Boy solder note."
              : sheet.kind === "owned"
                ? "A fillet note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a fillet note. A fillet note is for the Game Boy on the table.",
      path: listingFilletPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not fillet it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not fillet it. Still a crack. Still Tetris. Still tote. Not pogo. Not underfill. Not reball.`,
    path: listingFilletPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingFilletPage({ params }: FilletPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const filletIds = parseFilletListingIds(jar.get(FILLET_COOKIE_NAME)?.value);
  const sheet = filletSheetForId(id, filletIds);

  return <ListingFilletView sheet={sheet} filletIds={filletIds} />;
}
