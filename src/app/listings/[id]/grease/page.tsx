import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGreaseView,
  type GreaseViewKind,
  type GreaseViewSheet,
} from "@/components/listing-grease-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GREASE_COOKIE_NAME,
  GREASE_REFUSE_COPY,
  isListingGreaseOverlay,
  parseGreaseListingIds,
} from "@/lib/listing-grease";
import { listingGreasePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GreasePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GreaseViewKind {
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

function greaseSheetForId(id: string, greaseIds: string[]): GreaseViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGrease: listing ? isListingGreaseOverlay(listing.id, greaseIds) : false,
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
}: GreasePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const greaseIds = parseGreaseListingIds(jar.get(GREASE_COOKIE_NAME)?.value);
  const sheet = greaseSheetForId(id, greaseIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GREASE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a grease note on.",
      path: listingGreasePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: GREASE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a grease note."
          : "A mug is not a scan wipe. Grease honesty is for a file on the digital lot.",
      path: listingGreasePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The grease stays · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Still readable. Walkers still want a clean scan. Still tote.`,
    path: listingGreasePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGreasePage({ params }: GreasePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const greaseIds = parseGreaseListingIds(jar.get(GREASE_COOKIE_NAME)?.value);
  const sheet = greaseSheetForId(id, greaseIds);

  return <ListingGreaseView sheet={sheet} greaseIds={greaseIds} />;
}
