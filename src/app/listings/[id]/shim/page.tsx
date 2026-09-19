import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingShimView,
  type ShimViewKind,
  type ShimViewSheet,
} from "@/components/listing-shim-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SHIM_COOKIE_NAME,
  SHIM_REFUSE_COPY,
  isListingShimOverlay,
  parseShimListingIds,
} from "@/lib/listing-shim";
import { listingShimPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ShimPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ShimViewKind {
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

function shimSheetForId(id: string, shimIds: string[]): ShimViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isShim: listing ? isListingShimOverlay(listing.id, shimIds) : false,
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
}: ShimPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const shimIds = parseShimListingIds(jar.get(SHIM_COOKIE_NAME)?.value);
  const sheet = shimSheetForId(id, shimIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SHIM_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a shim note on.",
      path: listingShimPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SHIM_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a shim note."
          : "A junk PDF does not take a shim. A shim note is for a lamp on the table.",
      path: listingShimPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not shim it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not shim it. Neck still twists. Still lights. Still tote. Not twist. Not a shop. Not kit.`,
    path: listingShimPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingShimPage({ params }: ShimPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const shimIds = parseShimListingIds(jar.get(SHIM_COOKIE_NAME)?.value);
  const sheet = shimSheetForId(id, shimIds);

  return <ListingShimView sheet={sheet} shimIds={shimIds} />;
}
