import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingConvertView,
  type ConvertViewKind,
  type ConvertViewSheet,
} from "@/components/listing-convert-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CONVERT_COOKIE_NAME,
  CONVERT_REFUSE_COPY,
  isListingConvertOverlay,
  parseConvertListingIds,
} from "@/lib/listing-convert";
import { listingConvertPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ConvertPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ConvertViewKind {
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

function convertSheetForId(id: string, convertIds: string[]): ConvertViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isConvert: listing ? isListingConvertOverlay(listing.id, convertIds) : false,
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
}: ConvertPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const convertIds = parseConvertListingIds(jar.get(CONVERT_COOKIE_NAME)?.value);
  const sheet = convertSheetForId(id, convertIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CONVERT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a convert on.",
      path: listingConvertPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: CONVERT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a LUT convert."
          : "A lamp does not take a convert. Format honesty is for a file on the digital lot.",
      path: listingConvertPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I don't convert · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The cubes stay .cube. Grade is I don't grade. Foundry is a booth license. Still tote.`,
    path: listingConvertPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingConvertPage({ params }: ConvertPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const convertIds = parseConvertListingIds(jar.get(CONVERT_COOKIE_NAME)?.value);
  const sheet = convertSheetForId(id, convertIds);

  return <ListingConvertView sheet={sheet} convertIds={convertIds} />;
}
