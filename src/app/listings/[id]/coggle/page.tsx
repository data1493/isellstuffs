import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCoggleView,
  type CoggleViewKind,
  type CoggleViewSheet,
} from "@/components/listing-coggle-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  COGGLE_CHAIR_ID,
  COGGLE_COOKIE_NAME,
  COGGLE_LID_ID,
  COGGLE_REFUSE_COPY,
  COGGLE_WHISK_ID,
  canTapeCoggle,
  isListingCoggleOverlay,
  parseCoggleListingIds,
} from "@/lib/listing-coggle";
import { listingCogglePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CogglePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CoggleViewKind {
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
    return listing.id === COGGLE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === COGGLE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === COGGLE_LID_ID) {
    return "lid";
  }
  if (listing.id === COGGLE_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeCoggle(listing)) {
    return "owned";
  }
  return "physical";
}

function coggleSheetForId(id: string, coggleIds: string[]): CoggleViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCoggle: listing ? isListingCoggleOverlay(listing.id, coggleIds) : false,
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
}: CogglePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const coggleIds = parseCoggleListingIds(jar.get(COGGLE_COOKIE_NAME)?.value);
  const sheet = coggleSheetForId(id, coggleIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: COGGLE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a coggle note on.",
      path: listingCogglePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: COGGLE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a coggle note."
          : sheet.kind === "lid"
            ? "A lid does not take a coggle note. Coggle is a mug rim note."
            : sheet.kind === "whisk"
              ? "A whisk does not take a coggle note. Coggle is a mug rim note."
              : sheet.kind === "chair"
                ? "A chair does not take a coggle note. Coggle is a mug rim note."
                : sheet.kind === "owned"
                  ? "A coggle note is for the diner mug. Another overlay already owns that listing."
                  : "A file does not take a coggle note. A coggle note is for the mug on the table.",
      path: listingCogglePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not coggle it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not coggle it. Still a diner rim. Still holds coffee. Still tote. Not sprig. Not stilt. Not jigger.`,
    path: listingCogglePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCogglePage({ params }: CogglePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const coggleIds = parseCoggleListingIds(jar.get(COGGLE_COOKIE_NAME)?.value);
  const sheet = coggleSheetForId(id, coggleIds);

  return <ListingCoggleView sheet={sheet} coggleIds={coggleIds} />;
}
