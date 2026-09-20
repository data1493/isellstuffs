import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingDewetView,
  type DewetViewKind,
  type DewetViewSheet,
} from "@/components/listing-dewet-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  DEWET_COOKIE_NAME,
  DEWET_DRAWER_ID,
  DEWET_LID_ID,
  DEWET_REFUSE_COPY,
  canTapeDewet,
  isListingDewetOverlay,
  parseDewetListingIds,
} from "@/lib/listing-dewet";
import { listingDewetPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DewetPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): DewetViewKind {
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
  if (listing.id === DEWET_DRAWER_ID) {
    return "drawer";
  }
  if (listing.id === DEWET_LID_ID) {
    return "lid";
  }
  if (!canTapeDewet(listing)) {
    return "owned";
  }
  return "physical";
}

function dewetSheetForId(id: string, dewetIds: string[]): DewetViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isDewet: listing ? isListingDewetOverlay(listing.id, dewetIds) : false,
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
}: DewetPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const dewetIds = parseDewetListingIds(
    jar.get(DEWET_COOKIE_NAME)?.value,
  );
  const sheet = dewetSheetForId(id, dewetIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: DEWET_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a dewet note on.",
      path: listingDewetPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: DEWET_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a dewet note."
          : sheet.kind === "drawer"
            ? "A cable drawer does not take a dewet note. Dewet is Game Boy paper."
            : sheet.kind === "lid"
              ? "A pot lid does not take a dewet note. Dewet is Game Boy paper."
              : sheet.kind === "owned"
                ? "A dewet note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a dewet note. A dewet note is for the Game Boy on the table.",
      path: listingDewetPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not dewet it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not dewet it. Still a crack. Still Tetris. Still tote. Not pillow. Not billboard. Not underfill.`,
    path: listingDewetPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingDewetPage({ params }: DewetPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const dewetIds = parseDewetListingIds(
    jar.get(DEWET_COOKIE_NAME)?.value,
  );
  const sheet = dewetSheetForId(id, dewetIds);

  return <ListingDewetView sheet={sheet} dewetIds={dewetIds} />;
}
