import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingRadioView,
  type RadioViewKind,
  type RadioViewSheet,
} from "@/components/listing-radio-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  RADIO_COOKIE_NAME,
  RADIO_REFUSE_COPY,
  isListingRadioOverlay,
  parseRadioListingIds,
} from "@/lib/listing-radio";
import { listingRadioPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RadioPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): RadioViewKind {
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

function radioSheetForId(id: string, radioIds: string[]): RadioViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRadio: listing ? isListingRadioOverlay(listing.id, radioIds) : false,
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
}: RadioPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const radioIds = parseRadioListingIds(jar.get(RADIO_COOKIE_NAME)?.value);
  const sheet = radioSheetForId(id, radioIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: RADIO_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a radio edit on.",
      path: listingRadioPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: RADIO_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a radio edit."
          : "A file is not a cassette. The radio edit stays is for tape on the table.",
      path: listingRadioPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The radio edit stays · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The radio edit stays. Still SUMMER 93. Still tote.`,
    path: listingRadioPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRadioPage({ params }: RadioPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const radioIds = parseRadioListingIds(jar.get(RADIO_COOKIE_NAME)?.value);
  const sheet = radioSheetForId(id, radioIds);

  return <ListingRadioView sheet={sheet} radioIds={radioIds} />;
}
