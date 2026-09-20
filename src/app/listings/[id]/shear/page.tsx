import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingShearView,
  type ShearViewKind,
  type ShearViewSheet,
} from "@/components/listing-shear-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SHEAR_CHAIR_ID,
  SHEAR_COOKIE_NAME,
  SHEAR_LID_ID,
  SHEAR_REFUSE_COPY,
  SHEAR_SOLES_ID,
  canTapeShear,
  isListingShearOverlay,
  parseShearListingIds,
} from "@/lib/listing-shear";
import { listingShearPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ShearPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ShearViewKind {
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
    return listing.id === SHEAR_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === SHEAR_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === SHEAR_SOLES_ID) {
    return "soles";
  }
  if (listing.id === SHEAR_LID_ID) {
    return "lid";
  }
  if (!canTapeShear(listing)) {
    return "owned";
  }
  return "physical";
}

function shearSheetForId(id: string, shearIds: string[]): ShearViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isShear: listing ? isListingShearOverlay(listing.id, shearIds) : false,
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
}: ShearPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const shearIds = parseShearListingIds(jar.get(SHEAR_COOKIE_NAME)?.value);
  const sheet = shearSheetForId(id, shearIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SHEAR_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a shear note on.",
      path: listingShearPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SHEAR_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a shear note."
          : sheet.kind === "soles"
            ? "Split soles do not take a shear note. Shear honesty is for the windbreaker."
            : sheet.kind === "lid"
              ? "A lid does not take a shear note. Shear honesty is for the windbreaker."
              : sheet.kind === "chair"
                ? "A chair does not take a shear note. Shear honesty is for the windbreaker."
                : sheet.kind === "owned"
                  ? "A shear note is for the windbreaker. Another overlay already owns that listing."
                  : "A file does not take a shear note. A shear note is for the jacket on the table.",
      path: listingShearPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not shear it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not shear it. Still mint-green. Still smells like a car. Still tote. Not singe. Not tenter. Not calender.`,
    path: listingShearPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingShearPage({ params }: ShearPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const shearIds = parseShearListingIds(jar.get(SHEAR_COOKIE_NAME)?.value);
  const sheet = shearSheetForId(id, shearIds);

  return <ListingShearView sheet={sheet} shearIds={shearIds} />;
}
