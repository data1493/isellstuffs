import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingRivetView,
  type RivetViewKind,
  type RivetViewSheet,
} from "@/components/listing-rivet-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  RIVET_CHAIR_ID,
  RIVET_COOKIE_NAME,
  RIVET_DISC_ID,
  RIVET_REFUSE_COPY,
  canTapeRivet,
  isListingRivetOverlay,
  parseRivetListingIds,
} from "@/lib/listing-rivet";
import { listingHubName } from "@/lib/listing-display";
import { listingRivetPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RivetPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): RivetViewKind {
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
    return listing.id === RIVET_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === RIVET_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === RIVET_DISC_ID) {
    return "disc";
  }
  if (!canTapeRivet(listing)) {
    return "owned";
  }
  return "physical";
}

function rivetSheetForId(id: string, rivetIds: string[]): RivetViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRivet: listing ? isListingRivetOverlay(listing.id, rivetIds) : false,
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
}: RivetPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const rivetIds = parseRivetListingIds(jar.get(RIVET_COOKIE_NAME)?.value);
  const sheet = rivetSheetForId(id, rivetIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: RIVET_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a rivet note on.",
      path: listingRivetPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: RIVET_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a rivet note."
          : sheet.kind === "chair"
            ? "A chair does not take a rivet note. Rivet is a lamp shade."
            : sheet.kind === "disc"
              ? "A disc does not take a rivet note. Rivet is a lamp shade."
              : sheet.kind === "owned"
                ? "A rivet note is for the wobbly lamp. Another overlay already owns that listing."
                : "A file does not take a rivet note. A rivet note is for the lamp on the table.",
      path: listingRivetPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not rivet it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not rivet it. Still optional. Still in the box. Still tote. Not grommet. Not collar. Not harp.`,
    path: listingRivetPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRivetPage({ params }: RivetPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const rivetIds = parseRivetListingIds(jar.get(RIVET_COOKIE_NAME)?.value);
  const sheet = rivetSheetForId(id, rivetIds);

  return <ListingRivetView sheet={sheet} rivetIds={rivetIds} />;
}
