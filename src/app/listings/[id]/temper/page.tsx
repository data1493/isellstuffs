import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingTemperView,
  type TemperViewKind,
  type TemperViewSheet,
} from "@/components/listing-temper-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  TEMPER_COOKIE_NAME,
  TEMPER_LID_ID,
  TEMPER_MUG_ID,
  TEMPER_REFUSE_COPY,
  canTapeTemper,
  isListingTemperOverlay,
  parseTemperListingIds,
} from "@/lib/listing-temper";
import { listingHubName } from "@/lib/listing-display";
import { listingTemperPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type TemperPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): TemperViewKind {
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
  if (listing.id === TEMPER_MUG_ID) {
    return "mug";
  }
  if (listing.id === TEMPER_LID_ID) {
    return "lid";
  }
  if (!canTapeTemper(listing)) {
    return "owned";
  }
  return "physical";
}

function temperSheetForId(id: string, temperIds: string[]): TemperViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isTemper: listing ? isListingTemperOverlay(listing.id, temperIds) : false,
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
}: TemperPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const temperIds = parseTemperListingIds(jar.get(TEMPER_COOKIE_NAME)?.value);
  const sheet = temperSheetForId(id, temperIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: TEMPER_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a temper note on.",
      path: listingTemperPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: TEMPER_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a temper note."
          : sheet.kind === "mug"
            ? "A mug does not take a temper note. Temper is a whisk spring."
            : sheet.kind === "lid"
              ? "A lid does not take a temper note. Temper is a whisk spring."
              : sheet.kind === "owned"
                ? "A temper note is for the balloon whisk. Another overlay already owns that listing."
                : "A file does not take a temper note. A temper note is for the whisk on the table.",
      path: listingTemperPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not temper it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not temper it. Still splayed. Still metal. Still tote. Not anneal. Not peen. Not tines.`,
    path: listingTemperPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingTemperPage({ params }: TemperPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const temperIds = parseTemperListingIds(jar.get(TEMPER_COOKIE_NAME)?.value);
  const sheet = temperSheetForId(id, temperIds);

  return <ListingTemperView sheet={sheet} temperIds={temperIds} />;
}
