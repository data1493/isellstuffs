import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGradeView,
  type GradeViewKind,
  type GradeViewSheet,
} from "@/components/listing-grade-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GRADE_COOKIE_NAME,
  GRADE_REFUSE_COPY,
  isListingGradeOverlay,
  parseGradeListingIds,
} from "@/lib/listing-grade";
import { listingGradePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GradePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GradeViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
    return listing.status === "file-gone" ? "file-gone" : "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function gradeSheetForId(id: string, gradeIds: string[]): GradeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGrade: listing ? isListingGradeOverlay(listing.id, gradeIds) : false,
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
}: GradePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const gradeIds = parseGradeListingIds(jar.get(GRADE_COOKIE_NAME)?.value);
  const sheet = gradeSheetForId(id, gradeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GRADE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a grade on.",
      path: listingGradePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: GRADE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a color grade."
          : "A lamp does not take a grade. As-shot honesty is for a file on the digital lot.",
      path: listingGradePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I don't grade your lot · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Parking-lot LUTs stay as-shot. Stick is no email. Still tote.`,
    path: listingGradePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGradePage({ params }: GradePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const gradeIds = parseGradeListingIds(jar.get(GRADE_COOKIE_NAME)?.value);
  const sheet = gradeSheetForId(id, gradeIds);

  return <ListingGradeView sheet={sheet} gradeIds={gradeIds} />;
}
