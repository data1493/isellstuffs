import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCvtView,
  type CvtViewKind,
  type CvtViewSheet,
} from "@/components/listing-cvt-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CVT_CHAIR_ID,
  CVT_COOKIE_NAME,
  CVT_PACK_ID,
  CVT_PDF_ID,
  CVT_REFUSE_COPY,
  canTapeCvt,
  isListingCvtOverlay,
  parseCvtListingIds,
} from "@/lib/listing-cvt";
import { listingCvtPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CvtPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CvtViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === CVT_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === CVT_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === CVT_PACK_ID) {
    return "pack";
  }
  if (listing.id === CVT_PDF_ID) {
    return "pdf";
  }
  if (!canTapeCvt(listing)) {
    return "owned";
  }
  return "digital";
}

function cvtSheetForId(
  id: string,
  cvtIds: string[],
): CvtViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCvt: listing
      ? isListingCvtOverlay(listing.id, cvtIds)
      : false,
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
}: CvtPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const cvtIds = parseCvtListingIds(
    jar.get(CVT_COOKIE_NAME)?.value,
  );
  const sheet = cvtSheetForId(id, cvtIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CVT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a cvt note on.",
      path: listingCvtPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: CVT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a cvt note."
          : sheet.kind === "chair"
            ? "A chair does not take a cvt note. Cvt honesty is for the booth font."
            : sheet.kind === "pack"
              ? "A sample pack does not take a cvt note. Cvt honesty is for the booth font."
              : sheet.kind === "pdf"
                ? "A junk PDF does not take a cvt note. Cvt honesty is for the booth font."
                : sheet.kind === "owned"
                  ? "A cvt note is for the booth font. Another overlay already owns that listing."
                  : "A Game Boy does not take a cvt note. Cvt honesty is for the booth font.",
      path: listingCvtPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not cvt it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not cvt it. Still two weights. Still almost-bold. Still tote. Not gdef. Not gsub. Not raster.`,
    path: listingCvtPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCvtPage({
  params,
}: CvtPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const cvtIds = parseCvtListingIds(
    jar.get(CVT_COOKIE_NAME)?.value,
  );
  const sheet = cvtSheetForId(id, cvtIds);

  return <ListingCvtView sheet={sheet} cvtIds={cvtIds} />;
}
