import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingFluxView,
  type FluxViewKind,
  type FluxViewSheet,
} from "@/components/listing-flux-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  FLUX_BOY_ID,
  FLUX_CHAIR_ID,
  FLUX_COOKIE_NAME,
  FLUX_LID_ID,
  FLUX_REFUSE_COPY,
  canTapeFlux,
  isListingFluxOverlay,
  parseFluxListingIds,
} from "@/lib/listing-flux";
import { listingHubName } from "@/lib/listing-display";
import { listingFluxPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FluxPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): FluxViewKind {
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
    return listing.id === FLUX_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === FLUX_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === FLUX_BOY_ID) {
    return "boy";
  }
  if (listing.id === FLUX_LID_ID) {
    return "lid";
  }
  if (!canTapeFlux(listing)) {
    return "owned";
  }
  return "physical";
}

function fluxSheetForId(id: string, fluxIds: string[]): FluxViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isFlux: listing ? isListingFluxOverlay(listing.id, fluxIds) : false,
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
}: FluxPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const fluxIds = parseFluxListingIds(jar.get(FLUX_COOKIE_NAME)?.value);
  const sheet = fluxSheetForId(id, fluxIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: FLUX_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a flux note on.",
      path: listingFluxPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: FLUX_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a flux note."
          : sheet.kind === "boy"
            ? "A Game Boy does not take a flux note. Flux is a cable-pile note."
            : sheet.kind === "lid"
              ? "A lid does not take a flux note. Flux is a cable-pile note."
              : sheet.kind === "chair"
                ? "A chair does not take a flux note. Flux is a cable-pile note."
                : sheet.kind === "owned"
                  ? "A flux note is for the mystery cable drawer. Another overlay already owns that listing."
                  : "A file does not take a flux note. A flux note is for the cable drawer on the table.",
      path: listingFluxPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not flux them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not flux them. Still a tangle. Still untested. Still tote. Not tin. Not jumper. Not braid.`,
    path: listingFluxPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingFluxPage({ params }: FluxPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const fluxIds = parseFluxListingIds(jar.get(FLUX_COOKIE_NAME)?.value);
  const sheet = fluxSheetForId(id, fluxIds);

  return <ListingFluxView sheet={sheet} fluxIds={fluxIds} />;
}
