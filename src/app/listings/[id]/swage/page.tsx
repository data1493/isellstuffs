import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSwageView,
  type SwageViewKind,
  type SwageViewSheet,
} from "@/components/listing-swage-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SWAGE_CHAIR_ID,
  SWAGE_COOKIE_NAME,
  SWAGE_LID_ID,
  SWAGE_MUG_ID,
  SWAGE_REFUSE_COPY,
  canTapeSwage,
  isListingSwageOverlay,
  parseSwageListingIds,
} from "@/lib/listing-swage";
import { listingSwagePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SwagePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SwageViewKind {
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
    return listing.id === SWAGE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === SWAGE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === SWAGE_MUG_ID) {
    return "mug";
  }
  if (listing.id === SWAGE_LID_ID) {
    return "lid";
  }
  if (!canTapeSwage(listing)) {
    return "owned";
  }
  return "physical";
}

function swageSheetForId(id: string, swageIds: string[]): SwageViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSwage: listing ? isListingSwageOverlay(listing.id, swageIds) : false,
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
}: SwagePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const swageIds = parseSwageListingIds(jar.get(SWAGE_COOKIE_NAME)?.value);
  const sheet = swageSheetForId(id, swageIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SWAGE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a swage note on.",
      path: listingSwagePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SWAGE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a swage note."
          : sheet.kind === "chair"
            ? "A chair does not take a swage note. Swage is a whisk die."
            : sheet.kind === "mug"
              ? "A mug does not take a swage note. Swage is a whisk die."
              : sheet.kind === "lid"
                ? "A lid does not take a swage note. Swage is a whisk die."
                : sheet.kind === "owned"
                  ? "A swage note is for the balloon whisk. Another overlay already owns that listing."
                  : "A file does not take a swage note. A swage note is for the whisk on the table.",
      path: listingSwagePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not swage it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not swage it. Still bent. Still metal. Still tote. Not quench. Not planish. Not braze.`,
    path: listingSwagePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSwagePage({ params }: SwagePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const swageIds = parseSwageListingIds(jar.get(SWAGE_COOKIE_NAME)?.value);
  const sheet = swageSheetForId(id, swageIds);

  return <ListingSwageView sheet={sheet} swageIds={swageIds} />;
}
