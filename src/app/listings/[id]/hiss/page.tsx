import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingHissView,
  type HissViewKind,
  type HissViewSheet,
} from "@/components/listing-hiss-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  HISS_COOKIE_NAME,
  HISS_REFUSE_COPY,
  isListingHissOverlay,
  parseHissListingIds,
} from "@/lib/listing-hiss";
import { listingHissPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type HissPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): HissViewKind {
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

function hissSheetForId(id: string, hissIds: string[]): HissViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isHiss: listing ? isListingHissOverlay(listing.id, hissIds) : false,
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
}: HissPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const hissIds = parseHissListingIds(jar.get(HISS_COOKIE_NAME)?.value);
  const sheet = hissSheetForId(id, hissIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: HISS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a hiss on.",
      path: listingHissPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: HISS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not hiss."
          : "A file is not a cassette. The hiss stays is for tape on the table.",
      path: listingHissPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The hiss stays · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The hiss stays. That's the cassette. Skip is the LP scratch. Plays is I spun the Sharpie disc. Still tote.`,
    path: listingHissPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingHissPage({ params }: HissPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const hissIds = parseHissListingIds(jar.get(HISS_COOKIE_NAME)?.value);
  const sheet = hissSheetForId(id, hissIds);

  return <ListingHissView sheet={sheet} hissIds={hissIds} />;
}
