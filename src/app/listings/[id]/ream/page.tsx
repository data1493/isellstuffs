import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingReamView,
  type ReamViewKind,
  type ReamViewSheet,
} from "@/components/listing-ream-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  REAM_BURNED_ID,
  REAM_CHAIR_ID,
  REAM_COOKIE_NAME,
  REAM_REFUSE_COPY,
  canTapeReam,
  isListingReamOverlay,
  parseReamListingIds,
} from "@/lib/listing-ream";
import { listingReamPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ReamPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ReamViewKind {
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
    return listing.id === REAM_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === REAM_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === REAM_BURNED_ID) {
    return "burned";
  }
  if (!canTapeReam(listing)) {
    return "owned";
  }
  return "physical";
}

function reamSheetForId(id: string, reamIds: string[]): ReamViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isReam: listing ? isListingReamOverlay(listing.id, reamIds) : false,
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
}: ReamPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const reamIds = parseReamListingIds(jar.get(REAM_COOKIE_NAME)?.value);
  const sheet = reamSheetForId(id, reamIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: REAM_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a ream note on.",
      path: listingReamPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: REAM_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a ream note."
          : sheet.kind === "chair"
            ? "A chair does not take a ream note. Ream is a lamp neck."
            : sheet.kind === "burned"
              ? "A burned disc does not take a ream note. Ream is a lamp neck."
              : sheet.kind === "owned"
                ? "A ream note is for the wobbly lamp. Another overlay already owns that listing."
                : "A file does not take a ream note. A ream note is for the lamp on the table.",
      path: listingReamPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not ream it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not ream it. Still a crack. Still lights. Still tote. Not bush. Not swage. Not chase.`,
    path: listingReamPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingReamPage({ params }: ReamPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const reamIds = parseReamListingIds(jar.get(REAM_COOKIE_NAME)?.value);
  const sheet = reamSheetForId(id, reamIds);

  return <ListingReamView sheet={sheet} reamIds={reamIds} />;
}
