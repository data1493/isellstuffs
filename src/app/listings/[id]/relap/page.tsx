import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingRelapView,
  type RelapViewKind,
  type RelapViewSheet,
} from "@/components/listing-relap-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  RELAP_CHAIR_ID,
  RELAP_COOKIE_NAME,
  RELAP_JEWELS_ID,
  RELAP_LP_ID,
  RELAP_REFUSE_COPY,
  canTapeRelap,
  isListingRelapOverlay,
  parseRelapListingIds,
} from "@/lib/listing-relap";
import { listingRelapPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RelapPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): RelapViewKind {
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
    return listing.id === RELAP_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === RELAP_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === RELAP_LP_ID) {
    return "lp";
  }
  if (listing.id === RELAP_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeRelap(listing)) {
    return "owned";
  }
  return "physical";
}

function relapSheetForId(id: string, relapIds: string[]): RelapViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRelap: listing ? isListingRelapOverlay(listing.id, relapIds) : false,
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
}: RelapPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const relapIds = parseRelapListingIds(jar.get(RELAP_COOKIE_NAME)?.value);
  const sheet = relapSheetForId(id, relapIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: RELAP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a relap note on.",
      path: listingRelapPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: RELAP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a relap note."
          : sheet.kind === "lp"
            ? "A record does not take a relap note. Relap honesty is for the cassette."
            : sheet.kind === "jewels"
              ? "Empty jewel cases do not take a relap note. Relap honesty is for the cassette."
              : sheet.kind === "chair"
                ? "A chair does not take a relap note. Relap honesty is for the cassette."
                : sheet.kind === "owned"
                  ? "A relap note is for SUMMER 93. Another overlay already owns that listing."
                  : "A file does not take a relap note. A relap note is for the cassette on the table.",
      path: listingRelapPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not relap it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not relap it. Still hiss. Still a radio edit. Still tote. Not flutter. Not torque. Not bias.`,
    path: listingRelapPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRelapPage({ params }: RelapPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const relapIds = parseRelapListingIds(jar.get(RELAP_COOKIE_NAME)?.value);
  const sheet = relapSheetForId(id, relapIds);

  return <ListingRelapView sheet={sheet} relapIds={relapIds} />;
}
