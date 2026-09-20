import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBlackpadView,
  type BlackpadViewKind,
  type BlackpadViewSheet,
} from "@/components/listing-blackpad-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  BLACKPAD_COOKIE_NAME,
  BLACKPAD_DRAWER_ID,
  BLACKPAD_LID_ID,
  BLACKPAD_REFUSE_COPY,
  canTapeBlackpad,
  isListingBlackpadOverlay,
  parseBlackpadListingIds,
} from "@/lib/listing-blackpad";
import { listingBlackpadPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BlackpadPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BlackpadViewKind {
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
  if (listing.id === BLACKPAD_DRAWER_ID) {
    return "drawer";
  }
  if (listing.id === BLACKPAD_LID_ID) {
    return "lid";
  }
  if (!canTapeBlackpad(listing)) {
    return "owned";
  }
  return "physical";
}

function blackpadSheetForId(id: string, blackpadIds: string[]): BlackpadViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBlackpad: listing ? isListingBlackpadOverlay(listing.id, blackpadIds) : false,
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
}: BlackpadPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const blackpadIds = parseBlackpadListingIds(
    jar.get(BLACKPAD_COOKIE_NAME)?.value,
  );
  const sheet = blackpadSheetForId(id, blackpadIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BLACKPAD_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a blackpad note on.",
      path: listingBlackpadPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: BLACKPAD_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a blackpad note."
          : sheet.kind === "drawer"
            ? "A cable drawer does not take a blackpad note. Blackpad is Game Boy paper."
            : sheet.kind === "lid"
              ? "A pot lid does not take a blackpad note. Blackpad is Game Boy paper."
              : sheet.kind === "owned"
                ? "A blackpad note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a blackpad note. A blackpad note is for the Game Boy on the table.",
      path: listingBlackpadPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not blackpad it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not blackpad it. Still a crack. Still Tetris. Still tote. Not blowhole. Not icicle. Not underfill.`,
    path: listingBlackpadPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBlackpadPage({ params }: BlackpadPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const blackpadIds = parseBlackpadListingIds(
    jar.get(BLACKPAD_COOKIE_NAME)?.value,
  );
  const sheet = blackpadSheetForId(id, blackpadIds);

  return <ListingBlackpadView sheet={sheet} blackpadIds={blackpadIds} />;
}
