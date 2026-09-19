import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingDustView,
  type DustViewKind,
  type DustViewSheet,
} from "@/components/listing-dust-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  DUST_COOKIE_NAME,
  DUST_REFUSE_COPY,
  isListingDustOverlay,
  parseDustListingIds,
} from "@/lib/listing-dust";
import { listingDustPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DustPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): DustViewKind {
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

function dustSheetForId(id: string, dustIds: string[]): DustViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isDust: listing ? isListingDustOverlay(listing.id, dustIds) : false,
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
}: DustPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const dustIds = parseDustListingIds(jar.get(DUST_COOKIE_NAME)?.value);
  const sheet = dustSheetForId(id, dustIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: DUST_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape dust on.",
      path: listingDustPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: DUST_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not keep furniture dust."
          : "A file does not keep furniture dust. Dust honesty is for furniture and records on the table.",
      path: listingDustPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The dust stays · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Hair is pet hair. Wash is I washed it. This is furniture and record dust that stays. Still tote. Not hair. Not wash.`,
    path: listingDustPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingDustPage({ params }: DustPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const dustIds = parseDustListingIds(jar.get(DUST_COOKIE_NAME)?.value);
  const sheet = dustSheetForId(id, dustIds);

  return <ListingDustView sheet={sheet} dustIds={dustIds} />;
}
