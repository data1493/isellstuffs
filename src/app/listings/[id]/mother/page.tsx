import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingMotherView,
  type MotherViewKind,
  type MotherViewSheet,
} from "@/components/listing-mother-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  MOTHER_CHAIR_ID,
  MOTHER_COOKIE_NAME,
  MOTHER_JEWELS_ID,
  MOTHER_MIXTAPE_ID,
  MOTHER_REFUSE_COPY,
  canTapeMother,
  isListingMotherOverlay,
  parseMotherListingIds,
} from "@/lib/listing-mother";
import { listingMotherPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type MotherPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): MotherViewKind {
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
    return listing.id === MOTHER_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === MOTHER_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === MOTHER_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === MOTHER_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeMother(listing)) {
    return "owned";
  }
  return "physical";
}

function motherSheetForId(id: string, motherIds: string[]): MotherViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isMother: listing ? isListingMotherOverlay(listing.id, motherIds) : false,
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
}: MotherPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const motherIds = parseMotherListingIds(jar.get(MOTHER_COOKIE_NAME)?.value);
  const sheet = motherSheetForId(id, motherIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: MOTHER_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a mother note on.",
      path: listingMotherPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: MOTHER_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a mother note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take a mother note. Mother honesty is for the unnamed LP."
            : sheet.kind === "jewels"
              ? "Empty jewels do not take a mother note. Mother honesty is for the unnamed LP."
              : sheet.kind === "chair"
                ? "A chair does not take a mother note. Mother honesty is for the unnamed LP."
                : sheet.kind === "owned"
                  ? "A mother note is for the unnamed LP. Another overlay already owns that listing."
                  : "A file does not take a mother note. A mother note is for the LP on the table.",
      path: listingMotherPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not mother it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not mother it. Still a skip. Still unnamed. Still tote. Not eccentric. Not mistrack. Not vacuum.`,
    path: listingMotherPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingMotherPage({ params }: MotherPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const motherIds = parseMotherListingIds(jar.get(MOTHER_COOKIE_NAME)?.value);
  const sheet = motherSheetForId(id, motherIds);

  return <ListingMotherView sheet={sheet} motherIds={motherIds} />;
}
