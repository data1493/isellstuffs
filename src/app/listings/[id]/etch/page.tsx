import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingEtchView,
  type EtchViewKind,
  type EtchViewSheet,
} from "@/components/listing-etch-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  ETCH_COOKIE_NAME,
  ETCH_REFUSE_COPY,
  isListingEtchOverlay,
  parseEtchListingIds,
} from "@/lib/listing-etch";
import { listingEtchPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type EtchPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): EtchViewKind {
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

function etchSheetForId(id: string, etchIds: string[]): EtchViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isEtch: listing ? isListingEtchOverlay(listing.id, etchIds) : false,
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
}: EtchPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const etchIds = parseEtchListingIds(jar.get(ETCH_COOKIE_NAME)?.value);
  const sheet = etchSheetForId(id, etchIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: ETCH_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an etch note on.",
      path: listingEtchPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: ETCH_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an etch note."
          : "A liner PDF does not take a runout. An etch note is for a record on the table.",
      path: listingEtchPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not read the runout · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not read the runout. Groove stays unnamed. Still Side A. Still skips. Still tote. Not press. Not name. Not vg.`,
    path: listingEtchPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingEtchPage({ params }: EtchPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const etchIds = parseEtchListingIds(jar.get(ETCH_COOKIE_NAME)?.value);
  const sheet = etchSheetForId(id, etchIds);

  return <ListingEtchView sheet={sheet} etchIds={etchIds} />;
}
