import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCrushView,
  type CrushViewKind,
  type CrushViewSheet,
} from "@/components/listing-crush-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CRUSH_COOKIE_NAME,
  CRUSH_REFUSE_COPY,
  isListingCrushOverlay,
  parseCrushListingIds,
} from "@/lib/listing-crush";
import { listingCrushPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CrushPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CrushViewKind {
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

function crushSheetForId(id: string, crushIds: string[]): CrushViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCrush: listing ? isListingCrushOverlay(listing.id, crushIds) : false,
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
}: CrushPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const crushIds = parseCrushListingIds(jar.get(CRUSH_COOKIE_NAME)?.value);
  const sheet = crushSheetForId(id, crushIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CRUSH_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a crush note on.",
      path: listingCrushPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: CRUSH_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a crush note."
          : "A CD-R does not take a crush note. Crush honesty is for a file on the digital lot.",
      path: listingCrushPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not crush it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not crush it. Twelve shots. Still a zip. Still tote. Not tune. Not a mix desk. Not norm.`,
    path: listingCrushPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCrushPage({ params }: CrushPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const crushIds = parseCrushListingIds(jar.get(CRUSH_COOKIE_NAME)?.value);
  const sheet = crushSheetForId(id, crushIds);

  return <ListingCrushView sheet={sheet} crushIds={crushIds} />;
}
