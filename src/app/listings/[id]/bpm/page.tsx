import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBpmView,
  type BpmViewKind,
  type BpmViewSheet,
} from "@/components/listing-bpm-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  BPM_COOKIE_NAME,
  BPM_REFUSE_COPY,
  isListingBpmOverlay,
  parseBpmListingIds,
} from "@/lib/listing-bpm";
import { listingBpmPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BpmPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BpmViewKind {
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

function bpmSheetForId(id: string, bpmIds: string[]): BpmViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBpm: listing ? isListingBpmOverlay(listing.id, bpmIds) : false,
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
}: BpmPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const bpmIds = parseBpmListingIds(jar.get(BPM_COOKIE_NAME)?.value);
  const sheet = bpmSheetForId(id, bpmIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BPM_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a BPM on.",
      path: listingBpmPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: BPM_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a tempo map."
          : "A lamp is not a loop. BPM honesty is for a file on the digital lot.",
      path: listingBpmPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `BPM is a guess · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. BPM is a guess. I will not tempo-map. Stems is twelve shots. Convert is no Rec.709. Still tote.`,
    path: listingBpmPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBpmPage({ params }: BpmPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const bpmIds = parseBpmListingIds(jar.get(BPM_COOKIE_NAME)?.value);
  const sheet = bpmSheetForId(id, bpmIds);

  return <ListingBpmView sheet={sheet} bpmIds={bpmIds} />;
}
