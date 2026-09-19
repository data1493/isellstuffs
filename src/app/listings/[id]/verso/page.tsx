import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingVersoView,
  type VersoViewKind,
  type VersoViewSheet,
} from "@/components/listing-verso-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  VERSO_COOKIE_NAME,
  VERSO_REFUSE_COPY,
  isListingVersoOverlay,
  parseVersoListingIds,
} from "@/lib/listing-verso";
import { listingVersoPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type VersoPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): VersoViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
    return listing.status === "file-gone" ? "file-gone" : "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function versoSheetForId(id: string, versoIds: string[]): VersoViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isVerso: listing ? isListingVersoOverlay(listing.id, versoIds) : false,
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
}: VersoPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const versoIds = parseVersoListingIds(jar.get(VERSO_COOKIE_NAME)?.value);
  const sheet = versoSheetForId(id, versoIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: VERSO_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a verso note on.",
      path: listingVersoPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: VERSO_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a verso note."
          : "A cassette is not a liner page. Verso honesty is for a file on the digital lot.",
      path: listingVersoPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not write Side B · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. One page. Walkers still want a second page. Still tote. Not a sequel desk.`,
    path: listingVersoPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingVersoPage({ params }: VersoPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const versoIds = parseVersoListingIds(jar.get(VERSO_COOKIE_NAME)?.value);
  const sheet = versoSheetForId(id, versoIds);

  return <ListingVersoView sheet={sheet} versoIds={versoIds} />;
}
