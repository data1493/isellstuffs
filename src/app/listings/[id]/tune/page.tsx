import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingTuneView,
  type TuneViewKind,
  type TuneViewSheet,
} from "@/components/listing-tune-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  TUNE_COOKIE_NAME,
  TUNE_REFUSE_COPY,
  isListingTuneOverlay,
  parseTuneListingIds,
} from "@/lib/listing-tune";
import { listingTunePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type TunePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): TuneViewKind {
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

function tuneSheetForId(id: string, tuneIds: string[]): TuneViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isTune: listing ? isListingTuneOverlay(listing.id, tuneIds) : false,
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
}: TunePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const tuneIds = parseTuneListingIds(jar.get(TUNE_COOKIE_NAME)?.value);
  const sheet = tuneSheetForId(id, tuneIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: TUNE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a tune note on.",
      path: listingTunePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: TUNE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a tune note."
          : "A CD-R is not a tuned pack. Tune honesty is for a file on the digital lot.",
      path: listingTunePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not tune it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. One-shots as recorded. Walkers still want the kicks in C. Still tote. Not a mix desk.`,
    path: listingTunePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingTunePage({ params }: TunePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const tuneIds = parseTuneListingIds(jar.get(TUNE_COOKIE_NAME)?.value);
  const sheet = tuneSheetForId(id, tuneIds);

  return <ListingTuneView sheet={sheet} tuneIds={tuneIds} />;
}
