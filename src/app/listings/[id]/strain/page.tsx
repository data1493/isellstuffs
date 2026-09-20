import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingStrainView,
  type StrainViewKind,
  type StrainViewSheet,
} from "@/components/listing-strain-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  STRAIN_BOY_ID,
  STRAIN_CDR_ID,
  STRAIN_CHAIR_ID,
  STRAIN_COOKIE_NAME,
  STRAIN_REFUSE_COPY,
  canTapeStrain,
  isListingStrainOverlay,
  parseStrainListingIds,
} from "@/lib/listing-strain";
import { listingHubName } from "@/lib/listing-display";
import { listingStrainPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StrainPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): StrainViewKind {
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
    return listing.id === STRAIN_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === STRAIN_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === STRAIN_BOY_ID) {
    return "boy";
  }
  if (listing.id === STRAIN_CDR_ID) {
    return "cdr";
  }
  if (!canTapeStrain(listing)) {
    return "owned";
  }
  return "physical";
}

function strainSheetForId(id: string, strainIds: string[]): StrainViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isStrain: listing ? isListingStrainOverlay(listing.id, strainIds) : false,
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
}: StrainPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const strainIds = parseStrainListingIds(jar.get(STRAIN_COOKIE_NAME)?.value);
  const sheet = strainSheetForId(id, strainIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: STRAIN_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a strain note on.",
      path: listingStrainPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: STRAIN_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a strain note."
          : sheet.kind === "boy"
            ? "A Game Boy does not take a strain note. Strain is a cable-pile note."
            : sheet.kind === "cdr"
              ? "A burned disc does not take a strain note. Strain is a cable-pile note."
              : sheet.kind === "chair"
                ? "A chair does not take a strain note. Strain is a cable-pile note."
                : sheet.kind === "owned"
                  ? "A strain note is for the mystery cable drawer. Another overlay already owns that listing."
                  : "A file does not take a strain note. A strain note is for the cable drawer on the table.",
      path: listingStrainPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not strain them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not strain them. Still mystery USB. Still a forgotten charger. Still tote. Not loom. Not braid. Not jumper.`,
    path: listingStrainPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingStrainPage({ params }: StrainPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const strainIds = parseStrainListingIds(jar.get(STRAIN_COOKIE_NAME)?.value);
  const sheet = strainSheetForId(id, strainIds);

  return <ListingStrainView sheet={sheet} strainIds={strainIds} />;
}
