import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSqueegeeView,
  type SqueegeeViewKind,
  type SqueegeeViewSheet,
} from "@/components/listing-squeegee-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SQUEEGEE_COOKIE_NAME,
  SQUEEGEE_DRAWER_ID,
  SQUEEGEE_LID_ID,
  SQUEEGEE_REFUSE_COPY,
  canTapeSqueegee,
  isListingSqueegeeOverlay,
  parseSqueegeeListingIds,
} from "@/lib/listing-squeegee";
import { listingSqueegeePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SqueegeePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SqueegeeViewKind {
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
  if (listing.id === SQUEEGEE_DRAWER_ID) {
    return "drawer";
  }
  if (listing.id === SQUEEGEE_LID_ID) {
    return "lid";
  }
  if (!canTapeSqueegee(listing)) {
    return "owned";
  }
  return "physical";
}

function squeegeeSheetForId(id: string, squeegeeIds: string[]): SqueegeeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSqueegee: listing ? isListingSqueegeeOverlay(listing.id, squeegeeIds) : false,
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
}: SqueegeePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const squeegeeIds = parseSqueegeeListingIds(
    jar.get(SQUEEGEE_COOKIE_NAME)?.value,
  );
  const sheet = squeegeeSheetForId(id, squeegeeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SQUEEGEE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a squeegee note on.",
      path: listingSqueegeePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SQUEEGEE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a squeegee note."
          : sheet.kind === "drawer"
            ? "A cable drawer does not take a squeegee note. Squeegee is Game Boy paste."
            : sheet.kind === "lid"
              ? "A pot lid does not take a squeegee note. Squeegee is Game Boy paste."
              : sheet.kind === "owned"
                ? "A squeegee note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a squeegee note. A squeegee note is for the Game Boy on the table.",
      path: listingSqueegeePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not squeegee it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not squeegee it. Still a crack. Still Tetris. Still tote. Not dam. Not globtop. Not underfill.`,
    path: listingSqueegeePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSqueegeePage({ params }: SqueegeePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const squeegeeIds = parseSqueegeeListingIds(
    jar.get(SQUEEGEE_COOKIE_NAME)?.value,
  );
  const sheet = squeegeeSheetForId(id, squeegeeIds);

  return <ListingSqueegeeView sheet={sheet} squeegeeIds={squeegeeIds} />;
}
