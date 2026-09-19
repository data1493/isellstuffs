import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingFoamView,
  type FoamViewKind,
  type FoamViewSheet,
} from "@/components/listing-foam-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  FOAM_COOKIE_NAME,
  FOAM_REFUSE_COPY,
  isListingFoamOverlay,
  parseFoamListingIds,
} from "@/lib/listing-foam";
import { listingFoamPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FoamPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): FoamViewKind {
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
  return "physical";
}

function foamSheetForId(id: string, foamIds: string[]): FoamViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isFoam: listing ? isListingFoamOverlay(listing.id, foamIds) : false,
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
}: FoamPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const foamIds = parseFoamListingIds(jar.get(FOAM_COOKIE_NAME)?.value);
  const sheet = foamSheetForId(id, foamIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: FOAM_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a foam note on.",
      path: listingFoamPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: FOAM_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a foam note."
          : "A file does not take a foam note. A foam note is for empty jewels on the table.",
      path: listingFoamPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not foam them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not foam them. Still a pile. Still empty. Still tote. Not nest. Not fill. Not a shop. Not cases.`,
    path: listingFoamPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingFoamPage({ params }: FoamPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const foamIds = parseFoamListingIds(jar.get(FOAM_COOKIE_NAME)?.value);
  const sheet = foamSheetForId(id, foamIds);

  return <ListingFoamView sheet={sheet} foamIds={foamIds} />;
}
