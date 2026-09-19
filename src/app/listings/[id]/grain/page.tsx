import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGrainView,
  type GrainViewKind,
  type GrainViewSheet,
} from "@/components/listing-grain-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GRAIN_COOKIE_NAME,
  GRAIN_HOST_ID,
  GRAIN_REFUSE_COPY,
  canTapeGrain,
  isListingGrainOverlay,
  parseGrainListingIds,
} from "@/lib/listing-grain";
import { listingGrainPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GrainPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GrainViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    if (listing.id !== GRAIN_HOST_ID || !canTapeGrain(listing)) {
      return "owned";
    }
    return "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function grainSheetForId(id: string, grainIds: string[]): GrainViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGrain: listing ? isListingGrainOverlay(listing.id, grainIds) : false,
    title: listing?.title ?? null,
    priceLabel: listing ? formatMoney(listing.price) : null,
    fact: listing
      ? isDigitalListing(listing)
        ? listing.fileFormat
        : listing.condition
      : null,
    stallName: stall?.boothName ?? listing?.stallId ?? null,
    stallSlug: stall?.slug ?? null,
    hubName: listing ? listingHubName(listing) : null,
    listing: listing ?? null,
  };
}

export async function generateMetadata({
  params,
}: GrainPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const grainIds = parseGrainListingIds(jar.get(GRAIN_COOKIE_NAME)?.value);
  const sheet = grainSheetForId(id, grainIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GRAIN_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a grain note on.",
      path: listingGrainPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: GRAIN_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a grain note."
          : sheet.kind === "owned"
            ? "A grain note is for the parking-lot LUT pack. Another overlay already owns that listing."
            : "A Game Boy does not take a grain note. A grain note is for three parking-lot looks.",
      path: listingGrainPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not grain them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not grain them. Still three looks. Still a cube. Still tote. Not convert. Not slate. Not a shop. Not scope.`,
    path: listingGrainPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGrainPage({ params }: GrainPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const grainIds = parseGrainListingIds(jar.get(GRAIN_COOKIE_NAME)?.value);
  const sheet = grainSheetForId(id, grainIds);

  return <ListingGrainView sheet={sheet} grainIds={grainIds} />;
}
