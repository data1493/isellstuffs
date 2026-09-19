import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingReflowView,
  type ReflowViewKind,
  type ReflowViewSheet,
} from "@/components/listing-reflow-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  REFLOW_COOKIE_NAME,
  REFLOW_LUT_ID,
  REFLOW_PACK_ID,
  REFLOW_REFUSE_COPY,
  canTapeReflow,
  isListingReflowOverlay,
  parseReflowListingIds,
} from "@/lib/listing-reflow";
import { listingReflowPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ReflowPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ReflowViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (listing.id === REFLOW_LUT_ID) {
    return "lut";
  }
  if (listing.id === REFLOW_PACK_ID) {
    return "pack";
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
  if (!canTapeReflow(listing)) {
    return "owned";
  }
  return "physical";
}

function reflowSheetForId(
  id: string,
  reflowIds: string[],
): ReflowViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isReflow: listing
      ? isListingReflowOverlay(listing.id, reflowIds)
      : false,
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
}: ReflowPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const reflowIds = parseReflowListingIds(
    jar.get(REFLOW_COOKIE_NAME)?.value,
  );
  const sheet = reflowSheetForId(id, reflowIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: REFLOW_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a reflow note on.",
      path: listingReflowPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: REFLOW_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a reflow note."
          : sheet.kind === "lut"
            ? "A LUT pack does not take a reflow note. Reflow is a Game Boy cart."
            : sheet.kind === "pack"
              ? "A sample pack does not take a reflow note. Reflow is a Game Boy cart."
              : sheet.kind === "owned"
                ? "A reflow note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a reflow note. A reflow note is for the Game Boy on the table.",
      path: listingReflowPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not reflow it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not reflow it. Still a line. Still fused. Still tote. Not tin. Not fix. Not a shop. Not speaker.`,
    path: listingReflowPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingReflowPage({
  params,
}: ReflowPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const reflowIds = parseReflowListingIds(
    jar.get(REFLOW_COOKIE_NAME)?.value,
  );
  const sheet = reflowSheetForId(id, reflowIds);

  return <ListingReflowView sheet={sheet} reflowIds={reflowIds} />;
}
