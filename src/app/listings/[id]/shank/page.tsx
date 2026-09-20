import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingShankView,
  type ShankViewKind,
  type ShankViewSheet,
} from "@/components/listing-shank-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SHANK_CHAIR_ID,
  SHANK_COOKIE_NAME,
  SHANK_JACKET_ID,
  SHANK_LID_ID,
  SHANK_REFUSE_COPY,
  canTapeShank,
  isListingShankOverlay,
  parseShankListingIds,
} from "@/lib/listing-shank";
import { listingShankPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ShankPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ShankViewKind {
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
    return listing.id === SHANK_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === SHANK_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === SHANK_JACKET_ID) {
    return "jacket";
  }
  if (listing.id === SHANK_LID_ID) {
    return "lid";
  }
  if (!canTapeShank(listing)) {
    return "owned";
  }
  return "physical";
}

function shankSheetForId(id: string, shankIds: string[]): ShankViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isShank: listing ? isListingShankOverlay(listing.id, shankIds) : false,
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
}: ShankPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const shankIds = parseShankListingIds(jar.get(SHANK_COOKIE_NAME)?.value);
  const sheet = shankSheetForId(id, shankIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SHANK_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a shank note on.",
      path: listingShankPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SHANK_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a shank note."
          : sheet.kind === "jacket"
            ? "A jacket does not take a shank note. Shank is a pair steel."
            : sheet.kind === "lid"
              ? "A pot lid does not take a shank note. Shank is a pair steel."
              : sheet.kind === "chair"
                ? "A chair does not take a shank note. Shank is a pair steel."
                : sheet.kind === "owned"
                  ? "A shank note is for the split-sole pair. Another overlay already owns that listing."
                  : "A file does not take a shank note. A shank note is for the pair on the table.",
      path: listingShankPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not shank them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not shank them. Still a flex. Still original laces. Still tote. Not edge. Not skive. Not welt.`,
    path: listingShankPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingShankPage({ params }: ShankPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const shankIds = parseShankListingIds(jar.get(SHANK_COOKIE_NAME)?.value);
  const sheet = shankSheetForId(id, shankIds);

  return <ListingShankView sheet={sheet} shankIds={shankIds} />;
}
