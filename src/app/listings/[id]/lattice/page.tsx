import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingLatticeView,
  type LatticeViewKind,
  type LatticeViewSheet,
} from "@/components/listing-lattice-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  LATTICE_COOKIE_NAME,
  LATTICE_HOST_ID,
  LATTICE_REFUSE_COPY,
  canTapeLattice,
  isListingLatticeOverlay,
  parseLatticeListingIds,
} from "@/lib/listing-lattice";
import { listingLatticePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type LatticePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): LatticeViewKind {
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
    if (listing.id !== LATTICE_HOST_ID || !canTapeLattice(listing)) {
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

function latticeSheetForId(id: string, latticeIds: string[]): LatticeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isLattice: listing ? isListingLatticeOverlay(listing.id, latticeIds) : false,
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
}: LatticePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const latticeIds = parseLatticeListingIds(jar.get(LATTICE_COOKIE_NAME)?.value);
  const sheet = latticeSheetForId(id, latticeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: LATTICE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a lattice note on.",
      path: listingLatticePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: LATTICE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a lattice note."
          : sheet.kind === "owned"
            ? "A lattice note is for the parking-lot LUT pack. Another overlay already owns that listing."
            : "A Game Boy does not take a lattice note. A lattice note is for parking-lot looks.",
      path: listingLatticePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not lattice them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not lattice them. Still a parking lot. Still fluorescent. Still tote. Not posterize. Not gamma. Not a shop. Not cube. Not an account.`,
    path: listingLatticePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingLatticePage({ params }: LatticePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const latticeIds = parseLatticeListingIds(jar.get(LATTICE_COOKIE_NAME)?.value);
  const sheet = latticeSheetForId(id, latticeIds);

  return <ListingLatticeView sheet={sheet} latticeIds={latticeIds} />;
}
