import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingDegaussView,
  type DegaussViewKind,
  type DegaussViewSheet,
} from "@/components/listing-degauss-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  DEGAUSS_COOKIE_NAME,
  DEGAUSS_LP_ID,
  DEGAUSS_REFUSE_COPY,
  canTapeDegauss,
  isListingDegaussOverlay,
  parseDegaussListingIds,
} from "@/lib/listing-degauss";
import { listingHubName } from "@/lib/listing-display";
import { listingDegaussPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DegaussPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): DegaussViewKind {
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
  if (listing.id === DEGAUSS_LP_ID) {
    return "lp";
  }
  if (!canTapeDegauss(listing)) {
    return "owned";
  }
  return "physical";
}

function degaussSheetForId(id: string, degaussIds: string[]): DegaussViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isDegauss: listing ? isListingDegaussOverlay(listing.id, degaussIds) : false,
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
}: DegaussPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const degaussIds = parseDegaussListingIds(
    jar.get(DEGAUSS_COOKIE_NAME)?.value,
  );
  const sheet = degaussSheetForId(id, degaussIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: DEGAUSS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a degauss note on.",
      path: listingDegaussPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: DEGAUSS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a degauss note."
          : sheet.kind === "lp"
            ? "A record does not take a degauss note. Degauss is a cassette wipe."
            : sheet.kind === "owned"
              ? "A degauss note is for SUMMER 93. Another overlay already owns that listing."
              : "A file does not take a degauss note. A degauss note is for the cassette on the table.",
      path: listingDegaussPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not degauss it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not degauss it. Still hiss. Still fading ink. Still tote. Not hiss. Not bake. Not splice.`,
    path: listingDegaussPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingDegaussPage({ params }: DegaussPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const degaussIds = parseDegaussListingIds(
    jar.get(DEGAUSS_COOKIE_NAME)?.value,
  );
  const sheet = degaussSheetForId(id, degaussIds);

  return <ListingDegaussView sheet={sheet} degaussIds={degaussIds} />;
}
