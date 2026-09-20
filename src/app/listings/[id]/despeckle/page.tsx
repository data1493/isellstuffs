import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingDespeckleView,
  type DespeckleViewKind,
  type DespeckleViewSheet,
} from "@/components/listing-despeckle-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  DESPECKLE_COOKIE_NAME,
  DESPECKLE_REFUSE_COPY,
  canTapeDespeckle,
  isListingDespeckleOverlay,
  parseDespeckleListingIds,
} from "@/lib/listing-despeckle";
import { listingDespecklePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DespecklePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): DespeckleViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    if (!canTapeDespeckle(listing)) {
      return "owned";
    }
    return "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function despeckleSheetForId(id: string, despeckleIds: string[]): DespeckleViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isDespeckle: listing ? isListingDespeckleOverlay(listing.id, despeckleIds) : false,
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
}: DespecklePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const despeckleIds = parseDespeckleListingIds(jar.get(DESPECKLE_COOKIE_NAME)?.value);
  const sheet = despeckleSheetForId(id, despeckleIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: DESPECKLE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a despeckle note on.",
      path: listingDespecklePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: DESPECKLE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a despeckle note."
          : sheet.kind === "owned"
            ? "A despeckle note is for the stained recipe cards. Another overlay already owns that listing."
            : "A whisk does not take a despeckle note. A despeckle note is for three recipe cards.",
      path: listingDespecklePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not despeckle them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not despeckle them. Still three cards. Still grease. Still tote. Not gang. Not crop. Not a shop. Not descreen. Heal the flecks, not a login.`,
    path: listingDespecklePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingDespecklePage({ params }: DespecklePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const despeckleIds = parseDespeckleListingIds(jar.get(DESPECKLE_COOKIE_NAME)?.value);
  const sheet = despeckleSheetForId(id, despeckleIds);

  return <ListingDespeckleView sheet={sheet} despeckleIds={despeckleIds} />;
}
