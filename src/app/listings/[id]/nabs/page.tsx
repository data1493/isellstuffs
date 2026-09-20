import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingNabsView,
  type NabsViewKind,
  type NabsViewSheet,
} from "@/components/listing-nabs-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  NABS_CHAIR_ID,
  NABS_COOKIE_NAME,
  NABS_JEWELS_ID,
  NABS_LP_ID,
  NABS_REFUSE_COPY,
  canTapeNabs,
  isListingNabsOverlay,
  parseNabsListingIds,
} from "@/lib/listing-nabs";
import { listingNabsPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type NabsPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): NabsViewKind {
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
    return listing.id === NABS_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === NABS_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === NABS_LP_ID) {
    return "lp";
  }
  if (listing.id === NABS_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeNabs(listing)) {
    return "owned";
  }
  return "physical";
}

function nabsSheetForId(id: string, nabsIds: string[]): NabsViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isNabs: listing ? isListingNabsOverlay(listing.id, nabsIds) : false,
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
}: NabsPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const nabsIds = parseNabsListingIds(jar.get(NABS_COOKIE_NAME)?.value);
  const sheet = nabsSheetForId(id, nabsIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: NABS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a nabs note on.",
      path: listingNabsPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: NABS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a nabs note."
          : sheet.kind === "lp"
            ? "A record does not take a nabs note. Nabs honesty is for the cassette."
            : sheet.kind === "jewels"
              ? "Empty jewel cases do not take a nabs note. Nabs honesty is for the cassette."
              : sheet.kind === "chair"
                ? "A chair does not take a nabs note. Nabs honesty is for the cassette."
                : sheet.kind === "owned"
                  ? "A nabs note is for SUMMER 93. Another overlay already owns that listing."
                  : "A file does not take a nabs note. A nabs note is for the cassette on the table.",
      path: listingNabsPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not nabs it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not nabs it. Still hiss. Still a radio edit. Still tote. Not flutter. Not relap. Not torque.`,
    path: listingNabsPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingNabsPage({ params }: NabsPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const nabsIds = parseNabsListingIds(jar.get(NABS_COOKIE_NAME)?.value);
  const sheet = nabsSheetForId(id, nabsIds);

  return <ListingNabsView sheet={sheet} nabsIds={nabsIds} />;
}
