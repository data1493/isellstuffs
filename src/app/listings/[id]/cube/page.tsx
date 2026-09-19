import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCubeView,
  type CubeViewKind,
  type CubeViewSheet,
} from "@/components/listing-cube-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CUBE_COOKIE_NAME,
  CUBE_HOST_ID,
  CUBE_REFUSE_COPY,
  canTapeCube,
  isListingCubeOverlay,
  parseCubeListingIds,
} from "@/lib/listing-cube";
import { listingCubePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CubePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CubeViewKind {
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
    if (listing.id !== CUBE_HOST_ID || !canTapeCube(listing)) {
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

function cubeSheetForId(id: string, cubeIds: string[]): CubeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCube: listing ? isListingCubeOverlay(listing.id, cubeIds) : false,
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
}: CubePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const cubeIds = parseCubeListingIds(jar.get(CUBE_COOKIE_NAME)?.value);
  const sheet = cubeSheetForId(id, cubeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CUBE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a cube note on.",
      path: listingCubePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: CUBE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a cube note."
          : sheet.kind === "owned"
            ? "A cube note is for the parking-lot LUT pack. Another overlay already owns that listing."
            : "A Game Boy does not take a cube note. A cube note is for three parking-lot looks.",
      path: listingCubePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not cube them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not cube them. Still three looks. Still a pack. Still tote. Not convert. Not grade. Not a shop. Not log.`,
    path: listingCubePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCubePage({ params }: CubePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const cubeIds = parseCubeListingIds(jar.get(CUBE_COOKIE_NAME)?.value);
  const sheet = cubeSheetForId(id, cubeIds);

  return <ListingCubeView sheet={sheet} cubeIds={cubeIds} />;
}
