import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingVampView,
  type VampViewKind,
  type VampViewSheet,
} from "@/components/listing-vamp-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  VAMP_CHAIR_ID,
  VAMP_COOKIE_NAME,
  VAMP_JACKET_ID,
  VAMP_LID_ID,
  VAMP_REFUSE_COPY,
  canTapeVamp,
  isListingVampOverlay,
  parseVampListingIds,
} from "@/lib/listing-vamp";
import { listingVampPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type VampPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): VampViewKind {
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
    return listing.id === VAMP_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === VAMP_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === VAMP_JACKET_ID) {
    return "jacket";
  }
  if (listing.id === VAMP_LID_ID) {
    return "lid";
  }
  if (!canTapeVamp(listing)) {
    return "owned";
  }
  return "physical";
}

function vampSheetForId(id: string, vampIds: string[]): VampViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isVamp: listing ? isListingVampOverlay(listing.id, vampIds) : false,
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
}: VampPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const vampIds = parseVampListingIds(jar.get(VAMP_COOKIE_NAME)?.value);
  const sheet = vampSheetForId(id, vampIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: VAMP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a vamp note on.",
      path: listingVampPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: VAMP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a vamp note."
          : sheet.kind === "jacket"
            ? "A jacket does not take a vamp note. Vamp is a pair upper."
            : sheet.kind === "lid"
              ? "A pot lid does not take a vamp note. Vamp is a pair upper."
              : sheet.kind === "chair"
                ? "A chair does not take a vamp note. Vamp is a pair upper."
                : sheet.kind === "owned"
                  ? "A vamp note is for the split-sole pair. Another overlay already owns that listing."
                  : "A file does not take a vamp note. A vamp note is for the pair on the table.",
      path: listingVampPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not vamp them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not vamp them. Still a flex. Still original laces. Still tote. Not shank. Not gem. Not channel.`,
    path: listingVampPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingVampPage({ params }: VampPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const vampIds = parseVampListingIds(jar.get(VAMP_COOKIE_NAME)?.value);
  const sheet = vampSheetForId(id, vampIds);

  return <ListingVampView sheet={sheet} vampIds={vampIds} />;
}
